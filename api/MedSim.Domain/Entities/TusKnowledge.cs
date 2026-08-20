using System;
using System.Collections.Generic;

namespace MedSim.Domain.Entities;

public class TusKnowledge
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string KnowledgeText { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty; // e.g., "Farmakoloji", "Anatomi"
    
    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }
    
    public Guid? SubTopicId { get; set; }
    public SubTopic? SubTopic { get; set; }
    
    public int ImportanceScore { get; set; } = 50; // 0-100
    public string RepetitionFrequency { get; set; } = "Orta"; // "Çok Yüksek", "Yüksek", "Orta"
    public string Sources { get; set; } = string.Empty; // Semicolon separated string
    
    public bool IsActive { get; set; } = true;
    
    public ICollection<TusQuestion> Questions { get; set; } = new List<TusQuestion>();
}
