using MedSim.Domain.Entities;

namespace MedSim.Application.Interfaces;

public interface ITusRepository
{
    Task<IEnumerable<object>> GetSubjectsAsync();
    Task<IEnumerable<object>> GetQuestionsAsync(int count, string? subject, string? difficulty);
    Task<object> SubmitAnswerAsync(string email, Guid questionId, string selectedOption, int durationSeconds);
    Task<object> GetStatsAsync(string email, string? subject);
    Task<IEnumerable<object>> GetSolvedQuestionsListAsync(string email, string? subject);
    Task<IEnumerable<object>> GetLeaderboardAsync();
    Task<TusQuestion?> GetQuestionByIdAsync(Guid id);
}
