using MedSim.Application.DTOs;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly MedSimDbContext _context;

    public ProfileController(MedSimDbContext context)
    {
        _context = context;
    }

    [HttpGet("solved-cases")]
    public async Task<IActionResult> GetSolvedCases(
        [FromQuery] string email, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? subject = null,
        [FromQuery] int? year = null)
    {
        if (string.IsNullOrEmpty(email))
            return BadRequest("Email parametresi zorunludur.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return NotFound("Kullanıcı bulunamadı.");

        var query = _context.SolvedCases
            .Include(sc => sc.MedicalCase)
            .ThenInclude(mc => mc.Department)
            .Where(sc => sc.UserId == user.Id)
            .AsQueryable();

        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(sc => sc.MedicalCase.Department.Name == subject);
        }

        if (year.HasValue && year.Value > 0)
        {
            query = query.Where(sc => sc.MedicalCase.Department.Year == year.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(sc => sc.SolvedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(sc => new SolvedCaseDto
            {
                Id = sc.Id,
                MedicalCaseId = sc.MedicalCaseId,
                CaseTitle = sc.MedicalCase.Title,
                DepartmentName = sc.MedicalCase.Department.Name,
                DepartmentYear = sc.MedicalCase.Department.Year,
                IsSolved = sc.IsSolved,
                EarnedPoints = sc.EarnedPoints,
                SolvedAt = sc.SolvedAt
            })
            .ToListAsync();

        var result = new PagedResult<SolvedCaseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpPost("solve-case")]
    public async Task<IActionResult> SolveCase([FromBody] SolveCaseRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var medicalCase = await _context.MedicalCases.FindAsync(request.MedicalCaseId);
        if (medicalCase == null) return NotFound("Vaka bulunamadı.");

        // Check if already solved
        var existingSolve = await _context.SolvedCases
            .FirstOrDefaultAsync(sc => sc.UserId == user.Id && sc.MedicalCaseId == request.MedicalCaseId);

        if (existingSolve != null)
        {
            // Just update points if we want, or do nothing. We'll do nothing.
            return Ok(new { message = "Bu vaka zaten çözülmüş." });
        }

        var solvedCase = new MedSim.Domain.Entities.SolvedCase
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            MedicalCaseId = request.MedicalCaseId,
            EarnedPoints = request.Points,
            IsSolved = true,
            SolvedAt = DateTime.UtcNow
        };

        _context.SolvedCases.Add(solvedCase);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Vaka başarıyla kaydedildi." });
    }
}

public class SolveCaseRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid MedicalCaseId { get; set; }
    public int Points { get; set; }
}
