using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using MedSim.Api.Controllers;
using MedSim.Api.Hubs;
using MedSim.Application.DTOs;
using MedSim.Application.Interfaces;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MedSim.Tests.Controllers;

public class FeedbacksControllerTests
{
    private readonly Mock<IFeedbackRepository> _feedbackRepoMock;
    private readonly Mock<IHubContext<MedSimHub>> _hubContextMock;
    private readonly Mock<IHubClients> _hubClientsMock;
    private readonly Mock<IClientProxy> _clientProxyMock;
    private readonly MedSimDbContext _dbContext;
    private readonly FeedbacksController _controller;

    public FeedbacksControllerTests()
    {
        _feedbackRepoMock = new Mock<IFeedbackRepository>();
        
        // Mock SignalR Hub
        _hubContextMock = new Mock<IHubContext<MedSimHub>>();
        _hubClientsMock = new Mock<IHubClients>();
        _clientProxyMock = new Mock<IClientProxy>();

        _hubContextMock.Setup(x => x.Clients).Returns(_hubClientsMock.Object);
        _hubClientsMock.Setup(x => x.All).Returns(_clientProxyMock.Object);

        // Setup In-Memory DbContext
        var options = new DbContextOptionsBuilder<MedSimDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _dbContext = new MedSimDbContext(options);

        _controller = new FeedbacksController(_feedbackRepoMock.Object, _dbContext, _hubContextMock.Object);
    }

    private void SetUserContext(string email)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.Email, email),
        }, "mock"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task CreateFeedback_ValidUser_SavesToDbAndTriggersSignalR()
    {
        // Arrange
        var testEmail = "test@example.com";
        var testUser = new User { Id = Guid.NewGuid(), Email = testEmail, Nickname = "testuser" };
        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        SetUserContext(testEmail);

        var request = new CreateFeedbackDto
        {
            Message = "Great app!",
            Teaching = 5,
            Usability = 4
        };

        // Act
        var result = await _controller.CreateFeedback(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        
        _feedbackRepoMock.Verify(r => r.AddFeedbackAsync(It.Is<Feedback>(f => 
            f.UserId == testUser.Id && 
            f.Message == "Great app!" && 
            f.Teaching == 5 && 
            f.Usability == 4
        )), Times.Once);

        _clientProxyMock.Verify(
            clientProxy => clientProxy.SendCoreAsync(
                "AdminDataUpdated",
                It.Is<object[]>(o => o != null && o.Length == 0),
                default(CancellationToken)),
            Times.Once);
    }

    [Fact]
    public async Task GetFeedbacks_ReturnsMappedDtos()
    {
        // Arrange
        var mockFeedbacks = new List<Feedback>
        {
            new Feedback { Id = Guid.NewGuid(), Message = "FB1", User = new User { Email = "u1@e.com", Nickname = "u1" } },
            new Feedback { Id = Guid.NewGuid(), Message = "FB2", User = new User { Email = "u2@e.com", Nickname = "u2" } }
        };

        _feedbackRepoMock.Setup(r => r.GetAllFeedbacksAsync()).ReturnsAsync(mockFeedbacks);

        // Act
        var result = await _controller.GetFeedbacks();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var dtos = Assert.IsAssignableFrom<IEnumerable<FeedbackDto>>(okResult.Value);
        
        dtos.Should().HaveCount(2);
        dtos.Should().Contain(f => f.Message == "FB1" && f.UserEmail == "u1@e.com");
    }
}
