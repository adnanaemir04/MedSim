namespace MedSim.Domain.Entities;

public class CaseStage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MedicalCaseId { get; set; }
    public MedicalCase MedicalCase { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    public ICollection<CaseOption> Options { get; set; } = new List<CaseOption>();
}
