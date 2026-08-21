using MedSim.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(MedSimDbContext context)
    {
        // Add Curriculum Hierarchy
        await CurriculumSeeder.SeedAsync(context);

        // Seed high-quality classic Anatomy TUS questions (idempotent)
        await AnatomyClassicSeeder.SeedAsync(context);

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

        // Add Mock TUS Questions and Knowledge Base
        if (!await context.TusKnowledges.AnyAsync())
        {
            var k1 = new TusKnowledge
            {
                Id = Guid.NewGuid(),
                KnowledgeText = "ACE inhibitörleri gebelikte kontrendikedir.",
                Subject = "Farmakoloji",
                ImportanceScore = 95,
                RepetitionFrequency = "Çok Yüksek",
                Sources = "ÖSYM TUS 2023; TUS Konu Anlatımı X",
                IsActive = true
            };

            var k2 = new TusKnowledge
            {
                Id = Guid.NewGuid(),
                KnowledgeText = "Osteokondrom en sık görülen benign kemik tümörüdür.",
                Subject = "Ortopedi ve Travmatoloji",
                ImportanceScore = 90,
                RepetitionFrequency = "Yüksek",
                Sources = "TUS Soru Bankası Y; Klinik Notlar Z",
                IsActive = true
            };

            context.TusKnowledges.AddRange(k1, k2);

            var tusQuestions = new List<TusQuestion>
            {
                new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    TusKnowledgeId = k1.Id,
                    TusKnowledge = k1,
                    Category = "Temel Bilimler",
                    Subject = "Farmakoloji",
                    QuestionText = "ACE inhibitörleri aşağıdaki durumlardan hangisinde kontrendikedir?",
                    OptionA = "Diyabetes Mellitus",
                    OptionB = "Gebelik",
                    OptionC = "Hipertansiyon",
                    OptionD = "Hiperkolesterolemi",
                    OptionE = "Migren",
                    CorrectOption = "B",
                    Explanation = "ACE inhibitörleri teratojenik etkilerinden dolayı gebelikte kesinlikle kontrendikedir.",
                    IsClassic = true,
                    IsApproved = true
                },
                new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    TusKnowledgeId = k1.Id,
                    TusKnowledge = k1,
                    Category = "Temel Bilimler",
                    Subject = "Farmakoloji",
                    QuestionText = "Gebelikte kullanılmaması gereken antihipertansif ilaç grubu aşağıdakilerden hangisidir?",
                    OptionA = "Beta blokerler",
                    OptionB = "Kalsiyum kanal blokerleri",
                    OptionC = "ACE inhibitörleri",
                    OptionD = "Alfa blokerler",
                    OptionE = "Diüretikler",
                    CorrectOption = "C",
                    Explanation = "ACE inhibitörleri gebelikte fetotoksik etki (özellikle böbrek yetmezliği, oligohidramniyos) gösterdiğinden kullanılmaz.",
                    IsClassic = true,
                    IsApproved = true
                },
                new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    TusKnowledgeId = k2.Id,
                    TusKnowledge = k2,
                    Category = "Klinik Bilimler",
                    Subject = "Ortopedi ve Travmatoloji",
                    QuestionText = "En sık görülen benign kemik tümörü aşağıdakilerden hangisidir?",
                    OptionA = "Osteoid osteoma",
                    OptionB = "Osteokondrom",
                    OptionC = "Kondrom",
                    OptionD = "Osteoblastom",
                    OptionE = "Dev hücreli tümör",
                    CorrectOption = "B",
                    Explanation = "Benign kemik tümörleri arasında en sık görüleni osteokondromdur (ekzostoz).",
                    IsClassic = true,
                    IsApproved = true
                },
                new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    TusKnowledgeId = k2.Id,
                    TusKnowledge = k2,
                    Category = "Klinik Bilimler",
                    Subject = "Ortopedi ve Travmatoloji",
                    QuestionText = "Kemikte benign neoplaziler arasında en yüksek sıklığa sahip olan antite hangisidir?",
                    OptionA = "Osteosarkom",
                    OptionB = "Ewing sarkomu",
                    OptionC = "Kondrosarkom",
                    OptionD = "Osteokondrom",
                    OptionE = "Enkondrom",
                    CorrectOption = "D",
                    Explanation = "Osteokondrom en sık izlenen benign kemik tümörüdür. Genellikle metafiz yerleşimlidir.",
                    IsClassic = true,
                    IsApproved = true
                }
            };
            
            context.TusQuestions.AddRange(tusQuestions);
            await context.SaveChangesAsync();
        }
    }
}
