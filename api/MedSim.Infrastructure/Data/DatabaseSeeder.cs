using MedSim.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(MedSimDbContext context)
    {
        // Add Curriculum Hierarchy
        await CurriculumSeeder.SeedAsync(context);

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

        // Add Mock TUS Questions
        if (!await context.TusQuestions.AnyAsync())
        {
            var tusQuestions = new List<TusQuestion>
            {
                new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    Category = "Klinik Bilimler",
                    Subject = "Dahiliye",
                    QuestionText = "Aşağıdakilerden hangisi akut pankreatitin en sık nedenidir?",
                    OptionA = "Alkol kullanımı",
                    OptionB = "Safra taşları",
                    OptionC = "Hipertrigliseridemi",
                    OptionD = "Travma",
                    OptionE = "İlaçlar",
                    CorrectOption = "B",
                    Explanation = "Akut pankreatitin en sık nedeni safra taşlarıdır (koledokolitiyazis). İkinci sıklıkta alkol kullanımı gelir."
                },
                new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    Category = "Temel Bilimler",
                    Subject = "Anatomi",
                    QuestionText = "Nervus phrenicus hangi spinal sinir köklerinden köken alır?",
                    OptionA = "C1, C2, C3",
                    OptionB = "C2, C3, C4",
                    OptionC = "C3, C4, C5",
                    OptionD = "C4, C5, C6",
                    OptionE = "C5, C6, C7",
                    CorrectOption = "C",
                    Explanation = "N. phrenicus esas olarak C4'ten köken alırken, C3 ve C5'ten de dallar alır. (C3, C4, C5 keeps the diaphragm alive)."
                }
            };
            
            context.TusQuestions.AddRange(tusQuestions);
            await context.SaveChangesAsync();
        }
    }
}
