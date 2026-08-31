using System.Collections.Generic;

namespace MedSim.Application.DTOs;

public class DailyGoalDto
{
    public int TargetCount { get; set; } = 30; // Toplam günlük soru hedefi
    public int TotalSolvedToday { get; set; }
    public List<DailyCourseTargetDto> Courses { get; set; } = new();
}

public class DailyCourseTargetDto
{
    public string Name { get; set; } = string.Empty;
    public int Target { get; set; } = 10;
    public int SolvedToday { get; set; }
    public string ColorCode { get; set; } = string.Empty;
}
