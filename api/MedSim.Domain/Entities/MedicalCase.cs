namespace MedSim.Domain.Entities;

public class MedicalCase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    
    public Guid? SubTopicId { get; set; }
    public SubTopic? SubTopic { get; set; }
    
    
    public string Title { get; set; } = string.Empty;
    public string InitialText { get; set; } = string.Empty;
    public bool IsProcedural { get; set; } = false; // To identify if it was AI generated
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Difficulty Classification
    public string Difficulty { get; set; } = string.Empty; // "Kolay", "Orta", "Zor"
    public int DifficultyScore { get; set; } = 5; // 1-10
    public string DifficultyReason { get; set; } = string.Empty;

    public ICollection<CaseStage> Stages { get; set; } = new List<CaseStage>();
}
