using MedSim.Application.DTOs.Analytics;

namespace MedSim.Application.Interfaces;

public interface IAnalyticsService
{
    Task<KpiDto> GetKpisAsync(int days = 30);
    Task<List<ChartDataPoint>> GetUserGrowthAsync(int days = 30);
    Task<List<SubjectRankingDto>> GetSubjectRankingsAsync();
    Task<GeminiVsClassicComparisonDto> GetGeminiComparisonAsync();
}
