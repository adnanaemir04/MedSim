using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly MedSimDbContext _context;

    public UserRepository(MedSimDbContext context)
    {
        _context = context;
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
        return await _context.Users.ToListAsync();
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
