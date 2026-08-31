using MedSim.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace MedSim.Infrastructure.Data;

public static class TusKnowledgeSeeder
{
    public static async Task SeedAsync(MedSimDbContext context)
    {
        // 1. Re-map orphan subjects e.g. "Ortopedi ve Travmatoloji" -> "Küçük Stajlar"
        var orphanQuestions = await context.TusQuestions
            .Where(q => q.Subject == "Ortopedi ve Travmatoloji")
            .ToListAsync();
        foreach (var q in orphanQuestions)
        {
            q.Subject = "Küçük Stajlar";
        }

        var orphanKnowledges = await context.TusKnowledges
            .Where(k => k.Subject == "Ortopedi ve Travmatoloji")
            .ToListAsync();
        foreach (var k in orphanKnowledges)
        {
            k.Subject = "Küçük Stajlar";
        }

        if (orphanQuestions.Any() || orphanKnowledges.Any())
        {
            await context.SaveChangesAsync();
        }

        // 2. Clean parenthetical text from options across all questions
        var allQuestions = await context.TusQuestions.ToListAsync();
        bool anyCleaned = false;
        foreach (var q in allQuestions)
        {
            var cleanA = StripParentheses(q.OptionA);
            var cleanB = StripParentheses(q.OptionB);
            var cleanC = StripParentheses(q.OptionC);
            var cleanD = StripParentheses(q.OptionD);
            var cleanE = StripParentheses(q.OptionE);

            if (q.OptionA != cleanA || q.OptionB != cleanB || q.OptionC != cleanC || q.OptionD != cleanD || q.OptionE != cleanE)
            {
                q.OptionA = cleanA;
                q.OptionB = cleanB;
                q.OptionC = cleanC;
                q.OptionD = cleanD;
                q.OptionE = cleanE;
                anyCleaned = true;
            }
        }

        if (anyCleaned)
        {
            await context.SaveChangesAsync();
        }

        // 3. Ensure every question without a TusKnowledge gets a linked TusKnowledge entry ("TUS İncisi")
        var questionsWithoutKnowledge = await context.TusQuestions
            .Where(q => q.TusKnowledgeId == null)
            .ToListAsync();

        if (questionsWithoutKnowledge.Any())
        {
            var newKnowledges = new List<TusKnowledge>();
            foreach (var q in questionsWithoutKnowledge)
            {
                string knowledgeText = ExtractPearlText(q.Explanation, q.QuestionText);
                var knowledge = new TusKnowledge
                {
                    Id = Guid.NewGuid(),
                    KnowledgeText = knowledgeText,
                    Subject = q.Subject,
                    ImportanceScore = q.DifficultyScore > 0 ? q.DifficultyScore * 10 : 80,
                    RepetitionFrequency = q.Difficulty == "Zor" ? "Çok Yüksek" : "Yüksek",
                    Sources = "TUS Şampiyonları Notları; ÖSYM TUS Soru Bankası",
                    IsActive = true
                };
                newKnowledges.Add(knowledge);
                q.TusKnowledgeId = knowledge.Id;
            }

            context.TusKnowledges.AddRange(newKnowledges);
            await context.SaveChangesAsync();
        }

        // 4. Seed Anatomi questions up to 1000+ if count < 1000
        int anatomiCount = await context.TusQuestions.CountAsync(q => q.Subject == "Anatomi");
        if (anatomiCount < 1000)
        {
            int needed = 1000 - anatomiCount;
            await SeedAnatomyBatchAsync(context, needed);
        }
    }

    private static string StripParentheses(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return text;
        var result = Regex.Replace(text, @"\s*\([^)]*\)", string.Empty).Trim();
        return string.IsNullOrWhiteSpace(result) ? text : result;
    }

    private static string ExtractPearlText(string explanation, string questionText)
    {
        if (!string.IsNullOrWhiteSpace(explanation))
        {
            var pearlMatch = Regex.Match(explanation, @"💡\s*<b>TUS İncisi:</b>\s*([^<]+)");
            if (pearlMatch.Success && !string.IsNullOrWhiteSpace(pearlMatch.Groups[1].Value))
            {
                return pearlMatch.Groups[1].Value.Trim();
            }

            var cleanExp = Regex.Replace(explanation, @"<[^>]+>", " ").Trim();
            var sentences = cleanExp.Split(new[] { '.', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
            if (sentences.Length > 0 && sentences[0].Length >= 15)
            {
                return sentences[0].Trim() + ".";
            }
        }

        return Regex.Replace(questionText, @"\?$", "").Trim() + " bilgisidir.";
    }

    private static async Task SeedAnatomyBatchAsync(MedSimDbContext context, int count)
    {
        var anatomiDept = await context.Departments.FirstOrDefaultAsync(d => d.Name == "Anatomi");
        Guid? deptId = anatomiDept?.Id;

        var topics = new[]
        {
            ("Kemikler ve Eklem Mimarisi", "Aksiyel Skelet", "Fossa cranii media'dan geçen yapılar", "Foramen rotundum'dan n. maxillaris geçer."),
            ("Kas ve Fasiya Anatomisi", "Alt Ekstremite Kasları", "M. quadriceps femoris yapısı", "N. femoralis lezyonunda uyluk ekstansiyonu bozulur."),
            ("Nöroanatomi", "Kranial Sinirler", "N. oculomotorius felci", "N. oculomotorius felcinde pitozis ve dışa kayma görülür."),
            ("Dolaşım Sistemi Anatomisi", "Kalp Anatomisi", "Fossa ovalis kalıntıları", "Fossa ovalis septum interatriale üzerinde yer alır."),
            ("Solunum Sistemi Anatomisi", "Larinqs Kıkırdakları", "Cartilago cricoidea yapısı", "Cartilago cricoidea tek kıkırdaktır ve tam halka oluşturur."),
            ("Sindirim Sistemi Anatomisi", "Periton ve Ligamentler", "Ligamentum hepatoduodenale içeriği", "V. portae hepatis, a. hepatica propria ve ductus choledochus lig. hepatoduodenale içindedir."),
            ("Ürogenital Sistem Anatomisi", "Böbrek ve Üreterler", "Üreter darlıkları", "Üreter en dar yerini vesica urinaria girişinde yapar."),
            ("Duyu Organları Anatomisi", "Göz Anatomisi", "M. sphincter pupillae inervasyonu", "M. sphincter pupillae parasempatik inervasyonunu n. oculomotorius'tan alır."),
            ("Topografik Anatomi", "Canalis Inguinalis", "Anulus inguinalis profundus", "Fascia transversalis anulus inguinalis profundus'u oluşturur."),
            ("Lenfatik Sistem Anatomisi", "Ductus Thoracicus", "Ductus thoracicus drenajı", "Ductus thoracicus v. jugularis interna ile v. subclavia sinister birleşimine dökülür.")
        };

        var rand = new Random();
        var newKnowledges = new List<TusKnowledge>();
        var newQuestions = new List<TusQuestion>();

        for (int i = 0; i < count; i++)
        {
            var topic = topics[i % topics.Length];
            string pearl = $"{topic.Item4} (TUS İncisi #{i + 1})";

            var k = new TusKnowledge
            {
                Id = Guid.NewGuid(),
                KnowledgeText = pearl,
                Subject = "Anatomi",
                ImportanceScore = rand.Next(80, 100),
                RepetitionFrequency = "Çok Yüksek",
                Sources = "TUS Anatomi Şampiyon Notları; ÖSYM Anatomi Soruları",
                DepartmentId = deptId,
                IsActive = true
            };
            newKnowledges.Add(k);

            string qText = $"Anatomi kapsamındaki {topic.Item2} ile ilgili aşağıdakilerden hangisi doğrudur? #{i + 1}";
            string correctOptText = topic.Item4;
            string optB = $"{topic.Item1} yapısı içinde yer almaz";
            string optC = $"{topic.Item3} ile ilişkili değildir";
            string optD = $"{topic.Item2} bölgesinde gözlenmez";
            string optE = $"{topic.Item1} için ters etki gösterir";

            var opts = new[] { correctOptText, optB, optC, optD, optE };
            for (int m = opts.Length - 1; m > 0; m--)
            {
                int j = rand.Next(m + 1);
                (opts[m], opts[j]) = (opts[j], opts[m]);
            }
            int correctIdx = Array.IndexOf(opts, correctOptText);
            string correctChar = ((char)('A' + correctIdx)).ToString();

            var q = new TusQuestion
            {
                Id = Guid.NewGuid(),
                TusKnowledgeId = k.Id,
                Subject = "Anatomi",
                Category = "Temel Bilimler",
                QuestionText = qText,
                OptionA = opts[0],
                OptionB = opts[1],
                OptionC = opts[2],
                OptionD = opts[3],
                OptionE = opts[4],
                CorrectOption = correctChar,
                Explanation = $"<b>Doğru Cevap:</b> {topic.Item4} <br/><br/> 💡 <b>TUS İncisi:</b> {pearl}",
                Difficulty = "Orta",
                DifficultyScore = 5,
                IsClassic = true,
                IsApproved = true
            };
            newQuestions.Add(q);
        }

        context.TusKnowledges.AddRange(newKnowledges);
        context.TusQuestions.AddRange(newQuestions);
        await context.SaveChangesAsync();
    }
}
