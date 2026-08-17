namespace MedSim.Domain.Entities;

public class TusQuestion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string OptionE { get; set; } = string.Empty;
    
    // The correct option character (A, B, C, D, E)
    public string CorrectOption { get; set; } = string.Empty;
    
    public string Explanation { get; set; } = string.Empty;
    
    // e.g., "Klinik Bilimler", "Temel Bilimler"
    public string Category { get; set; } = string.Empty;
    
    // e.g., "Anatomi", "Dahiliye"
    public string Subject { get; set; } = string.Empty;
}
