using MedSim.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(MedSimDbContext context)
    {
        // Add Departments
        if (!await context.Departments.AnyAsync())
        {
            var deptsByYear = new Dictionary<int, string[]>
            {
                { 1, new[] { "Anatomi", "Tıbbi Biyoloji", "Histoloji" } },
                { 2, new[] { "Fizyoloji", "Mikrobiyoloji", "Biyokimya" } },
                { 3, new[] { "Farmakoloji", "Patoloji" } },
                { 4, new[] { "Dahiliye", "Genel Cerrahi", "Kadın Hastalıkları ve Doğum", "Pediatri" } },
                { 5, new[] { "Ortopedi", "Göz Hastalıkları", "KBB", "Psikiyatri", "Dermatoloji" } },
                { 6, new[] { "Acil Tıp", "Aile Hekimliği", "Yoğun Bakım" } }
            };

            foreach (var year in deptsByYear)
            {
                foreach (var deptName in year.Value)
                {
                    context.Departments.Add(new Department
                    {
                        Id = Guid.NewGuid(),
                        Name = deptName,
                        Year = year.Key
                    });
                }
            }

            await context.SaveChangesAsync();
        }

        // Add Test User
        if (!await context.Users.AnyAsync(u => u.Email == "test@test.com"))
        {
            context.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Email = "test@test.com",
                Nickname = "Dr. John Doe",
                PasswordHash = "test",
                Points = 0,
                Avatar = "👨‍⚕️"
            });

            await context.SaveChangesAsync();
        }
    }
}
