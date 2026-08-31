using MedSim.Application.DTOs;
using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using MedSim.Api.Hubs;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IHubContext<MedSimHub> _hubContext;

    public AuthController(IUserRepository userRepository, IConfiguration configuration, IHubContext<MedSimHub> hubContext)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _hubContext = hubContext;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var existingEmail = await _userRepository.GetByEmailAsync(dto.Email);
        if (existingEmail != null) return BadRequest("Bu e-posta adresi zaten kullanımda.");

        var existingNickname = await _userRepository.GetByNicknameAsync(dto.Nickname);
        if (existingNickname != null) return BadRequest("Bu nickname zaten alınmış.");

        string newFriendCode;
        while (true)
        {
            newFriendCode = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
            var existingWithCode = await _userRepository.GetByFriendCodeAsync(newFriendCode);
            if (existingWithCode == null)
            {
                break;
            }
        }

        var user = new User
        {
            Email = dto.Email,
            Nickname = dto.Nickname,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Points = 20,
            Avatar = "👨‍⚕️",
            FriendCode = newFriendCode
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("AdminDataUpdated");

        return Ok(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Nickname = user.Nickname,
                Points = user.Points,
                Avatar = user.Avatar,
                Role = user.Role,
                FriendCode = user.FriendCode
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email);
        
        bool isPasswordValid = false;
        if (user != null)
        {
            if (user.PasswordHash.StartsWith("$2a$") || user.PasswordHash.StartsWith("$2b$") || user.PasswordHash.StartsWith("$2y$"))
            {
                try
                {
                    isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
                }
                catch
                {
                    isPasswordValid = user.PasswordHash == dto.Password;
                }
            }
            else
            {
                isPasswordValid = user.PasswordHash == dto.Password;
            }
        }

        if (user == null || !isPasswordValid)
        {
            return Unauthorized("Hatalı e-posta veya şifre.");
        }

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();
        
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Nickname = user.Nickname,
                Points = user.Points,
                Avatar = user.Avatar,
                Role = user.Role,
                FriendCode = user.FriendCode
            }
        });
    }

    [HttpPut("updateProfile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userEmail = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(userEmail)) return Unauthorized("Oturum süresi dolmuş veya geçersiz.");

        var user = await _userRepository.GetByEmailAsync(userEmail);
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

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            Nickname = user.Nickname,
            Points = user.Points,
            Avatar = user.Avatar,
            Role = user.Role,
            FriendCode = user.FriendCode
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
            Avatar = u.Avatar,
            Role = u.Role,
            FriendCode = u.FriendCode
        }).ToList();

        return Ok(dtoList);
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var principal = GetPrincipalFromExpiredToken(dto.AccessToken);
        if (principal == null)
            return BadRequest("Geçersiz access token veya refresh token.");

        var userEmail = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail)) return BadRequest("Token içinden kullanıcı bilgisi okunamadı.");

        var user = await _userRepository.GetByEmailAsync(userEmail);

        if (user == null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return BadRequest("Geçersiz refresh token.");
        }

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new AuthResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            User = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Nickname = user.Nickname,
                Points = user.Points,
                Avatar = user.Avatar,
                Role = user.Role,
                FriendCode = user.FriendCode
            }
        });
    }

    private string GenerateAccessToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"];
        
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("Nickname", user.Nickname),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"];

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true, 
            ValidAudience = jwtSettings["Audience"],
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
            ValidateLifetime = false // we want to get claims from expired token
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }
}
