using Microsoft.AspNetCore.SignalR;

namespace MedSim.Api.Hubs;

public class MedSimHub : Hub
{
    // Clients can call this, or backend can broadcast via IHubContext
    public async Task SendLeaderboardUpdate()
    {
        await Clients.All.SendAsync("LeaderboardUpdated");
    }
}
