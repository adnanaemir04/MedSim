namespace MedSim.Domain.Entities;

public class Department
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public int Year { get; set; } // e.g. 1, 2, 3, 4, 5, 6

    public ICollection<MedicalCase> Cases { get; set; } = new List<MedicalCase>();
    public ICollection<Topic> Topics { get; set; } = new List<Topic>();
}
