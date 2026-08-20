using MedSim.Application.Services;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class TusAdminController : ControllerBase
{
    private readonly MedSimDbContext _context;
    private readonly IProceduralGeneratorService _proceduralGeneratorService;

    public TusAdminController(MedSimDbContext context, IProceduralGeneratorService proceduralGeneratorService)
    {
        _context = context;
        _proceduralGeneratorService = proceduralGeneratorService;
    }

    [HttpGet("knowledges")]
    public async Task<IActionResult> GetKnowledges([FromQuery] string? subject = null)
    {
        var query = _context.TusKnowledges
            .Include(k => k.Questions)
            .AsQueryable();

        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(k => k.Subject == subject);
        }

        var list = await query.ToListAsync();
        return Ok(list);
    }

    [HttpPost("knowledges")]
    public async Task<IActionResult> SaveKnowledge([FromBody] TusKnowledge request)
    {
        if (request.Id == Guid.Empty)
        {
            request.Id = Guid.NewGuid();
            _context.TusKnowledges.Add(request);
        }
        else
        {
            var existing = await _context.TusKnowledges.FindAsync(request.Id);
            if (existing == null) return NotFound("Knowledge not found.");

            existing.KnowledgeText = request.KnowledgeText;
            existing.Subject = request.Subject;
            existing.ImportanceScore = request.ImportanceScore;
            existing.RepetitionFrequency = request.RepetitionFrequency;
            existing.Sources = request.Sources;
            existing.IsActive = request.IsActive;
            
            _context.TusKnowledges.Update(existing);
        }

        await _context.SaveChangesAsync();
        return Ok(request);
    }

    [HttpDelete("knowledges/{id}")]
    public async Task<IActionResult> DeleteKnowledge(Guid id)
    {
        var existing = await _context.TusKnowledges.FindAsync(id);
        if (existing == null) return NotFound("Knowledge not found.");

        _context.TusKnowledges.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Knowledge and linked questions deleted." });
    }

    [HttpGet("questions/pending")]
    public async Task<IActionResult> GetPendingQuestions()
    {
        var pending = await _context.TusQuestions
            .Include(q => q.TusKnowledge)
            .Where(q => q.IsClassic && !q.IsApproved)
            .ToListAsync();
        return Ok(pending);
    }

    [HttpPost("questions/{id}/approve")]
    public async Task<IActionResult> ApproveQuestion(Guid id)
    {
        var question = await _context.TusQuestions.FindAsync(id);
        if (question == null) return NotFound("Question not found.");

        question.IsApproved = true;
        _context.TusQuestions.Update(question);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Question approved and active." });
    }

    [HttpPost("questions/{id}/reject")]
    public async Task<IActionResult> RejectQuestion(Guid id)
    {
        var question = await _context.TusQuestions.FindAsync(id);
        if (question == null) return NotFound("Question not found.");

        _context.TusQuestions.Remove(question);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Question rejected and deleted." });
    }

    [HttpPost("questions/{id}/toggle-active")]
    public async Task<IActionResult> ToggleActiveQuestion(Guid id)
    {
        var question = await _context.TusQuestions.FindAsync(id);
        if (question == null) return NotFound("Question not found.");

        question.IsApproved = !question.IsApproved; // Toggling approval acts as active/passive
        _context.TusQuestions.Update(question);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Question is now {(question.IsApproved ? "Active" : "Passive")}." });
    }

    [HttpPost("generate-classic-pipeline")]
    public async Task<IActionResult> GenerateClassicPipeline([FromBody] GenerateClassicPipelineRequest request)
    {
        try
        {
            var result = await _proceduralGeneratorService.GenerateClassicKnowledgeAndQuestionsAsync(
                request.Subject,
                request.TopicName,
                request.SubTopicName
            );

            // Save to database as pending
            _context.TusKnowledges.Add(result.Knowledge);
            _context.TusQuestions.AddRange(result.Questions);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "AI classic knowledge and questions generated successfully. Awaiting approval.",
                knowledge = result.Knowledge,
                questions = result.Questions
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "AI generation failed: " + ex.Message });
        }
    }
}

public class GenerateClassicPipelineRequest
{
    public string Subject { get; set; } = string.Empty;
    public string TopicName { get; set; } = string.Empty;
    public string SubTopicName { get; set; } = string.Empty;
}
