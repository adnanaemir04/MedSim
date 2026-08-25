using System;

namespace MedSim.Application.Common;

public static class CacheKeys
{
    public const string Departments = "departments:all";
    public const string Cases = "cases:all";
    public const string UserLeaderboard = "users:leaderboard";
    public const string TusLeaderboard = "tus:leaderboard";
    
    public static string UserProfile(Guid userId) => $"users:{userId}:profile";
    public static string UserProfile(string email) => $"users:{email.ToLower()}:profile";
}
