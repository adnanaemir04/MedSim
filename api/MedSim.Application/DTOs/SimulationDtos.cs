namespace MedSim.Application.DTOs;

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Year { get; set; }
    public List<TopicDto> Topics { get; set; } = new();
}

public class TopicDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<SubTopicDto> SubTopics { get; set; } = new();
}

public class SubTopicDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class PatientInfoDto
{
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    // Vital signs
    public string BloodPressure { get; set; } = string.Empty;
    public string HeartRate { get; set; } = string.Empty;
    public string Temperature { get; set; } = string.Empty;
    public string OxygenSaturation { get; set; } = string.Empty;
    public string RespiratoryRate { get; set; } = string.Empty;
    // Clinical context
    public string PhysicalExam { get; set; } = string.Empty;
    public string MedicalHistory { get; set; } = string.Empty;
    public string ChiefComplaint { get; set; } = string.Empty;
}

public class MedicalCaseDto
{
    public Guid Id { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public Guid? SubTopicId { get; set; }
    public string SubTopicName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string InitialText { get; set; } = string.Empty;
    public bool IsProcedural { get; set; }
    public PatientInfoDto? PatientInfo { get; set; }
    public List<CaseStageDto> Stages { get; set; } = new();

    // Difficulty Classification
    public string Difficulty { get; set; } = string.Empty;
    public int DifficultyScore { get; set; }
    public string DifficultyReason { get; set; } = string.Empty;
}

public class CaseStageDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<CaseOptionDto> Options { get; set; } = new();
}

public class CaseOptionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string Feedback { get; set; } = string.Empty;
}

public class GenerateCaseRequest
{
    public string DepartmentName { get; set; } = string.Empty;
    public string TopicName { get; set; } = string.Empty;
    public string SubTopicName { get; set; } = string.Empty;
    public int Count { get; set; } = 1;
    public string Difficulty { get; set; } = "Orta";
}
