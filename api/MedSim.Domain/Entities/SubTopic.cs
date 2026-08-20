namespace MedSim.Domain.Entities;

public class SubTopic
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    
    public ICollection<MedicalCase> MedicalCases { get; set; } = new List<MedicalCase>();
    public ICollection<TusQuestion> TusQuestions { get; set; } = new List<TusQuestion>();
}
