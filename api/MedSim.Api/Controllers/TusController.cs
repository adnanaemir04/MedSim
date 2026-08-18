using MedSim.Application.Interfaces;
using MedSim.Application.Services;
using MedSim.Domain.Entities;
using MedSim.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TusController : ControllerBase
{
    private readonly ITusRepository _tusRepository;
    private readonly IProceduralGeneratorService _proceduralGeneratorService;
    private readonly MedSimDbContext _context;

    public TusController(ITusRepository tusRepository, IProceduralGeneratorService proceduralGeneratorService, MedSimDbContext context)
    {
        _tusRepository = tusRepository;
        _proceduralGeneratorService = proceduralGeneratorService;
        _context = context;
    }

    [HttpGet("subjects")]
    public async Task<IActionResult> GetSubjects()
    {
        var subjects = await _tusRepository.GetSubjectsAsync();
        return Ok(subjects);
    }

    [HttpGet("questions")]
    public async Task<IActionResult> GetQuestions([FromQuery] int count = 5, [FromQuery] string? subject = null)
    {
        var questions = await _tusRepository.GetQuestionsAsync(count, subject);
        return Ok(questions);
    }

    [HttpPost("submit-answer")]
    public async Task<IActionResult> SubmitAnswer([FromBody] TusAnswerRequest request)
    {
        try
        {
            var result = await _tusRepository.SubmitAnswerAsync(request.Email, request.QuestionId, request.SelectedOption);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] string email, [FromQuery] string? subject = null)
    {
        try
        {
            var stats = await _tusRepository.GetStatsAsync(email, subject);
            return Ok(stats);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("solved-list")]
    public async Task<IActionResult> GetSolvedQuestionsList([FromQuery] string email, [FromQuery] string? subject = null)
    {
        try
        {
            var list = await _tusRepository.GetSolvedQuestionsListAsync(email, subject);
            return Ok(list);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        var leaderboard = await _tusRepository.GetLeaderboardAsync();
        return Ok(leaderboard);
    }

    [HttpPost("explain-concepts")]
    public async Task<IActionResult> ExplainConcepts([FromBody] ExplainConceptRequest request)
    {
        var question = await _tusRepository.GetQuestionByIdAsync(request.QuestionId);
        if (question == null) return NotFound("Soru bulunamadı.");

        try
        {
            var explanation = await _proceduralGeneratorService.ExplainTusConceptsAsync(
                question.QuestionText,
                question.OptionA,
                question.OptionB,
                question.OptionC,
                question.OptionD,
                question.OptionE,
                question.CorrectOption,
                question.Explanation
            );

            return Ok(new { explanation = "Bu sorunun detayı yapay zeka tarafından oluşturulacaktır. (Mock Explanation)" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Kavram açıklaması üretilemedi: " + ex.Message });
        }
    }

    private class MedicalConcept
    {
        public string Name { get; set; } = "";
        public string Subject { get; set; } = "";
        public string[] KeySymptoms { get; set; } = new string[0];
        public string[] DiagnosticTests { get; set; } = new string[0];
        public string[] BestTreatments { get; set; } = new string[0];
        public string Pathophysiology { get; set; } = "";
        public string RiskFactorOrComplication { get; set; } = "";
        public string[] Distractors { get; set; } = new string[0];
    }

    [HttpPost("seed-classic")]
    public async Task<IActionResult> SeedClassicQuestions()
    {
        var subjects = new[]
        {
            "Anatomi", "Histoloji ve Embriyoloji", "Fizyoloji", "Biyokimya", "Mikrobiyoloji", 
            "Patoloji", "Farmakoloji", "Dahiliye", "Pediatri", 
            "Genel Cerrahi", "Kadın Hastalıkları ve Doğum", "Küçük Stajlar"
        };

        var random = new Random();
        int totalSeeded = 0;

        foreach (var subject in subjects)
        {
            // Clear existing questions for this subject to replace placeholders
            var oldQuestions = await _context.TusQuestions.Where(q => q.Subject == subject).ToListAsync();
            _context.TusQuestions.RemoveRange(oldQuestions);
            await _context.SaveChangesAsync();

            var concepts = GetConceptsForSubject(subject);
            var questionsToAdd = new List<TusQuestion>();

            for (int i = 0; i < 1000; i++)
            {
                var concept = concepts[random.Next(concepts.Count)];
                int age = random.Next(18, 80);
                string gender = random.Next(2) == 0 ? "kadın" : "erkek";
                string patientStr = $"{age} yaşında {gender} hasta";

                // We can generate 3 types of questions: 0 = Diagnosis, 1 = Diagnostic Test, 2 = Best Treatment
                int questionType = random.Next(3);
                
                string questionText = "";
                string correctOptionText = "";
                string explanationText = "";
                var distractorsList = new List<string>();

                string symptom = concept.KeySymptoms[random.Next(concept.KeySymptoms.Length)];
                string test = concept.DiagnosticTests[random.Next(concept.DiagnosticTests.Length)];
                string rx = concept.BestTreatments[random.Next(concept.BestTreatments.Length)];

                if (questionType == 0) // Diagnosis
                {
                    questionText = $"{patientStr}, {symptom} şikayetleriyle başvuruyor. Yapılan tetkiklerde {test} bulgusu izleniyor. Bu klinik tablo için en olası tanı hangisidir?";
                    correctOptionText = concept.Name;
                    explanationText = $"Bu hastada izlenen {symptom} ve {test} bulguları, klasik olarak {concept.Name} tablosunu işaret etmektedir.";
                    distractorsList = concept.Distractors.ToList();
                }
                else if (questionType == 1) // Diagnostic Test
                {
                    questionText = $"{patientStr}da {concept.Name} düşünülmektedir. Tanıyı kesinleştirmek veya doğrulamak için ilk yapılması gereken veya en değerli tetkik hangisidir?";
                    correctOptionText = test;
                    explanationText = $"{concept.Name} şüphesi olan bir hastada tanıyı doğrulamak için {test} yapılması klinik kılavuzlarda ilk sırada önerilmektedir.";
                    distractorsList = concept.Distractors.Select(d => $"Alternatif {d} tetkiki").ToList();
                    if (distractorsList.Count < 4) distractorsList.AddRange(new[] { "Biyopsi", "Kültür testi", "Abdominal Ultrasonografi", "Kontrastlı abdominal BT", "Rutin kan tetkikleri" });
                }
                else // Best Treatment
                {
                    questionText = $"{patientStr}da yapılan tetkikler sonucunda {concept.Name} tanısı konuluyor. Bu aşamada en uygun ve ilk seçilecek tedavi veya yönetim hangisidir?";
                    correctOptionText = rx;
                    explanationText = $"{concept.Name} tanısı konulan hastalarda ilk ve en etkin tedavi seçeneği olarak {rx} uygulanması kılavuzlarca önerilir.";
                    distractorsList = concept.Distractors.Select(d => $"{d} tedavisi").ToList();
                    if (distractorsList.Count < 4) distractorsList.AddRange(new[] { "Gözlem ve izlem", "Semptomatik tedavi", "Geniş spektrumlu antibiyotik", "Cerrahi rezeksiyon", "Destek tedavisi" });
                }

                // Prepare options
                var options = new List<string> { correctOptionText };
                var uniqueDistractors = distractorsList.Distinct().Where(d => d != correctOptionText).OrderBy(x => random.Next()).Take(4).ToList();
                options.AddRange(uniqueDistractors);

                // If somehow we don't have 5 options, pad them
                while (options.Count < 5)
                {
                    options.Add($"Diğer klinik seçenek {Guid.NewGuid().ToString().Substring(0, 4)}");
                }

                var shuffled = options.OrderBy(x => random.Next()).ToList();
                int correctIndex = shuffled.IndexOf(correctOptionText);
                string correctLetter = ((char)('A' + correctIndex)).ToString();

                var q = new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    Subject = subject,
                    Category = subject == "Anatomi" || subject == "Fizyoloji" || subject == "Biyokimya" || subject == "Mikrobiyoloji" || subject == "Patoloji" || subject == "Farmakoloji" ? "Temel Bilimler" : "Klinik Bilimler",
                    QuestionText = qTextFormatting(i + 1, questionText),
                    OptionA = shuffled[0],
                    OptionB = shuffled[1],
                    OptionC = shuffled[2],
                    OptionD = shuffled[3],
                    OptionE = shuffled[4],
                    CorrectOption = correctLetter,
                    Explanation = explanationText
                };
                questionsToAdd.Add(q);
            }

            _context.TusQuestions.AddRange(questionsToAdd);
            await _context.SaveChangesAsync();
            totalSeeded += 1000;
        }

        return Ok(new { message = $"{totalSeeded} adet yüksek kaliteli, çeşitlendirilmiş klasikleşmiş TUS sorusu başarıyla veritabanına eklendi." });
    }

    private string qTextFormatting(int num, string text)
    {
        return $"{num}. Soru: {text}";
    }

    private List<MedicalConcept> GetConceptsForSubject(string subject)
    {
        switch (subject)
        {
            case "Dahiliye":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Akut Pankreatit",
                        Subject = "Dahiliye",
                        KeySymptoms = new[] { "kuşak tarzında epigastrik karın ağrısı, bulantı ve kusma", "yemek sonrası artan şiddetli karın ağrısı" },
                        DiagnosticTests = new[] { "Serum amilaz ve lipaz düzeylerinin normalin 3 katından fazla bulunması", "Kontrastlı abdominal BT çekilmesi" },
                        BestTreatments = new[] { "Agresif damar yolu hidrasyonu ve oral alımın kesilmesi", "Analjezi ve yakın klinik takip" },
                        Distractors = new[] { "Akut Kolesistit", "Akut Apandisit", "Peptik Ülser Perforasyonu", "Akut Koroner Sendrom", "Miyokard Enfarktüsü" }
                    },
                    new MedicalConcept {
                        Name = "Tip 2 Diabetes Mellitus",
                        Subject = "Dahiliye",
                        KeySymptoms = new[] { "poliüri, polidipsi, ağız kuruluğu ve son 1 ayda istemsiz kilo kaybı", "halsizlik, sık enfeksiyon geçirme ve yara iyileşmesinde gecikme" },
                        DiagnosticTests = new[] { "HbA1c düzeyinin %6.5 ve üzerinde olması", "Açlık plazma glukozunun 126 mg/dL ve üzerinde bulunması" },
                        BestTreatments = new[] { "Metformin tedavisi başlanması ve yaşam tarzı değişikliği", "HbA1c çok yüksekse erken insülin tedavisi başlanması" },
                        Distractors = new[] { "Diyabetes İnsipitus", "Cushing Sendromu", "Hipertiroidi", "Feokromositoma", "Primer Aldosteronizm" }
                    },
                    new MedicalConcept {
                        Name = "Graves Hastalığı",
                        Subject = "Dahiliye",
                        KeySymptoms = new[] { "çarpıntı, terleme, sıcağa tahammülsüzlük, sinirlilik ve ellerde titreme", "kilo kaybı, bağırsak hareketlerinde artış ve gözlerde öne fırlama (ekzoftalmi)" },
                        DiagnosticTests = new[] { "TSH reseptör antikoru (TRAb) pozitifliği", "Tiroid sintigrafisinde diffüz artmış radyoaktif iyot tutulumu" },
                        BestTreatments = new[] { "Metimazol veya Propiltiourasil tedavisi", "Radyoaktif iyot (RAI) tedavisi" },
                        Distractors = new[] { "Hashimoto Tiroiditi", "Subakut Tiroidit", "Sessiz Tiroidit", "Tiroid Papiller Kanseri", "Toksik Multinodüler Guatr" }
                    },
                    new MedicalConcept {
                        Name = "Vitamin B12 Eksikliği Anemisi",
                        Subject = "Dahiliye",
                        KeySymptoms = new[] { "halsizlik, ellerde ve ayaklarda uyuşma, karıncalanma, denge kaybı", "unutkanlık, dilde yanma ve glossit (kırmızı düz dil)" },
                        DiagnosticTests = new[] { "Serum B12 düzeyinin 200 pg/mL altında olması ve periferik yaymada hipersegmente nötrofiller görülmesi", "MCV değerinin 100 fL üzerinde olması (makrositoz)" },
                        BestTreatments = new[] { "İntramüsküler siyanokobalamin (B12 vitamini) enjeksiyonu", "Oral yüksek doz vitamin B12 replasmanı" },
                        Distractors = new[] { "Demir Eksikliği Anemisi", "Folik Asit Eksikliği", "Talasemi Minör", "Aplazik Anemi", "Kronik Hastalık Anemisi" }
                    },
                    new MedicalConcept {
                        Name = "Romatoid Artrit",
                        Subject = "Dahiliye",
                        KeySymptoms = new[] { "her iki el bileği ve küçük eklemlerde sabahları 1 saatten uzun süren tutukluk ve ağrı", "eklemlerde şişlik, ısı artışı ve simetrik tutulum" },
                        DiagnosticTests = new[] { "Anti-CCP (anti-siklik sitrülinize peptid) antikor testi pozitifliği", "Romatoid Faktör (RF) pozitifliği ve yüksek ESR/CRP" },
                        BestTreatments = new[] { "Metotreksat gibi hastalık modifiye edici ilaçlar (DMARD)", "Kısa süreli düşük doz kortikosteroid ve NSAİİ" },
                        Distractors = new[] { "Osteoartrit", "Gut Artriti", "Ankilozan Spondilit", "Psöriatik Artrit", "Sistemik Lupus Eritematozus" }
                    }
                };
            case "Pediatri":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Kızamık (Rubeola)",
                        Subject = "Pediatri",
                        KeySymptoms = new[] { "3-4 gün süren yüksek ateş, öksürük, konjonktivit ve yanak mukozasında Koplik lekeleri", "kulak arkasından başlayıp gövdeye yayılan birleşik makülopapüler döküntü" },
                        DiagnosticTests = new[] { "Serumda Kızamık spesifik IgM antikor testi pozitifliği", "Klinik muayene ve Koplik lekelerinin tespiti" },
                        BestTreatments = new[] { "Destek tedavisi ve A vitamini verilmesi", "Semptomatik ateş düşürücüler ve hidrasyon" },
                        Distractors = new[] { "Kızamıkçık", "Suçiçeği", "Eritema İnfeksiyozum", "Roseola İnfantum", "Kızıl" }
                    },
                    new MedicalConcept {
                        Name = "Demir Eksikliği Anemisi",
                        Subject = "Pediatri",
                        KeySymptoms = new[] { "halsizlik, solukluk, iştahsızlık ve toprak/kil yeme (pika) alışkanlığı", "çabuk yorulma, konsantrasyon eksikliği ve büyüme geriliği" },
                        DiagnosticTests = new[] { "Serum ferritin düzeyinin düşük olması ve MCV düşüklüğü", "Mentzer indeksi (MCV/RBC) değerinin 13'ten büyük olması" },
                        BestTreatments = new[] { "Oral elementer demir tedavisi (3-6 mg/kg/gün)", "Diyet düzenlemesi ve süt tüketiminin azaltılması" },
                        Distractors = new[] { "Talasemi Taşıyıcılığı", "Kurşun Zehirlenmesi", "Kronik Hastalık Anemisi", "Folik Asit Eksikliği", "Sideroblastik Anemi" }
                    }
                };
            case "Genel Cerrahi":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Akut Apandisit",
                        Subject = "Genel Cerrahi",
                        KeySymptoms = new[] { "periumblikal başlayan ve zamanla sağ alt kadrana lokalize olan ağrı, rebound hassasiyeti", "iştahsızlık, bulantı, kusma ve subfebril ateş" },
                        DiagnosticTests = new[] { "McBurney noktasında hassasiyet ve ultrasonografide apandiks çapının 6 mm üzerinde olması", "Abdominal BT ile apandiks duvar kalınlaşmasının görülmesi" },
                        BestTreatments = new[] { "Cerrahi apandektomi (laparoskopik veya açık)", "Preoperatif profilaktik antibiyotik uygulaması" },
                        Distractors = new[] { "Akut Kolesistit", "Akut Divertikülit", "Mezenterik Adenit", "Üreter Taşı", "Over Kisti Torsiyonu" }
                    },
                    new MedicalConcept {
                        Name = "Akut Kolesistit",
                        Subject = "Genel Cerrahi",
                        KeySymptoms = new[] { "sağ üst kadran ağrısı, nefes alırken ağrının şiddetlenmesi (Murphy belirtisi)", "sağ kürek kemiğine yayılan karın ağrısı, bulantı ve hafif ateş" },
                        DiagnosticTests = new[] { "Abdominal ultrasonografide safra kesesi duvar kalınlığının 4 mm'den fazla olması", "Kolesintigrafi (HIDA taraması)" },
                        BestTreatments = new[] { "Erken kolesistektomi (ilk 72 saat içinde)", "IV sıvı, antibiyotik ve analjezi tedavisi" },
                        Distractors = new[] { "Akut Kolanjit", "Akut Pankreatit", "Peptik Ülser Perforasyonu", "Gastroözofageal Reflü", "Miyokard Enfarktüsü" }
                    }
                };
            case "Anatomi":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Nervus Fibularis (Peroneus) Communis Hasarı",
                        Subject = "Anatomi",
                        KeySymptoms = new[] { "düşük ayak (steppage gait) tablosu ve ayak sırtında his kaybı", "yürürken ayağın yere takılması şikayeti" },
                        DiagnosticTests = new[] { "Fibula boynu seviyesinde sinir iletim çalışması (EMG)", "Klinik motor muayenede ayak eversiyon ve dorsifleksiyon kaybı" },
                        BestTreatments = new[] { "Fizik tedavi ve ayak-bilek ortezleri (AFO)", "Sinir dekompresyon cerrahisi" },
                        Distractors = new[] { "Nervus Tibialis Hasarı", "Nervus Femoralis Hasarı", "Nervus Obturatorius Hasarı", "Nervus Saphenus Hasarı", "Nervus Ischiadicus Hasarı" }
                    },
                    new MedicalConcept {
                        Name = "Nervus Phrenicus",
                        Subject = "Anatomi",
                        KeySymptoms = new[] { "diyafram felci (hemidiyafram) ve nefes alırken paradoksik hareket", "çaba harcarken nefes darlığı çekilmesi" },
                        DiagnosticTests = new[] { "Floroskopi ile diyafram hareketlerinin izlenmesi (sniff testi)", "Göğüs radyografisinde diyafram kubbesinde yükselme" },
                        BestTreatments = new[] { "Destekleyici solunum tedavisi", "Diyafram plikasyonu cerrahisi" },
                        Distractors = new[] { "Nervus Vagus", "Nervus Intercostalis", "Nervus Accessorius", "Nervus Hypoglossus", "Plexus Brachialis" }
                    }
                };
            case "Fizyoloji":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Sinuatrial Düğüm Depolarizasyonu",
                        Subject = "Fizyoloji",
                        KeySymptoms = new[] { "kalp hızının dakikada 60-100 arasında ritmik olarak ayarlanması", "ritm bozuklukları ve bayılma hissi" },
                        DiagnosticTests = new[] { "Elektrokardiyografi (EKG) ile sinüs ritminin izlenmesi", "Elektrofizyolojik çalışma (EPS)" },
                        BestTreatments = new[] { "Pacemaker (kalp pili) implantasyonu", "Beta-bloker tedavisi" },
                        Distractors = new[] { "Hızlı sodyum kanalları aktivasyonu", "Potasyum kanalları çıkışı", "Kalsiyum ATPaz pompası inhibisyonu", "Klor kanalları girişi", "Na-K pompası aktivitesi" }
                    }
                };
            case "Biyokimya":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "AMPK Aktivasyonu",
                        Subject = "Biyokimya",
                        KeySymptoms = new[] { "hücrede AMP/ATP oranının yükselmesi ve açlık hissi", "metabolik sendrom ve kilo kaybında azalma" },
                        DiagnosticTests = new[] { "Western blot ile fosforile AMPK düzeylerinin ölçülmesi", "Hücresel ATP seviyelerinin ölçümü" },
                        BestTreatments = new[] { "Metformin tedavisi", "Egzersiz ve kalori kısıtlaması" },
                        Distractors = new[] { "Hekzokinaz inhibisyonu", "Fosfofruktokinaz-1 inaktivasyonu", "Piruvat Kinaz aktivasyonu", "Glikojen Sentaz stimülasyonu", "Glikojenoliz inhibisyonu" }
                    }
                };
            case "Mikrobiyoloji":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Streptococcus pyogenes (A Grubu) Enfeksiyonu",
                        Subject = "Mikrobiyoloji",
                        KeySymptoms = new[] { "boğaz ağrısı, bademciklerde eksuda, ateş ve submandibular lenfadenopati", "ciltte selülit veya yılancık (erizipel) enfeksiyonu" },
                        DiagnosticTests = new[] { "Boğaz kültüründe beta-hemolitik koloniler ve basistrasin duyarlılığı", "Hızlı antijen tarama testi (ASO yüksekliği)" },
                        BestTreatments = new[] { "Penisilin G veya Amoksisilin tedavisi", "Makrolidler (penisilin alerjisi durumunda)" },
                        Distractors = new[] { "Streptococcus pneumoniae", "Streptococcus agalactiae", "Staphylococcus aureus", "Enterococcus faecalis", "Neisseria meningitidis" }
                    }
                };
            case "Patoloji":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Reed-Sternberg Hücresi (Hodgkin Lenfoma)",
                        Subject = "Patoloji",
                        KeySymptoms = new[] { "ağrısız, lastik kıvamında servikal lenfadenopati ve gece terlemesi, ateş, kilo kaybı", "alkol aldıktan sonra lenf nodlarında ağrı hissedilmesi" },
                        DiagnosticTests = new[] { "Lenf nodu biyopsisinde 'baykuş gözü' nükleollü dev hücrelerin izlenmesi", "CD30 ve CD15 immünohistokimyasal pozitiflik" },
                        BestTreatments = new[] { "ABVD kemoterapi protokolü", "Radyoterapi desteği" },
                        Distractors = new[] { "Aschoff Hücreleri", "Langhans Dev Hücreleri", "Curschmann Spirali", "Negri Cisimcikleri", "Gaucher Hücreleri" }
                    }
                };
            case "Farmakoloji":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "ACE İnhibitörü Kullanımı",
                        Subject = "Farmakoloji",
                        KeySymptoms = new[] { "antihipertansif tedavi başlandıktan sonra gelişen kuru öksürük ve nefes darlığı", "dudak ve dilde şişme (anjiyoödem)" },
                        DiagnosticTests = new[] { "Bradikinin seviyelerinde artış ve klinik ilaç öyküsünün sorgulanması", "Rutin böbrek fonksiyon testleri ve potasyum takibi" },
                        BestTreatments = new[] { "İlacın kesilerek ARB (Anjiyotensin Reseptör Blokeri) grubuna geçilmesi", "Semptomatik tedavi ve acil durumlarda adrenalin" },
                        Distractors = new[] { "Beta bloker tedavisi", "Kalsiyum kanal blokerleri", "Tiyazid grubu diüretikler", "Loop diüretikleri", "Alfa bloker tedavisi" }
                    }
                };
            case "Kadın Hastalıkları ve Doğum":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Plasenta Previa",
                        Subject = "Kadın Hastalıkları ve Doğum",
                        KeySymptoms = new[] { "gebeliğin son trimesterinde ani başlayan, ağrısız, parlak kırmızı vajinal kanama", "rahimde kasılma olmadan gelişen kanama atakları" },
                        DiagnosticTests = new[] { "Obstetrik ultrasonografi ile plasentanın servikal os üzerindeki yerleşiminin görülmesi", "Spekulum muayenesi (vajinal tuşeden kaçınılmalıdır)" },
                        BestTreatments = new[] { "Elektif sezaryen ile doğum planlanması", "Yatak istirahati ve maternal hidrasyon takibi" },
                        Distractors = new[] { "Plasenta Dekolmanı (Abruptio)", "Uterus Rüptürü", "Vasa Previa", "Servikal Polip", "Erken Membran Rüptürü" }
                    }
                };
            case "Histoloji ve Embriyoloji":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Herediter Sferositoz (Eritrosit Hücre Membran Bozukluğu)",
                        Subject = "Histoloji ve Embriyoloji",
                        KeySymptoms = new[] { "periferik yaymada mikrosferositler (yuvarlak küçük kırmızı kan hücreleri)", "splenomegali, sarılık ve hafif anemi bulguları" },
                        DiagnosticTests = new[] { "Osmotik frajilite testi pozitifliği ve ankirin/spektrin protein eksikliği tespiti", "Akış sitometrisi (EMA bağlama testi)" },
                        BestTreatments = new[] { "Folik asit replasmanı ve ağır vakalarda splenektomi cerrahisi", "Destekleyici semptomatik tedavi" },
                        Distractors = new[] { "Glikoz 6-Fosfat Dehidrogenaz Eksikliği", "Orak Hücreli Anemi", "Herediter Elliptositoz", "Demir Eksikliği Anemisi", "Beta Talasemi" }
                    }
                };
            case "Küçük Stajlar":
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Sedef Hastalığı (Psoriasis Vulgaris)",
                        Subject = "Küçük Stajlar",
                        KeySymptoms = new[] { "vücudun ekstansör yüzlerinde gümüş rengi skamlarla kaplı eritemli plaklar", "dirsek ve dizlerde yerleşen lezyonlar ve Auspitz belirtisi" },
                        DiagnosticTests = new[] { "Klinik dermatolojik muayene ve Auspitz (noktasal kanama) belirtisi", "Deri biyopsisinde parakeratoz ve Munro mikroapseleri izlenmesi" },
                        BestTreatments = new[] { "Topikal kortikosteroidler ve D vitamini analogları tedavisi", "Fototerapi (PUVA/Dar bant UVB) veya sistemik biyolojik ajanlar" },
                        Distractors = new[] { "Liken Planus", "Atopik Dermatit", "Seboreik Dermatit", "Pityriasis Rosea", "Gül Hastalığı" }
                    }
                };
            default:
                return new List<MedicalConcept>
                {
                    new MedicalConcept {
                        Name = "Genel Enfeksiyon Hastalığı",
                        Subject = subject,
                        KeySymptoms = new[] { "yüksek ateş, halsizlik, eklem ve kas ağrıları", "titreme ile yükselen ateş ve iştahsızlık" },
                        DiagnosticTests = new[] { "Klinik muayene ve laboratuvarda CRP / ESR yüksekliği", "Tam kan sayımı (lökositoz) ve kan kültürü alınması" },
                        BestTreatments = new[] { "Semptomatik ateş düşürücüler ve oral/IV hidrasyon", "Etkene yönelik ampirik antibiyotik tedavisi" },
                        Distractors = new[] { "Dehidratasyon", "Gıda Zehirlenmesi", "Basit Soğuk Algınlığı", "Sistemik Alerjik Reaksiyon", "Psikosomatik Yakınma" }
                    }
                };
        }
    }

    [HttpPost("generate-questions")]
    public async Task<IActionResult> GenerateQuestions([FromBody] GenerateTusQuestionsRequest request)
    {
        try
        {
            var questions = await _proceduralGeneratorService.GenerateTusQuestionsAsync(request.Subject, request.Count);
            
            if (questions != null && questions.Any())
            {
                _context.TusQuestions.AddRange(questions);
                await _context.SaveChangesAsync();
                return Ok(new { message = $"{questions.Count} adet soru üretildi ve kaydedildi.", questions });
            }
            
            return BadRequest("Soru üretilemedi.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Soru üretimi sırasında hata oluştu: " + ex.Message });
        }
    }
}

public class TusAnswerRequest
{
    public string Email { get; set; } = string.Empty;
    public Guid QuestionId { get; set; }
    public string SelectedOption { get; set; } = string.Empty;
}

public class ExplainConceptRequest
{
    public Guid QuestionId { get; set; }
}

public class GenerateTusQuestionsRequest
{
    public string Subject { get; set; } = string.Empty;
    public int Count { get; set; } = 5;
}
