using System.Security.Claims;
using MedSim.Application.DTOs;
using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using MedSim.Api.Hubs;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedbacksController : ControllerBase
{
    private readonly IFeedbackRepository _feedbackRepository;
    private readonly MedSimDbContext _context;
    private readonly IHubContext<MedSimHub> _hubContext;

    public FeedbacksController(IFeedbackRepository feedbackRepository, MedSimDbContext context, IHubContext<MedSimHub> hubContext)
    {
        _feedbackRepository = feedbackRepository;
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,SuperAdmin")] // Only admins can view all feedbacks
    public async Task<ActionResult<IEnumerable<FeedbackDto>>> GetFeedbacks()
    {
        var feedbacks = await _feedbackRepository.GetAllFeedbacksAsync();
        
        var dtos = feedbacks.Select(f => new FeedbackDto
        {
            Id = f.Id,
            UserEmail = f.User.Email,
            Nickname = f.User.Nickname,
            Message = f.Message,
            Teaching = f.Teaching,
            Usability = f.Usability,
            EaseOfUse = f.EaseOfUse,
            RealLife = f.RealLife,
            Analysis = f.Analysis,
            Speed = f.Speed,
            Detail = f.Detail,
            CreatedAt = f.CreatedAt
        });

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult> CreateFeedback([FromBody] CreateFeedbackDto request)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email)) return Unauthorized();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Unauthorized();

        var feedback = new Feedback
        {
            UserId = user.Id,
            Message = request.Message,
            Teaching = request.Teaching,
            Usability = request.Usability,
            EaseOfUse = request.EaseOfUse,
            RealLife = request.RealLife,
            Analysis = request.Analysis,
            Speed = request.Speed,
            Detail = request.Detail,
            CreatedAt = DateTime.UtcNow
        };

        await _feedbackRepository.AddFeedbackAsync(feedback);

        await _hubContext.Clients.All.SendAsync("AdminDataUpdated");
        await _hubContext.Clients.All.SendAsync("FeedbackReceived", new
        {
            id = feedback.Id,
            userEmail = user.Email,
            nickname = user.Nickname,
            message = feedback.Message,
            createdAt = feedback.CreatedAt
        });

        return Ok(new { message = "Feedback submitted successfully." });
    }
}
