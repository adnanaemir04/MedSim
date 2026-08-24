using Microsoft.AspNetCore.Mvc;
using MedSim.Application.Interfaces;
using MedSim.Application.DTOs.Analytics;
using Microsoft.AspNetCore.Authorization;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize(Roles = "Admin,SuperAdmin")] // In a real app this would be enabled
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("kpi")]
    public async Task<ActionResult<KpiDto>> GetKpis([FromQuery] int days = 30)
    {
        var kpis = await _analyticsService.GetKpisAsync(days);
        return Ok(kpis);
    }

    [HttpGet("users/growth")]
    public async Task<ActionResult<List<ChartDataPoint>>> GetUserGrowth([FromQuery] int days = 30)
    {
        var growth = await _analyticsService.GetUserGrowthAsync(days);
        return Ok(growth);
    }

    [HttpGet("subjects/ranking")]
    public async Task<ActionResult<List<SubjectRankingDto>>> GetSubjectRankings()
    {
        var rankings = await _analyticsService.GetSubjectRankingsAsync();
        return Ok(rankings);
    }

    [HttpGet("gemini-vs-classic")]
    public async Task<ActionResult<GeminiVsClassicComparisonDto>> GetGeminiComparison()
    {
        var comparison = await _analyticsService.GetGeminiComparisonAsync();
        return Ok(comparison);
    }
}
