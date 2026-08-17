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
}
