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

    public TusController(MedSimDbContext context)
    {
        _context = context;
    }

    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions([FromQuery] int count = 5)
    {
        var questions = await _context.TusQuestions
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
    public async Task<IActionResult> GetStats([FromQuery] string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return NotFound();

        var solvedCount = await _context.TusSolvedQuestions.CountAsync(t => t.UserId == user.Id);
        var correctCount = await _context.TusSolvedQuestions.CountAsync(t => t.UserId == user.Id && t.IsCorrect);
        
        var wrongCount = solvedCount - correctCount;
        var percentage = solvedCount > 0 ? (int)Math.Round((double)correctCount / solvedCount * 100) : 0;

        return Ok(new
        {
            totalSolved = solvedCount,
            correctCount,
            wrongCount,
            successRate = percentage
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
}

public class TusAnswerRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid QuestionId { get; set; }
    public string SelectedOption { get; set; } = string.Empty;
}
