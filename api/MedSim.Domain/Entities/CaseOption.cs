namespace MedSim.Domain.Entities;

public class CaseOption
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseStageId { get; set; }
    public CaseStage CaseStage { get; set; } = null!;

    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string Feedback { get; set; } = string.Empty;
}
