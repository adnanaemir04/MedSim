using MedSim.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Infrastructure.Data;

public class MedSimDbContext : DbContext
{
    public MedSimDbContext(DbContextOptions<MedSimDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<SolvedCase> SolvedCases { get; set; } = null!;
    public DbSet<UserFriend> UserFriends { get; set; } = null!;
    public DbSet<TusQuestion> TusQuestions { get; set; } = null!;
    public DbSet<TusSolvedQuestion> TusSolvedQuestions { get; set; } = null!;
    
    // Simulation Engine Entities
    public DbSet<Department> Departments { get; set; } = null!;
    public DbSet<MedicalCase> MedicalCases { get; set; } = null!;
    public DbSet<CaseStage> CaseStages { get; set; } = null!;
    public DbSet<CaseOption> CaseOptions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Nickname).IsUnique();
        });

        modelBuilder.Entity<SolvedCase>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.SolvedCases)
                  .HasForeignKey(e => e.UserId);
                  
            entity.HasOne(e => e.MedicalCase)
                  .WithMany()
                  .HasForeignKey(e => e.MedicalCaseId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserFriend>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.FriendId });
            
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Friends)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.Friend)
                  .WithMany()
                  .HasForeignKey(e => e.FriendId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TusSolvedQuestion>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(e => e.User)
                  .WithMany(u => u.TusSolvedQuestions)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
                  
            entity.HasOne(e => e.TusQuestion)
                  .WithMany()
                  .HasForeignKey(e => e.TusQuestionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Simulation Relationships
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasMany(e => e.Cases)
                  .WithOne(c => c.Department)
                  .HasForeignKey(c => c.DepartmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MedicalCase>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasMany(e => e.Stages)
                  .WithOne(s => s.MedicalCase)
                  .HasForeignKey(s => s.MedicalCaseId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CaseStage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasMany(e => e.Options)
                  .WithOne(o => o.CaseStage)
                  .HasForeignKey(o => o.CaseStageId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<CaseOption>(entity =>
        {
            entity.HasKey(e => e.Id);
        });
    }
}
