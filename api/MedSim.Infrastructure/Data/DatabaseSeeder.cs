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
                { 1, new[] { "Anatomi", "Fizyoloji", "Tıbbi Biyokimya", "Histoloji ve Embriyoloji", "Tıbbi Biyoloji ve Genetik" } },
                { 2, new[] { "Tıbbi Mikrobiyoloji", "Nöroanatomi", "Biyofizik", "İlk Yardım" } },
                { 3, new[] { "Tıbbi Patoloji", "Tıbbi Farmakoloji", "Klinik Bilimlere Giriş", "Biyoistatistik" } },
                { 4, new[] { "İç Hastalıkları (Dahiliye)", "Çocuk Sağlığı ve Hastalıkları", "Genel Cerrahi", "Kadın Hastalıkları ve Doğum" } },
                { 5, new[] { "Nöroloji", "Psikiyatri", "Ortopedi ve Travmatoloji", "Göz Hastalıkları", "KBB", "Üroloji", "Dermatoloji", "Enfeksiyon Hastalıkları", "Kardiyoloji" } },
                { 6, new[] { "Acil Tıp", "Aile Hekimliği", "Halk Sağlığı", "Yoğun Bakım" } }
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
