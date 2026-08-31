using MedSim.Application.DTOs;
using MedSim.Application.Interfaces;
using MedSim.Application.Common;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using MedSim.Api.Hubs;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly MedSimDbContext _context;
    private readonly IHubContext<MedSimHub> _hubContext;
    private readonly ICacheService _cache;

    public ProfileController(MedSimDbContext context, IHubContext<MedSimHub> hubContext, ICacheService cache)
    {
        _context = context;
        _hubContext = hubContext;
        _cache = cache;
    }

    [HttpGet("solved-cases")]
    public async Task<IActionResult> GetSolvedCases(
        [FromQuery] string? subject, 
        [FromQuery] int? year, 
        [FromQuery] string? difficulty,
        [FromQuery] string? sortOrder,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Unauthorized("Oturum süresi dolmuş veya geçersiz.");

        page = Math.Max(1, page);
        pageSize = Math.Min(pageSize, 50);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return NotFound("Kullanıcı bulunamadı.");

        var query = _context.SolvedCases
            .AsNoTracking()
            .Include(sc => sc.MedicalCase)
            .ThenInclude(mc => mc.Department)
            .Where(sc => sc.UserId == user.Id && sc.MedicalCase.IsProcedural)
            .AsQueryable();

        if (!string.IsNullOrEmpty(subject))
        {
            query = query.Where(sc => sc.MedicalCase.Department.Name == subject);
        }

        if (year.HasValue && year.Value > 0)
        {
            query = query.Where(sc => sc.MedicalCase.Department.Year == year.Value);
        }

        if (!string.IsNullOrEmpty(difficulty))
        {
            query = query.Where(sc => sc.MedicalCase.Difficulty == difficulty);
        }

        var totalCount = await query.CountAsync();

        if (sortOrder?.ToLower() == "asc")
        {
            query = query.OrderBy(sc => sc.SolvedAt);
        }
        else
        {
            query = query.OrderByDescending(sc => sc.SolvedAt);
        }

        var rawItems = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(sc => new
            {
                sc.Id,
                sc.MedicalCaseId,
                CaseTitle = sc.MedicalCase.Title,
                DepartmentName = sc.MedicalCase.Department.Name,
                DepartmentYear = sc.MedicalCase.Department.Year,
                sc.IsSolved,
                sc.EarnedPoints,
                sc.GivenAnswers,
                sc.SolvedAt,
                sc.MedicalCase.Difficulty,
                sc.MedicalCase.DifficultyScore,
                sc.MedicalCase.DifficultyReason
            })
            .ToListAsync();

        var items = rawItems.Select(sc => new SolvedCaseDto
        {
            Id = sc.Id,
            MedicalCaseId = sc.MedicalCaseId,
            CaseTitle = sc.CaseTitle,
            DepartmentName = sc.DepartmentName,
            DepartmentYear = sc.DepartmentYear,
            IsSolved = sc.IsSolved,
            EarnedPoints = sc.EarnedPoints,
            GivenAnswers = string.IsNullOrEmpty(sc.GivenAnswers) ? new List<int>() : sc.GivenAnswers.Split(',').Select(int.Parse).ToList(),
            SolvedAt = sc.SolvedAt,
            Difficulty = sc.Difficulty,
            DifficultyScore = sc.DifficultyScore,
            DifficultyReason = sc.DifficultyReason
        }).ToList();

        var result = new PagedResult<SolvedCaseDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(result);
    }

    [HttpPost("solve-case")]
    public async Task<IActionResult> SolveCase([FromBody] SolveCaseRequest request)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(userEmail)) return Unauthorized("Yetkisiz erişim.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var medicalCase = await _context.MedicalCases
            .Include(c => c.Stages)
            .ThenInclude(s => s.Options)
            .FirstOrDefaultAsync(c => c.Id == request.MedicalCaseId);
            
        if (medicalCase == null) return NotFound("Vaka bulunamadı.");

        // Calculate points based on correct answers
        int calculatedPoints = 0;
        var givenAnswersArray = request.GivenAnswers ?? new List<int>();
        var sortedStages = medicalCase.Stages.OrderBy(s => s.OrderIndex).ToList();
        
        for (int i = 0; i < sortedStages.Count && i < givenAnswersArray.Count; i++)
        {
            var stage = sortedStages[i];
            var givenOptionIndex = givenAnswersArray[i];
            
            // Assume IsCorrect is a boolean in Option
            var correctOption = stage.Options.FirstOrDefault(o => o.IsCorrect);
            if (correctOption != null)
            {
                var correctOptionIndex = stage.Options.ToList().IndexOf(correctOption);
                if (givenOptionIndex == correctOptionIndex)
                {
                    calculatedPoints += 10;
                }
            }
        }

        // Check if already solved
        var existingSolve = await _context.SolvedCases
            .FirstOrDefaultAsync(sc => sc.UserId == user.Id && sc.MedicalCaseId == request.MedicalCaseId);

        int pointsEarned = 0;

        if (existingSolve != null)
        {
            if (calculatedPoints > existingSolve.EarnedPoints)
            {
                pointsEarned = calculatedPoints - existingSolve.EarnedPoints;
                existingSolve.EarnedPoints = calculatedPoints;
            }
            existingSolve.GivenAnswers = string.Join(",", givenAnswersArray);
            existingSolve.SolvedAt = DateTime.UtcNow;
            _context.SolvedCases.Update(existingSolve);
        }
        else
        {
            pointsEarned = calculatedPoints;
            var solvedCase = new MedSim.Domain.Entities.SolvedCase
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                MedicalCaseId = request.MedicalCaseId,
                EarnedPoints = calculatedPoints,
                IsSolved = true,
                GivenAnswers = string.Join(",", givenAnswersArray),
                SolvedAt = DateTime.UtcNow
            };
            _context.SolvedCases.Add(solvedCase);
        }

        if (pointsEarned > 0)
        {
            user.Points += pointsEarned;
        }
        
        var auditLog = new AuditLog
        {
            UserId = user.Id,
            Action = "CaseSolved",
            Details = $"MedicalCaseId: {request.MedicalCaseId}, EarnedPoints: {pointsEarned}"
        };
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();

        await _cache.RemoveAsync(CacheKeys.UserLeaderboard);
        await _cache.RemoveAsync(CacheKeys.TusLeaderboard);

        await _hubContext.Clients.All.SendAsync("LeaderboardUpdated");
        await _hubContext.Clients.All.SendAsync("AdminDataUpdated");

        return Ok(new { message = "Vaka başarıyla kaydedildi.", points = user.Points });
    }
    [HttpPost("add-friend")]
    public async Task<IActionResult> AddFriend([FromBody] FriendRequest request)
    {
        request.UserEmail = User.FindFirstValue(ClaimTypes.Email) ?? request.UserEmail;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.UserEmail);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var friend = await _context.Users.FirstOrDefaultAsync(u => u.FriendCode == request.FriendCode);
        if (friend == null) return NotFound("Geçersiz Arkadaş ID'si.");

        if (user.Id == friend.Id) return BadRequest("Kendinizi ekleyemezsiniz.");

        var existingFriend = await _context.UserFriends
            .FirstOrDefaultAsync(f => f.UserId == user.Id && f.FriendId == friend.Id);
            
        if (existingFriend != null) return BadRequest("Bu kullanıcı zaten arkadaşınız.");

        _context.UserFriends.Add(new MedSim.Domain.Entities.UserFriend
        {
            UserId = user.Id,
            FriendId = friend.Id
        });

        await _context.SaveChangesAsync();
        return Ok(new { message = "Arkadaş başarıyla eklendi." });
    }

    [HttpDelete("remove-friend")]
    public async Task<IActionResult> RemoveFriend([FromBody] FriendRequest request)
    {
        request.UserEmail = User.FindFirstValue(ClaimTypes.Email) ?? request.UserEmail;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.UserEmail);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var friend = await _context.Users.FirstOrDefaultAsync(u => u.FriendCode == request.FriendCode);
        if (friend == null) return NotFound("Geçersiz Arkadaş ID'si.");

        var userFriend = await _context.UserFriends
            .FirstOrDefaultAsync(f => f.UserId == user.Id && f.FriendId == friend.Id);
            
        if (userFriend == null) return NotFound("Bu kullanıcı arkadaş listenizde yok.");

        _context.UserFriends.Remove(userFriend);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Arkadaş başarıyla çıkarıldı." });
    }

    [HttpGet("friends")]
    public async Task<IActionResult> GetFriends([FromQuery] string email)
    {
        email = User.FindFirstValue(ClaimTypes.Email) ?? email;
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Friends)
            .ThenInclude(f => f.Friend)
            .FirstOrDefaultAsync(u => u.Email == email);
            
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        var friends = user.Friends.Select(f => new
        {
            Nickname = f.Friend.Nickname,
            FriendCode = f.Friend.FriendCode,
            Avatar = f.Friend.Avatar,
            Points = f.Friend.Points,
            AddedAt = f.AddedAt
        }).OrderByDescending(f => f.Points).ToList();

        return Ok(friends);
    }
}

public class SolveCaseRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid MedicalCaseId { get; set; }
    public int Points { get; set; }
    public List<int> GivenAnswers { get; set; } = new();
}

public class FriendRequest
{
    public string UserEmail { get; set; } = string.Empty;
    public string FriendCode { get; set; } = string.Empty;
}
