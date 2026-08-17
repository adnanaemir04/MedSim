namespace MedSim.Domain.Entities;

public class UserFriend
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid FriendId { get; set; }
    public User Friend { get; set; } = null!;
    
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
