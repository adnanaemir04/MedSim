using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly MedSimDbContext _context;

    public AdminController(MedSimDbContext context)
    {
        _context = context;
    }

    [HttpGet("users-stats")]
    public async Task<IActionResult> GetUsersStats([FromHeader(Name = "User-Email")] string requestorEmail)
    {
        var requestor = await _context.Users.FirstOrDefaultAsync(u => u.Email == requestorEmail);
        if (requestor == null || (requestor.Role != "SuperAdmin" && requestor.Role != "Admin"))
            return Unauthorized("Bu işlem için yetkiniz yok.");

        var users = await _context.Users
            .Include(u => u.TusSolvedQuestions)
            .Include(u => u.SolvedCases)
            .ToListAsync();

        var statsList = users.Select(u => new UserStatsDto
        {
            UserId = u.Id,
            Email = u.Email,
            Nickname = u.Nickname,
            Role = u.Role,
            
            TotalTusSolved = u.TusSolvedQuestions.Count,
            CorrectTus = u.TusSolvedQuestions.Count(q => q.IsCorrect),
            IncorrectTus = u.TusSolvedQuestions.Count(q => !q.IsCorrect),
            
            TotalCasesSolved = u.SolvedCases.Count,
            SuccessfulCases = u.SolvedCases.Count(c => c.IsSolved),
            FailedCases = u.SolvedCases.Count(c => !c.IsSolved)
        }).ToList();

        return Ok(statsList);
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs([FromHeader(Name = "User-Email")] string requestorEmail)
    {
        var requestor = await _context.Users.FirstOrDefaultAsync(u => u.Email == requestorEmail);
        if (requestor == null || (requestor.Role != "SuperAdmin" && requestor.Role != "Admin"))
            return Unauthorized("Bu işlem için yetkiniz yok.");

        var logs = await _context.AuditLogs
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Take(100)
            .Select(l => new AuditLogDto
            {
                Id = l.Id,
                UserEmail = l.User.Email,
                Action = l.Action,
                Details = l.Details,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpPost("create-admin")]
    public async Task<IActionResult> CreateAdmin([FromHeader(Name = "User-Email")] string requestorEmail, [FromBody] CreateAdminDto dto)
    {
        var requestor = await _context.Users.FirstOrDefaultAsync(u => u.Email == requestorEmail);
        if (requestor == null || requestor.Role != "SuperAdmin")
            return Unauthorized("Sadece SuperAdmin yeni bir yönetici oluşturabilir.");

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            return BadRequest("Bu e-posta adresine sahip bir kullanıcı zaten mevcut.");

        var newAdmin = new User
        {
            Email = dto.Email,
            Nickname = dto.Nickname,
            PasswordHash = dto.Password, // WARNING: In production, hash this password!
            Role = "Admin",
            Points = 1000, // starting points
            Avatar = "👑"
        };

        _context.Users.Add(newAdmin);
        
        // Log action
        var auditLog = new AuditLog
        {
            UserId = requestor.Id,
            Action = "AdminCreated",
            Details = $"SuperAdmin created a new Admin with email: {dto.Email}"
        };
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Yönetici başarıyla oluşturuldu." });
    }
}
