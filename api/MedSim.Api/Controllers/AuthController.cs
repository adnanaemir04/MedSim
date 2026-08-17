using MedSim.Application.DTOs;
using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public AuthController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var existingEmail = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingEmail != null) return BadRequest("Bu e-posta adresi zaten kullanımda.");

        var existingNickname = await _userRepository.GetByNicknameAsync(dto.Nickname);
        if (existingNickname != null) return BadRequest("Bu nickname zaten alınmış.");

        var user = new User
        {
            Email = dto.Email,
            Nickname = dto.Nickname,
            PasswordHash = dto.Password, // WARNING: In production, hash this password!
            Points = 20,
            Avatar = "👨‍⚕️"
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Nickname = user.Nickname,
            Points = user.Points,
            Avatar = user.Avatar
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        
        // Simple plaintext comparison for simulation purposes
        if (user == null || user.PasswordHash != dto.Password)
        {
            return Unauthorized("Hatalı e-posta veya şifre.");
        }

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Nickname = user.Nickname,
            Points = user.Points,
            Avatar = user.Avatar
        });
    }

    [HttpPut("updateProfile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        // Check if nickname is taken by someone else
        if (user.Nickname != dto.Nickname)
        {
            var existingNickname = await _userRepository.GetByNicknameAsync(dto.Nickname);
            if (existingNickname != null) return BadRequest("Bu nickname zaten kullanımda.");
        }

        user.Nickname = dto.Nickname;
        if (!string.IsNullOrEmpty(dto.Avatar))
        {
            user.Avatar = dto.Avatar;
        }
        if (dto.Points.HasValue)
        {
            user.Points = dto.Points.Value;
        }

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Nickname = user.Nickname,
            Points = user.Points,
            Avatar = user.Avatar
        });
    }

    [HttpDelete("deleteAccount/{email}")]
    public async Task<IActionResult> DeleteAccount(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null) return NotFound("Kullanıcı bulunamadı.");

        await _userRepository.DeleteAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "Hesap başarıyla silindi." });
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        var users = await _userRepository.GetLeaderboardAsync(20); // top 20
        var dtoList = users.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Email = u.Email, // Might want to hide this in prod, but ok for now
            Nickname = u.Nickname,
            Points = u.Points,
            Avatar = u.Avatar
        }).ToList();

        return Ok(dtoList);
    }
}
