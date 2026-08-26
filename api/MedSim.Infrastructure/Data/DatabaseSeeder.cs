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

    public static async Task CleanClassicQuestionsAsync(MedSimDbContext context)
    {
        var questions = await context.TusQuestions
            .Where(q => q.IsClassic)
            .ToListAsync();

        int updatedCount = 0;

        foreach (var q in questions)
        {
            bool modified = false;

            var cleanedA = CleanParentheses(q.OptionA);
            var cleanedB = CleanParentheses(q.OptionB);
            var cleanedC = CleanParentheses(q.OptionC);
            var cleanedD = CleanParentheses(q.OptionD);
            var cleanedE = CleanParentheses(q.OptionE);

            if (cleanedA != q.OptionA) { q.OptionA = cleanedA; modified = true; }
            if (cleanedB != q.OptionB) { q.OptionB = cleanedB; modified = true; }
            if (cleanedC != q.OptionC) { q.OptionC = cleanedC; modified = true; }
            if (cleanedD != q.OptionD) { q.OptionD = cleanedD; modified = true; }
            if (cleanedE != q.OptionE) { q.OptionE = cleanedE; modified = true; }

            var options = new string[] { q.OptionA, q.OptionB, q.OptionC, q.OptionD, q.OptionE };
            var correctOption = q.CorrectOption?.Trim().ToUpper();
            int correctIdx = -1;
            if (correctOption == "A") correctIdx = 0;
            else if (correctOption == "B") correctIdx = 1;
            else if (correctOption == "C") correctIdx = 2;
            else if (correctOption == "D") correctIdx = 3;
            else if (correctOption == "E") correctIdx = 4;

            if (correctIdx >= 0 && correctIdx < 5)
            {
                var lengths = options.Select(o => o.Length).ToArray();
                int maxLen = lengths.Max();
                
                if (lengths[correctIdx] == maxLen)
                {
                    var otherMax = lengths.Where((len, idx) => idx != correctIdx).Max();
                    if (lengths[correctIdx] >= otherMax)
                    {
                        int targetIdx = correctIdx == 0 ? 1 : 0;
                        int neededLen = lengths[correctIdx] - lengths[targetIdx] + 1;

                        string suffix = GetFillerSuffix(neededLen, q.Subject);
                        
                        if (targetIdx == 0) q.OptionA += suffix;
                        else if (targetIdx == 1) q.OptionB += suffix;
                        else if (targetIdx == 2) q.OptionC += suffix;
                        else if (targetIdx == 3) q.OptionD += suffix;
                        else if (targetIdx == 4) q.OptionE += suffix;

                        modified = true;
                    }
                }
            }

            if (modified)
            {
                updatedCount++;
            }
        }

        if (updatedCount > 0)
        {
            await context.SaveChangesAsync();
            Console.WriteLine($"[TusQuestionCleaner] Successfully cleaned {updatedCount} classic questions in the DB.");
        }
    }

    private static string CleanParentheses(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        return System.Text.RegularExpressions.Regex.Replace(text, @"\s*\([^)]*\)", "").Trim();
    }

    private static string GetFillerSuffix(int neededLen, string subject)
    {
        string suffix = " ve ilişkili anatomik komşuluklar ile çevre dokular";
        if (subject == "Farmakoloji")
        {
            suffix = " ve benzer etki mekanizmalı diğer farmakolojik ajanlar";
        }
        else if (subject != "Anatomi")
        {
            suffix = " ve klinik patolojiler ile ilişkili tanı kriterleri";
        }

        while (suffix.Length < neededLen)
        {
            suffix += " ve diğer klinik olarak önemli komşu yapılar";
        }
        return suffix;
    }
}
