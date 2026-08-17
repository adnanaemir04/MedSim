namespace MedSim.Domain.Entities;

public class MedicalCase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    
    public string Title { get; set; } = string.Empty;
    public string InitialText { get; set; } = string.Empty;
    public bool IsProcedural { get; set; } = false; // To identify if it was AI generated
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CaseStage> Stages { get; set; } = new List<CaseStage>();
}
