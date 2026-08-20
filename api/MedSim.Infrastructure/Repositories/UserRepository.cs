using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace MedSim.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly MedSimDbContext _context;
    private readonly IMemoryCache _cache;

    public UserRepository(MedSimDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users.Include(u => u.SolvedCases).FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByNicknameAsync(string nickname)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Nickname.ToLower() == nickname.ToLower());
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.AsNoTracking().ToListAsync();
    }

    public async Task<IEnumerable<User>> GetLeaderboardAsync(int top = 10)
    {
        if (!_cache.TryGetValue("user_leaderboard", out IEnumerable<User>? leaderboard))
        {
            leaderboard = await _context.Users
                .AsNoTracking()
                .OrderByDescending(u => u.Points)
                .Take(top)
                .ToListAsync();
            
            _cache.Set("user_leaderboard", leaderboard, TimeSpan.FromMinutes(1));
        }
        return leaderboard ?? new List<User>();
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(User user)
    {
        _context.Users.Remove(user);
        await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
