using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using MedSim.Application.DTOs.Analytics;
using Microsoft.EntityFrameworkCore;

using MedSim.Application.Interfaces;

namespace MedSim.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly MedSimDbContext _context;

    public AnalyticsService(MedSimDbContext context)
    {
        _context = context;
    }

    public async Task<KpiDto> GetKpisAsync(int days = 30)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);

        var totalUsers = await _context.Users.CountAsync();
        var activeUsers = await _context.AuditLogs
            .Where(a => a.Action == "Login" && a.CreatedAt >= cutoff)
            .Select(a => a.UserId)
            .Distinct()
            .CountAsync();

        var dailyActiveUsers = await _context.AuditLogs
            .Where(a => a.Action == "Login" && a.CreatedAt >= DateTime.UtcNow.AddDays(-1))
            .Select(a => a.UserId)
            .Distinct()
            .CountAsync();

        var totalSolved = await _context.TusSolvedQuestions.CountAsync();
        var dailySolved = await _context.TusSolvedQuestions
            .Where(s => s.SolvedAt >= DateTime.UtcNow.AddDays(-1))
            .CountAsync();

        var accuracyData = await _context.TusSolvedQuestions
            .GroupBy(s => 1)
            .Select(g => new {
                Total = g.Count(),
                Correct = g.Count(x => x.IsCorrect),
                TotalSeconds = g.Sum(x => x.DurationSeconds)
            })
            .FirstOrDefaultAsync();

        var avgAccuracy = accuracyData?.Total > 0 ? (double)accuracyData.Correct / accuracyData.Total * 100 : 0;
        var avgTime = accuracyData?.Total > 0 ? (double)accuracyData.TotalSeconds / accuracyData.Total : 0;
        var avgQuestionsPerUser = totalUsers > 0 ? (double)totalSolved / totalUsers : 0;

        var totalQuestions = await _context.TusQuestions.CountAsync();
        var classicCount = await _context.TusQuestions.CountAsync(q => q.IsClassic);
        var geminiCount = totalQuestions - classicCount;

        return new KpiDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            DailyActiveUsers = dailyActiveUsers,
            MonthlyActiveUsers = activeUsers, // Simplified
            TotalSolvedQuestions = totalSolved,
            DailySolvedQuestions = dailySolved,
            AverageAccuracy = Math.Round(avgAccuracy, 1),
            TotalQuestions = totalQuestions,
            GeminiQuestionCount = geminiCount,
            ClassicQuestionCount = classicCount,
            AverageSolveTimeSeconds = Math.Round(avgTime, 1),
            AverageQuestionsPerUser = Math.Round(avgQuestionsPerUser, 1)
        };
    }

    public async Task<List<ChartDataPoint>> GetUserGrowthAsync(int days = 30)
    {
        var cutoff = DateTime.UtcNow.AddDays(-days);

        // Approximation for user growth based on ID creation if not tracking CreatedAt on User
        // Since User entity lacks CreatedAt, we'll try to find first activity in AuditLog
        var rawGrowth = await _context.AuditLogs
            .Where(a => a.CreatedAt >= cutoff)
            .GroupBy(a => a.CreatedAt.Date)
            .Select(g => new 
            {
                Date = g.Key,
                Value = g.Select(x => x.UserId).Distinct().Count(), // daily active
                SecondaryValue = g.Count(x => x.Action == "Login") // logins
            })
            .OrderBy(x => x.Date)
            .ToListAsync();

        var growth = rawGrowth.Select(x => new ChartDataPoint
        {
            Name = x.Date.ToString("yyyy-MM-dd"),
            Value = x.Value,
            SecondaryValue = x.SecondaryValue
        }).ToList();

        return growth;
    }

    public async Task<List<SubjectRankingDto>> GetSubjectRankingsAsync()
    {
        var rankings = await _context.TusSolvedQuestions
            .Include(s => s.TusQuestion)
            .GroupBy(s => s.TusQuestion.Subject)
            .Select(g => new SubjectRankingDto
            {
                SubjectName = string.IsNullOrEmpty(g.Key) ? "Genel" : g.Key,
                TotalSolved = g.Count(),
                CorrectCount = g.Count(x => x.IsCorrect),
                IncorrectCount = g.Count(x => !x.IsCorrect),
                AverageSolveTimeSeconds = g.Average(x => x.DurationSeconds),
                Accuracy = g.Count() > 0 ? (double)g.Count(x => x.IsCorrect) / g.Count() * 100 : 0
            })
            .OrderByDescending(x => x.TotalSolved)
            .Take(15)
            .ToListAsync();

        return rankings;
    }

    public async Task<GeminiVsClassicComparisonDto> GetGeminiComparisonAsync()
    {
        var solvedData = await _context.TusSolvedQuestions
            .Include(s => s.TusQuestion)
            .GroupBy(s => s.TusQuestion.IsClassic)
            .Select(g => new
            {
                IsClassic = g.Key,
                Count = g.Count(),
                Correct = g.Count(x => x.IsCorrect),
                TotalTime = g.Sum(x => x.DurationSeconds)
            })
            .ToListAsync();

        var classic = solvedData.FirstOrDefault(x => x.IsClassic);
        var gemini = solvedData.FirstOrDefault(x => !x.IsClassic);

        return new GeminiVsClassicComparisonDto
        {
            ClassicSolvedCount = classic?.Count ?? 0,
            ClassicAccuracy = classic?.Count > 0 ? (double)classic.Correct / classic.Count * 100 : 0,
            ClassicAvgTime = classic?.Count > 0 ? (double)classic.TotalTime / classic.Count : 0,

            GeminiSolvedCount = gemini?.Count ?? 0,
            GeminiAccuracy = gemini?.Count > 0 ? (double)gemini.Correct / gemini.Count * 100 : 0,
            GeminiAvgTime = gemini?.Count > 0 ? (double)gemini.TotalTime / gemini.Count : 0
        };
    }
}
