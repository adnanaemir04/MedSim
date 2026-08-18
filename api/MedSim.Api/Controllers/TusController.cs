using MedSim.Application.Services;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TusController : ControllerBase
{
    private readonly MedSimDbContext _context;
    private readonly IProceduralGeneratorService _proceduralGeneratorService;

    public TusController(MedSimDbContext context, IProceduralGeneratorService proceduralGeneratorService)
    {
        _context = context;
        _proceduralGeneratorService = proceduralGeneratorService;
    }

    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        var subjects = await _context.TusQuestions
            .GroupBy(q => q.Subject)
            .Select(g => new
            {
                Name = g.Key,
                QuestionCount = g.Count()
            })
            .OrderBy(s => s.Name)
            .ToListAsync();

        return Ok(subjects);
    }

    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions([FromQuery] int count = 5, [FromQuery] string? subject = null)
    {
        var query = _context.TusQuestions.AsQueryable();

        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(q => q.Subject == subject);
        }

        var questions = await query
            .OrderBy(q => EF.Functions.Random())
            .Take(count)
            .Select(q => new
            {
                q.Id,
                q.QuestionText,
                q.OptionA,
                q.OptionB,
                q.OptionC,
                q.OptionD,
                q.OptionE,
                q.Category,
                q.Subject
            })
            .ToListAsync();

        return Ok(questions);
    }

    [HttpPost("submit-answer")]
    public async Task<IActionResult> SubmitAnswer([FromBody] TusAnswerRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var question = await _context.TusQuestions.FindAsync(request.QuestionId);
        if (question == null) return NotFound("Soru bulunamadı.");

        bool isCorrect = question.CorrectOption.Equals(request.SelectedOption, StringComparison.OrdinalIgnoreCase);

        var solved = new TusSolvedQuestion
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TusQuestionId = question.Id,
            IsCorrect = isCorrect,
            SolvedAt = DateTime.UtcNow
        };

        _context.TusSolvedQuestions.Add(solved);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            isCorrect = isCorrect,
            correctOption = question.CorrectOption,
            explanation = question.Explanation
        });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] string email, [FromQuery] string? subject = null)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        var query = _context.TusSolvedQuestions.Where(t => t.UserId == user.Id);
        
        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(t => t.Question.Subject == subject);
        }

        var solvedCount = await query.CountAsync();
        var correctCount = await query.CountAsync(t => t.IsCorrect);
        
        var wrongCount = solvedCount - correctCount;
        var percentage = solvedCount > 0 ? (int)Math.Round((double)correctCount / solvedCount * 100) : 0;

        return Ok(new
        {
            totalSolved = solvedCount,
            correctCount,
            wrongCount,
            successRate = percentage,
            accuracy = percentage // Adding accuracy for the UI
        });
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        var leaderboard = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.Nickname,
                u.Avatar,
                u.Points,
                TusCorrects = u.TusSolvedQuestions.Count(t => t.IsCorrect)
            })
            .OrderByDescending(u => u.TusCorrects)
            .Take(50)
            .ToListAsync();

        return Ok(leaderboard);
    }

    [HttpPost("explain-concepts")]
    public async Task<IActionResult> ExplainConcepts([FromBody] ExplainConceptRequest request)
    {
        var question = await _context.TusQuestions.FindAsync(request.QuestionId);
        if (question == null) return NotFound("Soru bulunamadı.");

        try
        {
            var explanation = await _proceduralGeneratorService.ExplainTusConceptsAsync(
                question.QuestionText,
                question.OptionA,
                question.OptionB,
                question.OptionC,
                question.OptionD,
                question.OptionE,
                question.CorrectOption,
                question.Explanation
            );

            return Ok(new { explanation });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Kavram açıklaması üretilemedi: " + ex.Message });
        }
    }
    [HttpPost("generate-questions")]
    public async Task<IActionResult> GenerateQuestions([FromBody] GenerateTusQuestionsRequest request)
    {
        try
        {
            var questions = await _proceduralGeneratorService.GenerateTusQuestionsAsync(request.Subject, request.Count);
            
            if (questions != null && questions.Any())
            {
                _context.TusQuestions.AddRange(questions);
                await _context.SaveChangesAsync();
                return Ok(new { message = $"{questions.Count} adet soru üretildi ve kaydedildi.", questions });
            }
            
            return BadRequest("Soru üretilemedi.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Soru üretimi sırasında hata oluştu: " + ex.Message });
        }
    }
}

public class TusAnswerRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid QuestionId { get; set; }
    public string SelectedOption { get; set; } = string.Empty;
}

public class ExplainConceptRequest
{
    public Guid QuestionId { get; set; }
}

public class GenerateTusQuestionsRequest
{
    public string Subject { get; set; } = string.Empty;
    public int Count { get; set; } = 5;
}
