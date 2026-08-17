using MedSim.Application.DTOs;
using MedSim.Application.Services;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimulationController : ControllerBase
{
    private readonly MedSimDbContext _context;
    private readonly IProceduralGeneratorService _generatorService;

    public SimulationController(MedSimDbContext context, IProceduralGeneratorService generatorService)
    {
        _context = context;
        _generatorService = generatorService;
    }

    [HttpGet("departments")]
    public async Task<ActionResult<List<DepartmentDto>>> GetDepartments()
    {
        var departments = await _context.Departments
            .OrderBy(d => d.Year)
            .ThenBy(d => d.Name)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Year = d.Year
            })
            .ToListAsync();

        return Ok(departments);
    }

    [HttpGet("cases")]
    public async Task<ActionResult<List<MedicalCaseDto>>> GetCases()
    {
        var cases = await _context.MedicalCases
            .Include(c => c.Stages)
                .ThenInclude(s => s.Options)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new MedicalCaseDto
            {
                Id = c.Id,
                DepartmentId = c.DepartmentId,
                Title = c.Title,
                InitialText = c.InitialText,
                IsProcedural = c.IsProcedural,
                Stages = c.Stages.OrderBy(s => s.OrderIndex).Select(s => new CaseStageDto
                {
                    Id = s.Id,
                    Text = s.Text,
                    OrderIndex = s.OrderIndex,
                    Options = s.Options.Select(o => new CaseOptionDto
                    {
                        Id = o.Id,
                        Text = o.Text,
                        IsCorrect = o.IsCorrect,
                        Feedback = o.Feedback
                    }).ToList()
                }).ToList()
            })
            .ToListAsync();

        return Ok(cases);
    }

    [HttpPost("generate")]
    public async Task<ActionResult<List<MedicalCaseDto>>> GenerateCases([FromBody] GenerateCaseRequest request)
    {
        var department = await _context.Departments.FirstOrDefaultAsync(d => d.Name == request.DepartmentName);
        if (department == null)
            return BadRequest("Klinik branş bulunamadı.");

        var generatedCases = new List<MedicalCaseDto>();

        for (int i = 0; i < request.Count; i++)
        {
            var newCase = await _generatorService.GenerateCaseAsync(department.Name, department.Id);
            // Benzersizliği sağlamak için ufak oynamalar yapabiliriz
            newCase.Title += $" - Vaka {DateTime.UtcNow.Ticks % 1000}";
            generatedCases.Add(newCase);
        }

        // İsteğe bağlı olarak DB'ye kaydedilebilir, şimdilik Frontend'e dönüyoruz.

        return Ok(generatedCases);
    }
}
