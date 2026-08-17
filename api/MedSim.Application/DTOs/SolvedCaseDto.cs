namespace MedSim.Application.DTOs;

public class SolvedCaseDto
{
    public Guid Id { get; set; }
    public Guid MedicalCaseId { get; set; }
    public string CaseTitle { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int DepartmentYear { get; set; }
    public bool IsSolved { get; set; }
    public int EarnedPoints { get; set; }
    public DateTime SolvedAt { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
