using System;

namespace MedSim.Domain.Entities;

public class Feedback
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Message { get; set; } = string.Empty;

    // Metrics (1 to 5 stars)
    public int Teaching { get; set; }
    public int Usability { get; set; }
    public int EaseOfUse { get; set; }
    public int RealLife { get; set; }
    public int Analysis { get; set; }
    public int Speed { get; set; }
    public int Detail { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
