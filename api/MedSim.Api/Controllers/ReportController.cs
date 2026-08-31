using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using MedSim.Api.Hubs;
using System.Security.Claims;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly MedSimDbContext _context;
    private readonly IHubContext<MedSimHub> _hubContext;

    public ReportController(MedSimDbContext context, IHubContext<MedSimHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost]
    public async Task<ActionResult> CreateReport([FromBody] CreateReportRequest request)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Unauthorized();

        // Spam Check: Check if user already has a Pending report for this content
        var existingReport = await _context.ContentReports
            .FirstOrDefaultAsync(r => r.ReporterId == user.Id 
                                   && r.ContentId == request.ContentId 
                                   && r.Status == "Pending");
                                   
        if (existingReport != null)
        {
            return BadRequest(new { message = "Bu içerik için halihazırda inceleme bekleyen bir bildiriminiz bulunmaktadır." });
        }

        var report = new ContentReport
        {
            ContentId = request.ContentId,
            ContentType = request.ContentType,
            ReportType = request.ReportType,
            Description = request.Description,
            ReporterId = user.Id,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.ContentReports.Add(report);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("AdminDataUpdated");

        return Ok(new { message = "Bildiriminiz başarıyla alındı. İçeriği inceleyeceğiz." });
    }

    [HttpGet("admin")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<List<ReportListDto>>> GetReports(
        [FromQuery] string? status = null,
        [FromQuery] string? contentType = null)
    {
        var query = _context.ContentReports
            .Include(r => r.Reporter)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && status != "All")
            query = query.Where(r => r.Status == status);
            
        if (!string.IsNullOrEmpty(contentType) && contentType != "All")
            query = query.Where(r => r.ContentType == contentType);

        var reports = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();

        var result = new List<ReportListDto>();
        foreach (var r in reports)
        {
            string titleOrSnippet = "Bilinmeyen İçerik";
            if (r.ContentType == "TusQuestion")
            {
                var q = await _context.TusQuestions.AsNoTracking().FirstOrDefaultAsync(t => t.Id == r.ContentId);
                titleOrSnippet = q != null ? (q.QuestionText.Length > 50 ? q.QuestionText.Substring(0, 50) + "..." : q.QuestionText) : "Silinmiş Soru";
            }
            else if (r.ContentType == "MedicalCase")
            {
                var c = await _context.MedicalCases.AsNoTracking().FirstOrDefaultAsync(m => m.Id == r.ContentId);
                titleOrSnippet = c != null ? c.Title : "Silinmiş Vaka";
            }

            result.Add(new ReportListDto
            {
                Id = r.Id,
                ContentId = r.ContentId,
                ContentType = r.ContentType,
                ContentTitleOrSnippet = titleOrSnippet,
                ReportType = r.ReportType,
                Status = r.Status,
                ReporterId = r.ReporterId,
                ReporterNickname = r.Reporter.Nickname,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            });
        }

        return Ok(result);
    }

    [HttpGet("admin/stats")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ReportStatsDto>> GetReportStats()
    {
        var reports = await _context.ContentReports.AsNoTracking().ToListAsync();
        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

        var stats = new ReportStatsDto
        {
            TotalReports = reports.Count,
            PendingReports = reports.Count(r => r.Status == "Pending"),
            ReviewingReports = reports.Count(r => r.Status == "Reviewing"),
            ResolvedReports = reports.Count(r => r.Status == "Resolved"),
            RejectedReports = reports.Count(r => r.Status == "Rejected"),
            Last7DaysReports = reports.Count(r => r.CreatedAt >= sevenDaysAgo),
            ReportsByType = reports.GroupBy(r => r.ReportType)
                                   .ToDictionary(g => g.Key, g => g.Count())
        };

        return Ok(stats);
    }

    [HttpGet("admin/{id}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<ReportDetailDto>> GetReportDetail(Guid id)
    {
        var report = await _context.ContentReports
            .Include(r => r.Reporter)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null) return NotFound();

        object? originalContent = null;
        string titleOrSnippet = "Bilinmeyen İçerik";

        if (report.ContentType == "TusQuestion")
        {
            var q = await _context.TusQuestions.AsNoTracking().FirstOrDefaultAsync(t => t.Id == report.ContentId);
            originalContent = q;
            titleOrSnippet = q != null ? (q.QuestionText.Length > 50 ? q.QuestionText.Substring(0, 50) + "..." : q.QuestionText) : "Silinmiş Soru";
        }
        else if (report.ContentType == "MedicalCase")
        {
            var c = await _context.MedicalCases
                .Include(m => m.Stages).ThenInclude(s => s.Options)
                .AsNoTracking().FirstOrDefaultAsync(m => m.Id == report.ContentId);
            originalContent = c;
            titleOrSnippet = c != null ? c.Title : "Silinmiş Vaka";
        }

        return Ok(new ReportDetailDto
        {
            Id = report.Id,
            ContentId = report.ContentId,
            ContentType = report.ContentType,
            ContentTitleOrSnippet = titleOrSnippet,
            ReportType = report.ReportType,
            Status = report.Status,
            ReporterId = report.ReporterId,
            ReporterNickname = report.Reporter.Nickname,
            CreatedAt = report.CreatedAt,
            UpdatedAt = report.UpdatedAt,
            Description = report.Description,
            AdminNote = report.AdminNote,
            ResolvedAt = report.ResolvedAt,
            OriginalContent = originalContent
        });
    }

    [HttpPut("admin/{id}/status")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult> UpdateReportStatus(Guid id, [FromBody] UpdateReportStatusRequest request)
    {
        var report = await _context.ContentReports.FirstOrDefaultAsync(r => r.Id == id);
        if (report == null) return NotFound();

        var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        var admin = await _context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);

        report.Status = request.Status;
        if (request.AdminNote != null)
        {
            report.AdminNote = request.AdminNote;
        }

        report.UpdatedAt = DateTime.UtcNow;

        if (request.Status == "Resolved" || request.Status == "Rejected")
        {
            report.ResolvedAt = DateTime.UtcNow;
            report.ResolvedByUserId = admin?.Id;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Durum güncellendi." });
    }
}
