using MedSim.Domain.Entities;

namespace MedSim.Application.Interfaces;

public interface ITusRepository
{
    Task<IEnumerable<object>> GetSubjectsAsync();
    Task<IEnumerable<object>> GetQuestionsAsync(int count, string? subject, string? difficulty, string mode, string? email);
    Task<object> SubmitAnswerAsync(string email, Guid questionId, string selectedOption, int durationSeconds);
    Task<object> GetStatsAsync(string email, string? subject);
    Task<object> GetSolvedQuestionsListAsync(string email, string? subject, int page, int pageSize, string? difficulty, string? sortOrder);
    Task<IEnumerable<object>> GetLeaderboardAsync();
    Task<TusQuestion?> GetQuestionByIdAsync(Guid id);
}
