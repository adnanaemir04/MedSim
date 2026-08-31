using System;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using MedSim.Api.Controllers;
using MedSim.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using MedSim.Application.Interfaces;
using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace MedSim.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IConfiguration> _configMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _configMock = new Mock<IConfiguration>();

        // Setup mock config for JWT
        var configSectionMock = new Mock<IConfigurationSection>();
        configSectionMock.Setup(s => s["Secret"]).Returns("my-super-secret-key-which-needs-to-be-long-enough");
        configSectionMock.Setup(s => s["Issuer"]).Returns("issuer");
        configSectionMock.Setup(s => s["Audience"]).Returns("audience");
        configSectionMock.Setup(s => s["ExpiryMinutes"]).Returns("60");

        _configMock.Setup(c => c.GetSection("JwtSettings")).Returns(configSectionMock.Object);

        var hubContextMock = new Mock<IHubContext<MedSimHub>>();
        var hubClientsMock = new Mock<IHubClients>();
        var clientProxyMock = new Mock<IClientProxy>();
        hubContextMock.Setup(x => x.Clients).Returns(hubClientsMock.Object);
        hubClientsMock.Setup(x => x.All).Returns(clientProxyMock.Object);

        _controller = new AuthController(_userRepositoryMock.Object, _configMock.Object, hubContextMock.Object);
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        var dto = new RegisterDto { Email = "test@test.com", Nickname = "test", Password = "123" };
        _userRepositoryMock.Setup(r => r.GetByEmailAsync(dto.Email)).ReturnsAsync(new User { Email = dto.Email });

        // Act
        var result = await _controller.Register(dto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        badRequestResult.Value.Should().Be("Bu e-posta adresi zaten kullanımda.");
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsOkWithTokens()
    {
        // Arrange
        var dto = new RegisterDto { Email = "new@test.com", Nickname = "newuser", Password = "123" };
        _userRepositoryMock.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _userRepositoryMock.Setup(r => r.GetByNicknameAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _userRepositoryMock.Setup(r => r.GetByFriendCodeAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        // Act
        var result = await _controller.Register(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var authResponse = Assert.IsType<AuthResponseDto>(okResult.Value);
        
        authResponse.AccessToken.Should().NotBeNullOrEmpty();
        authResponse.RefreshToken.Should().NotBeNullOrEmpty();
        authResponse.User.Email.Should().Be(dto.Email);
        authResponse.User.Nickname.Should().Be(dto.Nickname);
        authResponse.User.FriendCode.Should().NotBeNullOrEmpty();

        _userRepositoryMock.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        _userRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Exactly(2));
    }

    [Fact]
    public async Task RefreshToken_InvalidToken_ReturnsBadRequest()
    {
        // Arrange
        var request = new RefreshTokenRequestDto
        {
            AccessToken = "invalid.token.here",
            RefreshToken = "some-refresh-token"
        };

        // For this test, GetPrincipalFromExpiredToken will throw or return null because "invalid.token.here" is not a valid JWT format.
        // We expect the controller to catch it or return BadRequest.

        // Act
        var result = await _controller.RefreshToken(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}
