namespace MedSim.Domain.Entities;

public class Topic
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    
    public ICollection<SubTopic> SubTopics { get; set; } = new List<SubTopic>();
}
