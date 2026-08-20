namespace MedSim.Domain.Entities;

public class TusSolvedQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid TusQuestionId { get; set; }
    public TusQuestion TusQuestion { get; set; } = null!;
    
    public bool IsCorrect { get; set; }
    public string SelectedOption { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public DateTime SolvedAt { get; set; } = DateTime.UtcNow;
}
