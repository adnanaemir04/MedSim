using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace MedSim.Infrastructure.Repositories;

public class TusRepository : ITusRepository
{
    private readonly MedSimDbContext _context;
    private readonly IMemoryCache _cache;

    public TusRepository(MedSimDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<IEnumerable<object>> GetSubjectsAsync()
    {
        return await _context.TusQuestions
            .GroupBy(q => q.Subject)
            .Select(g => new
            {
                Name = g.Key,
                QuestionCount = g.Count()
            })
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<IEnumerable<object>> GetQuestionsAsync(int count, string? subject, string? difficulty, string mode, string? email)
    {
        var isClassicMode = mode.Equals("classic", StringComparison.OrdinalIgnoreCase);
        
        var query = _context.TusQuestions
            .Include(q => q.TusKnowledge)
            .AsQueryable();

        if (isClassicMode)
        {
            query = query.Where(q => q.IsClassic && q.IsApproved);
        }
        else
        {
            query = query.Where(q => !q.IsClassic);
        }

        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(q => q.Subject == subject);
        }

        if (!string.IsNullOrEmpty(difficulty) && difficulty != "Tümü")
        {
            query = query.Where(q => q.Difficulty == difficulty);
        }

        List<TusQuestion> selectedQuestions = new List<TusQuestion>();

        // If classic mode, prioritize spaced repetition due questions
        if (isClassicMode && !string.IsNullOrEmpty(email))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user != null)
            {
                // Find knowledge points that are due
                var dueKnowledgeIds = await _context.TusKnowledgeProgresses
                    .Where(p => p.UserId == user.Id && p.NextReviewAt <= DateTime.UtcNow)
                    .Select(p => p.TusKnowledgeId)
                    .ToListAsync();

                if (dueKnowledgeIds.Any())
                {
                    var dueQuestions = await query
                        .Where(q => q.TusKnowledgeId.HasValue && dueKnowledgeIds.Contains(q.TusKnowledgeId.Value))
                        .OrderBy(x => EF.Functions.Random())
                        .Take(count)
                        .ToListAsync();

                    selectedQuestions.AddRange(dueQuestions);
                }
            }
        }

        // If we still need more questions, fill the rest
        if (selectedQuestions.Count < count)
        {
            var needed = count - selectedQuestions.Count;
            var existingIds = selectedQuestions.Select(q => q.Id).ToList();

            var extraQuestions = await query
                .Where(q => !existingIds.Contains(q.Id))
                .OrderBy(q => EF.Functions.Random())
                .Take(needed)
                .ToListAsync();

            selectedQuestions.AddRange(extraQuestions);
        }

        // Return mapped questions
        return selectedQuestions.Select(q => new
        {
            q.Id,
            q.QuestionText,
            q.OptionA,
            q.OptionB,
            q.OptionC,
            q.OptionD,
            q.OptionE,
            q.Category,
            q.Subject,
            q.Difficulty,
            TusPearl = q.TusKnowledge != null ? q.TusKnowledge.KnowledgeText : "TUS İncisi: Bilgi veritabanından çekilemedi."
        }).ToList();
    }

    public async Task<object> SubmitAnswerAsync(string email, Guid questionId, string selectedOption, int durationSeconds)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var question = await _context.TusQuestions.FindAsync(questionId);
        if (question == null) throw new KeyNotFoundException("Soru bulunamadı.");

        bool isCorrect = question.CorrectOption.Equals(selectedOption, StringComparison.OrdinalIgnoreCase);

        var alreadySolved = await _context.TusSolvedQuestions
            .AnyAsync(t => t.UserId == user.Id && t.TusQuestionId == question.Id && t.IsCorrect);

        var solved = new TusSolvedQuestion
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TusQuestionId = question.Id,
            IsCorrect = isCorrect,
            SelectedOption = selectedOption,
            DurationSeconds = durationSeconds,
            SolvedAt = DateTime.UtcNow
        };

        _context.TusSolvedQuestions.Add(solved);
        if (isCorrect && !alreadySolved)
        {
            user.Points += 10;
        }

        var auditLog = new AuditLog
        {
            UserId = user.Id,
            Action = "TusQuestionSolved",
            Details = $"QuestionId: {question.Id}, IsCorrect: {isCorrect}"
        };
        _context.AuditLogs.Add(auditLog);


        // Spaced Repetition Logic for Classic TUS Questions
        if (question.TusKnowledgeId.HasValue)
        {
            var knowledgeId = question.TusKnowledgeId.Value;
            var progress = await _context.TusKnowledgeProgresses
                .FirstOrDefaultAsync(p => p.UserId == user.Id && p.TusKnowledgeId == knowledgeId);

            if (progress == null)
            {
                progress = new TusKnowledgeProgress
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    TusKnowledgeId = knowledgeId,
                    Views = 0,
                    CorrectCount = 0,
                    WrongCount = 0
                };
                _context.TusKnowledgeProgresses.Add(progress);
            }

            progress.Views++;
            if (isCorrect)
            {
                progress.CorrectCount++;
                if (progress.IntervalDays == 0) progress.IntervalDays = 1;
                else if (progress.IntervalDays == 1) progress.IntervalDays = 3;
                else if (progress.IntervalDays == 3) progress.IntervalDays = 7;
                else if (progress.IntervalDays == 7) progress.IntervalDays = 14;
                else progress.IntervalDays = 30;

                progress.NextReviewAt = DateTime.UtcNow.AddDays(progress.IntervalDays);
            }
            else
            {
                progress.WrongCount++;
                progress.IntervalDays = 1; // Reset to 1 day on mistake
                progress.NextReviewAt = DateTime.UtcNow.AddDays(1);
            }
        }

        await _context.SaveChangesAsync();

        return new
        {
            isCorrect = isCorrect,
            correctOption = question.CorrectOption,
            explanation = question.Explanation,
            points = user.Points
        };
    }

    public async Task<object> GetStatsAsync(string email, string? subject)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var query = _context.TusSolvedQuestions.AsNoTracking().Where(t => t.UserId == user.Id);
        
        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(t => t.TusQuestion.Subject == subject);
        }

        var solvedCount = await query.CountAsync();
        var correctCount = await query.CountAsync(t => t.IsCorrect);
        
        var wrongCount = solvedCount - correctCount;
        var accuracy = solvedCount > 0 ? (int)Math.Round((double)correctCount / solvedCount * 100) : 0;

        // Calculate Case Success Rate
        var caseQuery = _context.SolvedCases
            .AsNoTracking()
            .Include(s => s.MedicalCase)
            .ThenInclude(c => c.Stages)
            .Where(s => s.UserId == user.Id);

        if (!string.IsNullOrEmpty(subject))
        {
            caseQuery = caseQuery.Where(s => s.MedicalCase.Department.Name == subject);
        }

        var solvedCases = await caseQuery.ToListAsync();
        double caseSuccessSum = 0;
        int caseSuccessCount = 0;

        foreach (var c in solvedCases)
        {
            int maxPoints = c.MedicalCase.Stages.Count * 10;
            if (maxPoints > 0)
            {
                caseSuccessSum += (double)c.EarnedPoints / maxPoints * 100;
                caseSuccessCount++;
            }
        }

        double caseSuccessRate = caseSuccessCount > 0 ? caseSuccessSum / caseSuccessCount : accuracy;

        int overallSuccessRate = (int)Math.Round((caseSuccessRate * 0.6) + (accuracy * 0.4));
        if (caseSuccessCount == 0 && solvedCount == 0)
        {
            overallSuccessRate = 0;
        }
        else if (caseSuccessCount == 0)
        {
            overallSuccessRate = accuracy;
        }
        else if (solvedCount == 0)
        {
            overallSuccessRate = (int)Math.Round(caseSuccessRate);
        }

        var queryWithDuration = query.Where(t => t.DurationSeconds > 0);
        var hasDuration = await queryWithDuration.AnyAsync();
        
        var averageTime = hasDuration
            ? (int)Math.Round(await queryWithDuration.Select(t => (double)t.DurationSeconds).AverageAsync())
            : 0;

        return new
        {
            totalSolved = solvedCount,
            correctCount,
            wrongCount,
            successRate = overallSuccessRate,
            accuracy = accuracy,
            averageTime = averageTime
        };
    }

    public async Task<object> GetSolvedQuestionsListAsync(string email, string? subject, int page, int pageSize, string? difficulty, string? sortOrder)
    {
        page = Math.Max(1, page);
        pageSize = Math.Min(pageSize, 50);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var query = _context.TusSolvedQuestions
            .AsNoTracking()
            .Include(t => t.TusQuestion)
            .Where(t => t.UserId == user.Id)
            .AsQueryable();

        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(t => t.TusQuestion.Subject == subject);
        }

        if (!string.IsNullOrEmpty(difficulty))
        {
            query = query.Where(t => t.TusQuestion.Difficulty == difficulty);
        }

        var totalCount = await query.CountAsync();

        if (sortOrder?.ToLower() == "asc")
        {
            query = query.OrderBy(t => t.SolvedAt);
        }
        else
        {
            query = query.OrderByDescending(t => t.SolvedAt);
        }

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                t.Id,
                t.IsCorrect,
                t.SolvedAt,
                QuestionText = t.TusQuestion.QuestionText,
                Subject = t.TusQuestion.Subject,
                Category = t.TusQuestion.Category,
                CorrectOption = t.TusQuestion.CorrectOption,
                Explanation = t.TusQuestion.Explanation,
                Difficulty = t.TusQuestion.Difficulty,
                SelectedOption = t.SelectedOption,
                OptionA = t.TusQuestion.OptionA,
                OptionB = t.TusQuestion.OptionB,
                OptionC = t.TusQuestion.OptionC,
                OptionD = t.TusQuestion.OptionD,
                OptionE = t.TusQuestion.OptionE
            })
            .ToListAsync();

        return new
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }

    public async Task<IEnumerable<object>> GetLeaderboardAsync()
    {
        if (!_cache.TryGetValue("tus_leaderboard", out IEnumerable<object>? leaderboard))
        {
            leaderboard = await _context.Users
                .AsNoTracking()
                .Select(u => new
                {
                    u.Id,
                    u.Nickname,
                    u.Avatar,
                    u.Points,
                    TusCorrects = u.TusSolvedQuestions.Where(t => t.IsCorrect).Select(t => t.TusQuestionId).Distinct().Count()
                })
                .OrderByDescending(u => u.TusCorrects)
                .Take(50)
                .ToListAsync();
            
            _cache.Set("tus_leaderboard", leaderboard, TimeSpan.FromMinutes(1));
        }
        return leaderboard ?? new List<object>();
    }

    public async Task<TusQuestion?> GetQuestionByIdAsync(Guid id)
    {
        return await _context.TusQuestions.FindAsync(id);
    }
}
