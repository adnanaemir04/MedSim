using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using MedSim.Api.Controllers;
using MedSim.Application.Interfaces;
using MedSim.Application.Common;
using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using MedSim.Api.Hubs;

namespace MedSim.Tests.Controllers;

public class ProfileControllerTests
{
    private readonly Mock<IHubContext<MedSimHub>> _hubContextMock;
    private readonly Mock<ICacheService> _cacheMock;

    public ProfileControllerTests()
    {
        _hubContextMock = new Mock<IHubContext<MedSimHub>>();
        _cacheMock = new Mock<ICacheService>();
    }

    private MedSimDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<MedSimDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new MedSimDbContext(options);
    }

    private ProfileController CreateController(MedSimDbContext context, string email)
    {
        var controller = new ProfileController(context, _hubContextMock.Object, _cacheMock.Object);
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.Email, email)
        }, "mock"));

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };

        return controller;
    }

    [Fact]
    public async Task AddFriend_WithValidFriendCode_ReturnsOk()
    {
        // Arrange
        var context = GetDbContext();
        var user = new User { Email = "user@test.com", Nickname = "User1", FriendCode = "USER1" };
        var friend = new User { Email = "friend@test.com", Nickname = "User2", FriendCode = "FRIEND2" };
        context.Users.AddRange(user, friend);
        await context.SaveChangesAsync();

        var controller = CreateController(context, user.Email);
        var request = new FriendRequest { FriendCode = "FRIEND2" };

        // Act
        var result = await controller.AddFriend(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var userFriends = await context.UserFriends.ToListAsync();
        userFriends.Should().HaveCount(1);
        userFriends[0].UserId.Should().Be(user.Id);
        userFriends[0].FriendId.Should().Be(friend.Id);
    }

    [Fact]
    public async Task AddFriend_WithInvalidFriendCode_ReturnsNotFound()
    {
        // Arrange
        var context = GetDbContext();
        var user = new User { Email = "user@test.com", Nickname = "User1" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var controller = CreateController(context, user.Email);
        var request = new FriendRequest { FriendCode = "INVALID_CODE" };

        // Act
        var result = await controller.AddFriend(request);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        notFoundResult.Value.Should().Be("Geçersiz Arkadaş ID'si.");
    }
}
