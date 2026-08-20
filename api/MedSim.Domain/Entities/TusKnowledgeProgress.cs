using System;

namespace MedSim.Domain.Entities;

public class TusKnowledgeProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid TusKnowledgeId { get; set; }
    public TusKnowledge TusKnowledge { get; set; } = null!;
    
    public int Views { get; set; } = 0;
    public int CorrectCount { get; set; } = 0;
    public int WrongCount { get; set; } = 0;
    
    public DateTime NextReviewAt { get; set; } = DateTime.UtcNow;
    public int IntervalDays { get; set; } = 0; // Current interval in days for Spaced Repetition (0 means new/not reviewed)
}
