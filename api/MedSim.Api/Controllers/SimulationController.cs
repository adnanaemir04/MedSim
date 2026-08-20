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
            .Include(d => d.Topics)
                .ThenInclude(t => t.SubTopics)
            .OrderBy(d => d.Year)
            .ThenBy(d => d.Name)
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Year = d.Year,
                Topics = d.Topics.Select(t => new TopicDto
                {
                    Id = t.Id,
                    Name = t.Name,
                    SubTopics = t.SubTopics.Select(s => new SubTopicDto
                    {
                        Id = s.Id,
                        Name = s.Name
                    }).ToList()
                }).ToList()
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
                SubTopicId = c.SubTopicId,
                SubTopicName = c.SubTopic != null ? c.SubTopic.Name : "",
                DepartmentName = c.Department.Name,
                Title = c.Title,
                InitialText = c.InitialText,
                IsProcedural = c.IsProcedural,
                Difficulty = c.Difficulty,
                DifficultyScore = c.DifficultyScore,
                DifficultyReason = c.DifficultyReason,
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

        SubTopic? subTopic = null;
        if (!string.IsNullOrEmpty(request.SubTopicName))
        {
            subTopic = await _context.SubTopics.FirstOrDefaultAsync(s => s.Name == request.SubTopicName);
        }

        var generatedCases = new List<MedicalCaseDto>();

        for (int i = 0; i < request.Count; i++)
        {
            var newCaseDto = await _generatorService.GenerateCaseAsync(department.Name, request.TopicName, request.SubTopicName, request.Difficulty);
            newCaseDto.Id = Guid.NewGuid();
            newCaseDto.DepartmentId = department.Id;
            newCaseDto.SubTopicId = subTopic?.Id;
            newCaseDto.Title += $" - Vaka {DateTime.UtcNow.Ticks % 1000}";
            
            var newCase = new MedicalCase
            {
                Id = newCaseDto.Id,
                DepartmentId = newCaseDto.DepartmentId,
                SubTopicId = newCaseDto.SubTopicId,
                Title = newCaseDto.Title,
                InitialText = newCaseDto.InitialText,
                IsProcedural = newCaseDto.IsProcedural,
                Difficulty = newCaseDto.Difficulty,
                DifficultyScore = newCaseDto.DifficultyScore,
                DifficultyReason = newCaseDto.DifficultyReason,
                Stages = newCaseDto.Stages.Select(s => new CaseStage
                {
                    Id = s.Id,
                    OrderIndex = s.OrderIndex,
                    Text = s.Text,
                    Options = s.Options.Select(o => new CaseOption
                    {
                        Id = o.Id,
                        Text = o.Text,
                        IsCorrect = o.IsCorrect,
                        Feedback = o.Feedback
                    }).ToList()
                }).ToList()
            };

            _context.MedicalCases.Add(newCase);
            generatedCases.Add(newCaseDto);
        }

        await _context.SaveChangesAsync();

        return Ok(generatedCases);
    }
}
