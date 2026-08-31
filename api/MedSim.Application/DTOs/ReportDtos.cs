using System;
using System.Collections.Generic;

namespace MedSim.Application.DTOs;

public class CreateReportRequest
{
    public Guid ContentId { get; set; }
    public string ContentType { get; set; } = string.Empty; // "MedicalCase" or "TusQuestion"
    public string ReportType { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class ReportListDto
{
    public Guid Id { get; set; }
    public Guid ContentId { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public string ContentTitleOrSnippet { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid ReporterId { get; set; }
    public string ReporterNickname { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ReportDetailDto : ReportListDto
{
    public string? Description { get; set; }
    public string? AdminNote { get; set; }
    public DateTime? ResolvedAt { get; set; }
    
    // Will contain the original content payload (MedicalCaseDto or TusQuestion) depending on ContentType
    public object? OriginalContent { get; set; }
}

public class ReportStatsDto
{
    public int TotalReports { get; set; }
    public int PendingReports { get; set; }
    public int ReviewingReports { get; set; }
    public int ResolvedReports { get; set; }
    public int RejectedReports { get; set; }
    public int Last7DaysReports { get; set; }
    public Dictionary<string, int> ReportsByType { get; set; } = new();
}

public class UpdateReportStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
}
