namespace MedSim.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int Points { get; set; } = 20;
    public string Avatar { get; set; } = "👨‍⚕️";
    
    // Navigation Property
    public ICollection<SolvedCase> SolvedCases { get; set; } = new List<SolvedCase>();
}

public class SolvedCase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid MedicalCaseId { get; set; }
    public MedicalCase MedicalCase { get; set; } = null!;
    
    public bool IsSolved { get; set; }
    public int EarnedPoints { get; set; }
    public DateTime SolvedAt { get; set; } = DateTime.UtcNow;
}
