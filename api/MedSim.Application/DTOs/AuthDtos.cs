using System.ComponentModel.DataAnnotations;

namespace MedSim.Application.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "E-posta adresi zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçersiz e-posta formatı.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Kullanıcı adı (nickname) zorunludur.")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Kullanıcı adı en az 3, en fazla 50 karakter olmalıdır.")]
    public string Nickname { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [StringLength(100, MinimumLength = 4, ErrorMessage = "Şifre en az 4 karakter olmalıdır.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required(ErrorMessage = "E-posta adresi zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçersiz e-posta formatı.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    public string Password { get; set; } = string.Empty;
}

public class UserResponseDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Avatar { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string FriendCode { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserResponseDto User { get; set; } = new UserResponseDto();
}

public class RefreshTokenRequestDto
{
    [Required]
    public string AccessToken { get; set; } = string.Empty;
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
