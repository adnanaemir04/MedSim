namespace MedSim.Domain.Entities;

public class ContentReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    // MedicalCase.Id or TusQuestion.Id
    public Guid ContentId { get; set; }
    
    // "MedicalCase" or "TusQuestion"
    public string ContentType { get; set; } = string.Empty;
    
    public Guid ReporterId { get; set; }
    public User Reporter { get; set; } = null!;
    
    public string ReportType { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    // "Pending", "Reviewing", "Resolved", "Rejected"
    public string Status { get; set; } = "Pending";
    
    public string? AdminNote { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public Guid? ResolvedByUserId { get; set; }
}
