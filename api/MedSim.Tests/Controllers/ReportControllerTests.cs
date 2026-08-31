using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using MedSim.Api.Controllers;
using MedSim.Api.Hubs;
using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace MedSim.Tests.Controllers;

public class ReportControllerTests
{
    private readonly Mock<IHubContext<MedSimHub>> _hubContextMock;
    private readonly Mock<IHubClients> _hubClientsMock;
    private readonly Mock<IClientProxy> _clientProxyMock;
    private readonly MedSimDbContext _dbContext;
    private readonly ReportController _controller;

    public ReportControllerTests()
    {
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

        _controller = new ReportController(_dbContext, _hubContextMock.Object);
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
    public async Task CreateReport_ValidUser_SavesToDbAndTriggersSignalR()
    {
        // Arrange
        var testEmail = "reporter@example.com";
        var testUser = new User { Id = Guid.NewGuid(), Email = testEmail, Nickname = "reporter" };
        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        SetUserContext(testEmail);

        var request = new CreateReportRequest
        {
            ContentId = Guid.NewGuid(),
            ContentType = "MedicalCase",
            ReportType = "Inaccurate",
            Description = "Test"
        };

        // Act
        var result = await _controller.CreateReport(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var savedReport = await _dbContext.ContentReports.FirstOrDefaultAsync();
        savedReport.Should().NotBeNull();
        savedReport!.ContentId.Should().Be(request.ContentId);
        savedReport.Status.Should().Be("Pending");

        _clientProxyMock.Verify(
            clientProxy => clientProxy.SendCoreAsync(
                "AdminDataUpdated",
                It.Is<object[]>(o => o != null && o.Length == 0),
                default(CancellationToken)),
            Times.Once);
    }

    [Fact]
    public async Task CreateReport_DuplicatePendingReport_ReturnsBadRequest()
    {
        // Arrange
        var testEmail = "spam@example.com";
        var testUser = new User { Id = Guid.NewGuid(), Email = testEmail, Nickname = "spam" };
        _dbContext.Users.Add(testUser);
        
        var existingContentId = Guid.NewGuid();
        _dbContext.ContentReports.Add(new ContentReport 
        { 
            ContentId = existingContentId, 
            ContentType = "MedicalCase", 
            ReporterId = testUser.Id, 
            Status = "Pending" 
        });
        
        await _dbContext.SaveChangesAsync();

        SetUserContext(testEmail);

        var request = new CreateReportRequest
        {
            ContentId = existingContentId,
            ContentType = "MedicalCase",
            ReportType = "Typo"
        };

        // Act
        var result = await _controller.CreateReport(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        
        _clientProxyMock.Verify(
            clientProxy => clientProxy.SendCoreAsync(
                "AdminDataUpdated",
                It.IsAny<object[]>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
