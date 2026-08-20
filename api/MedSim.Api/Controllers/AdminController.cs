using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BCrypt.Net;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly MedSimDbContext _context;

    public AdminController(MedSimDbContext context)
    {
        _context = context;
    }

    [HttpGet("users-stats")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetUsersStats()
    {
        var requestorEmail = User.FindFirstValue(ClaimTypes.Email);
        var requestor = await _context.Users.FirstOrDefaultAsync(u => u.Email == requestorEmail);

        var users = await _context.Users
            .AsNoTracking()
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
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var requestorEmail = User.FindFirstValue(ClaimTypes.Email);
        var requestor = await _context.Users.FirstOrDefaultAsync(u => u.Email == requestorEmail);

        var logs = await _context.AuditLogs
            .AsNoTracking()
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
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
    {
        var requestorEmail = User.FindFirstValue(ClaimTypes.Email);
        var requestor = await _context.Users.FirstOrDefaultAsync(u => u.Email == requestorEmail);
        if (requestor == null) return Unauthorized();

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            return BadRequest("Bu e-posta adresine sahip bir kullanıcı zaten mevcut.");

        var newAdmin = new User
        {
            Email = dto.Email,
            Nickname = dto.Nickname,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
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
