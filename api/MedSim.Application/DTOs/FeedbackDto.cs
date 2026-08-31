using System;

namespace MedSim.Application.DTOs;

public class FeedbackDto
{
    public Guid Id { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public int Teaching { get; set; }
    public int Usability { get; set; }
    public int EaseOfUse { get; set; }
    public int RealLife { get; set; }
    public int Analysis { get; set; }
    public int Speed { get; set; }
    public int Detail { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class CreateFeedbackDto
{
    public string Message { get; set; } = string.Empty;

    public int Teaching { get; set; }
    public int Usability { get; set; }
    public int EaseOfUse { get; set; }
    public int RealLife { get; set; }
    public int Analysis { get; set; }
    public int Speed { get; set; }
    public int Detail { get; set; }
}
