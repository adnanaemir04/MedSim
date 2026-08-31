using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MedSim.Domain.Entities;

namespace MedSim.Application.Interfaces;

public interface IFeedbackRepository
{
    Task<IEnumerable<Feedback>> GetAllFeedbacksAsync();
    Task AddFeedbackAsync(Feedback feedback);
}
