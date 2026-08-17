using MedSim.Domain.Entities;

namespace MedSim.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByNicknameAsync(string nickname);
    Task<IEnumerable<User>> GetAllAsync();
    Task<IEnumerable<User>> GetLeaderboardAsync(int top = 10);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task DeleteAsync(User user);
    Task SaveChangesAsync();
}
