namespace MedSim.Application.DTOs;

public class UserStatsDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    
    // TUS Stats
    public int TotalTusSolved { get; set; }
    public int CorrectTus { get; set; }
    public int IncorrectTus { get; set; }
    
    // Case Stats
    public int TotalCasesSolved { get; set; }
    public int SuccessfulCases { get; set; }
    public int FailedCases { get; set; }
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateAdminDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
}
