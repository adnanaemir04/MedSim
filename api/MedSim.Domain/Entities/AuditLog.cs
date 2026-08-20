namespace MedSim.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string Action { get; set; } = string.Empty; // e.g. "TusQuestionSolved", "CaseSolved", "Login", "AdminCreated"
    public string Details { get; set; } = string.Empty; // JSON or plain text details
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
