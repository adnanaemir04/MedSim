namespace MedSim.Application.DTOs;

public class UpdateProfileDto
{
    public string Email { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty; // Emoji or Base64 string
    public int? Points { get; set; }
}
