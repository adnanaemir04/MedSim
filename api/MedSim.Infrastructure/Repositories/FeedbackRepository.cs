using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;

namespace MedSim.Infrastructure.Repositories;

public class FeedbackRepository : IFeedbackRepository
{
    private readonly MedSimDbContext _context;

    public FeedbackRepository(MedSimDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Feedback>> GetAllFeedbacksAsync()
    {
        return await _context.Feedbacks
            .Include(f => f.User)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task AddFeedbackAsync(Feedback feedback)
    {
        await _context.Feedbacks.AddAsync(feedback);
        await _context.SaveChangesAsync();
    }
}
