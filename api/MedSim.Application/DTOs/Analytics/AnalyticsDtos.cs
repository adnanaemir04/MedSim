namespace MedSim.Application.DTOs.Analytics;

public class KpiDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int DailyActiveUsers { get; set; }
    public int MonthlyActiveUsers { get; set; }
    public int TotalSolvedQuestions { get; set; }
    public int DailySolvedQuestions { get; set; }
    public double AverageAccuracy { get; set; }
    public int TotalQuestions { get; set; }
    public int GeminiQuestionCount { get; set; }
    public int ClassicQuestionCount { get; set; }
    public double AverageSolveTimeSeconds { get; set; }
    public double AverageQuestionsPerUser { get; set; }
}

public class ChartDataPoint
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
    public int SecondaryValue { get; set; }
    public double Percentage { get; set; }
}

public class SubjectRankingDto
{
    public string SubjectName { get; set; } = string.Empty;
    public int TotalSolved { get; set; }
    public int CorrectCount { get; set; }
    public int IncorrectCount { get; set; }
    public double Accuracy { get; set; }
    public double AverageSolveTimeSeconds { get; set; }
}

public class GeminiVsClassicComparisonDto
{
    public int ClassicSolvedCount { get; set; }
    public double ClassicAccuracy { get; set; }
    public double ClassicAvgTime { get; set; }
    
    public int GeminiSolvedCount { get; set; }
    public double GeminiAccuracy { get; set; }
    public double GeminiAvgTime { get; set; }
}

public class DifficultyAnalysisDto
{
    public string Difficulty { get; set; } = string.Empty;
    public int SolvedCount { get; set; }
    public double Accuracy { get; set; }
    public double AverageTime { get; set; }
}

public class RetentionMatrixDto
{
    // A simplified cohort array
    public List<string> CohortDates { get; set; } = new();
    public List<List<double>> RetentionRates { get; set; } = new(); // [0] is Day 1, [1] is Day 7, etc.
}
