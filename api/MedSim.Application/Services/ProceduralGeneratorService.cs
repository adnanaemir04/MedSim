using System.Net.Http.Json;
using System.Text.Json;
using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace MedSim.Application.Services;

public interface IProceduralGeneratorService
{
    Task<MedicalCaseDto> GenerateCaseAsync(string departmentName, string topicName, string subTopicName, string difficulty = "Orta");
    Task<string> ExplainTusConceptsAsync(string questionText, string optionA, string optionB, string optionC, string optionD, string optionE, string correctOption, string baseExplanation);
    Task<List<TusQuestion>> GenerateTusQuestionsAsync(string subject, int count, string difficulty = "Orta");
    Task<(TusKnowledge Knowledge, List<TusQuestion> Questions)> GenerateClassicKnowledgeAndQuestionsAsync(string subject, string topicName, string subTopicName);
}

public class ProceduralGeneratorService : IProceduralGeneratorService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly Random _random = new();

    public ProceduralGeneratorService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    private string GetDifficultyPromptForCase(string difficulty)
    {
        return difficulty switch
        {
            "Kolay" => "- ZORLUK SEVİYESİ: Kolay\n- Hastanın klinik tablosu oldukça belirgin olmalı. Tipik semptom ve bulgular kullanılmalı.\n- Ayırıcı tanı sayısı az olmalı. Temel bilgi ile doğru tanıya ulaşılabilmeli.\n- Hastanın öyküsü ve fizik muayenesi tanıya güçlü şekilde işaret etmeli.\n- Gerekli laboratuvar/görüntüleme bulguları tanıyı destekleyecek şekilde açık olmalı.",
            "Zor" => "- ZORLUK SEVİYESİ: Zor\n- İleri düzey klinik muhakeme gerektirmelidir. Birden fazla olası tanı bulunmalı, ayırıcı tanı geniş olmalıdır.\n- Hastanın öyküsü, fizik muayenesi, laboratuvar ve görüntüleme sonuçları birlikte değerlendirilmelidir.\n- Tanıya ulaşmak için birden fazla klinik bilgi arasında bağlantı kurulması gerekebilir. Atipik veya yanıltıcı bulgular bulunabilir.\n- Sadece tek bir ezber bilgiyle çözülememelidir. Klinik karar verme ve çok aşamalı düşünme gerektirmelidir.",
            _ => "- ZORLUK SEVİYESİ: Orta\n- Birden fazla klinik bulgunun birlikte değerlendirilmesi gerekir. Birkaç olası ayırıcı tanı bulunabilir.\n- Hastanın yaş, öykü, risk faktörleri ve klinik bulguları birlikte değerlendirilmelidir.\n- Ezberden ziyade klinik muhakeme gerektirmelidir ancak çok ileri uzmanlık bilgisi veya nadir bir hastalık bilgisi gerektirmemelidir."
        };
    }

    private string GetDifficultyPromptForTus(string difficulty)
    {
        return difficulty switch
        {
            "Kolay" => "- ZORLUK SEVİYESİ: Kolay\n- Temel TUS bilgisini ölçmeli. Cevap doğrudan bilinen bir bilgiye dayanmalı.\n- Çok fazla yorum gerektirmemeli. Çeldiriciler çok karmaşık olmamalı.\n- Bir temel bilgiyle çözülebilmeli.",
            "Zor" => "- ZORLUK SEVİYESİ: Zor\n- İleri düzey TUS bilgisi gerektirmeli. Birden fazla konunun birlikte kullanılmasını gerektirebilir.\n- Klinik muhakeme gerektirmeli. Benzer hastalıklar veya tedaviler arasında ince ayrımlar içermeli.\n- Atipik vaka sunumu kullanılabilir. Birden fazla aşamalı düşünme gerektirebilir.\n- Çeldiriciler güçlü ve birbirine yakın olmalıdır.",
            _ => "- ZORLUK SEVİYESİ: Orta\n- Birden fazla bilginin birlikte değerlendirilmesini gerektirmeli. Klinik senaryo içerebilir.\n- Ayırıcı tanı veya mekanizma bilgisi gerekebilir. Temel bilgiyi klinik duruma uygulama gerektirmeli.\n- Çeldiriciler birbirine yakın olmalı. Soruyu çözmek için sadece tek bir ezber bilgi yeterli olmamalıdır."
        };
    }

    public async Task<MedicalCaseDto> GenerateCaseAsync(string departmentName, string topicName, string subTopicName, string difficulty = "Orta")
    {
        var apiKey = _configuration["AI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("AI_API_KEY (Google Gemini) appsettings.json dosyasında tanımlı değil.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}";
        
        string topicContext = string.IsNullOrEmpty(topicName) ? "" : $"Konu: {topicName}";
        string subTopicContext = string.IsNullOrEmpty(subTopicName) ? "" : $"Alt Konu: {subTopicName}";
        
        var rand = new Random();
        var genders = new[] { "Erkek", "Kadın" };
        var randomGender = genders[rand.Next(genders.Length)];
        var randomAge = rand.Next(18, 85);
        var randomVariationSeed = Guid.NewGuid().ToString().Substring(0, 8);

        string prompt = $@"Sen bir tıp eğitmenisin. Aşağıdaki tıp fakültesi klinik branşı ve spesifik konu/alt konu için aşamalı bir medikal vaka senaryosu üret.
SADECE JSON döndür, başka hiçbir şey yazma. Markdown etiketleri (```json vb.) kullanma.

Branş: {departmentName}
{topicContext}
{subTopicContext}
Zorluk Seviyesi: {difficulty}
Seed: {randomVariationSeed}

ZORUNLU HASTA PROFİLİ (Vaka Kurgusu Birebir Buna Uymalıdır):
- Hastanın Yaşı: {randomAge}
- Hastanın Cinsiyeti: {randomGender}

Kurallar:
- 2-4 aşama (orderIndex 1'den başlar)
- Her aşamada tam 4 şık: 1 doğru (isCorrect:true), 3 yanlış (isCorrect:false)
- CRITICAL RULE (ÇOK ÖNEMLİ):
  1. Doğru şık KESİNLİKLE en uzun veya en açıklayıcı şık OLMAMALIDIR. Tüm şıkların kelime ve karakter uzunlukları birbirine neredeyse eşit (birebir aynı) olmalıdır.
  2. Şıklarda KESİNLİKLE parantez içinde ek açıklamalar, detaylar veya ipuçları (örn. '... (en sık)', '... (altın standart)', '... (tercih edilen)') bulunmamalıdır. Parantez kullanımı şıklarda tamamen yasaktır.
  3. Tüm şıklar kelime sayısı olarak neredeyse birebir aynı boyutta olmalıdır.
- Şıkların ""feedback"" (açıklama) kısımları ÇOK DETAYLI ve ÖĞRETİCİ olmalıdır. Neden doğru veya neden yanlış olduğu, tıbbi fizyopatolojisi ve mantığıyla birlikte uzunca (3-4 cümle) anlatılmalıdır. Kısaca geçiştirilmemelidir.
- title kısa ve net olsun: örn 'Akut Apandisit'

JSON formatı şöyle olmalıdır:
{{
  ""title"": ""Örn: Akut Apandisit - Vaka 101"",
  ""initialText"": ""Hasta 25 yaşında erkek, sağ alt kadran ağrısı..."",
  ""difficultyScore"": 5,
  ""difficultyReason"": ""Atipik prezentasyon"",
  ""patientInfo"": {{
    ""name"": ""Ahmet Y."",
    ""age"": {randomAge},
    ""gender"": ""{randomGender}"",
    ""bloodPressure"": ""120/80 mmHg"",
    ""heartRate"": ""88 /dk"",
    ""temperature"": ""37.8 C"",
    ""oxygenSaturation"": ""%98"",
    ""respiratoryRate"": ""16 /dk"",
    ""physicalExam"": ""Sağ alt kadranda defans ve rebound pozitif."",
    ""medicalHistory"": ""Bilinen ek hastalık yok."",
    ""chiefComplaint"": ""Karın ağrısı, bulantı""
  }},
  ""stages"": [
    {{
      ""text"": ""Hastaya ilk yaklaşımınız ne olur?"",
      ""orderIndex"": 1,
      ""options"": [
        {{ ""text"": ""Hemogram ve CRP iste"", ""isCorrect"": true, ""feedback"": ""Tıbbi mekanizmayı anlatan en az 3-4 cümlelik uzun detaylı açıklama."" }},
        {{ ""text"": ""Eve gönder"", ""isCorrect"": false, ""feedback"": ""Neden yanlış olduğunu anlatan en az 3-4 cümlelik uzun detaylı açıklama."" }}
      ]
    }}
  ]
}}";

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            }
        };

        var response = await _httpClient.PostAsJsonAsync(url, requestBody);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"LLM API Error: {response.StatusCode} - {errorContent}");
        }

        var jsonResponse = await response.Content.ReadAsStringAsync();
        var geminiResponse = JsonSerializer.Deserialize<JsonElement>(jsonResponse);

        if (geminiResponse.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var contentText = candidates[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString()!.Trim();

            if (contentText.StartsWith("```json"))
                contentText = contentText[7..];
            else if (contentText.StartsWith("```"))
                contentText = contentText[3..];
            if (contentText.EndsWith("```"))
                contentText = contentText[..^3];
            contentText = contentText.Trim();

            var llmCase = JsonSerializer.Deserialize<LLMCaseResponse>(contentText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (llmCase == null) throw new Exception("LLM yanıtı parse edilemedi.");

            var patientInfo = BuildPatientInfo(llmCase, departmentName);

            var finalCase = new MedicalCaseDto
            {
                Id = Guid.NewGuid(),
                DepartmentName = departmentName,
                Title = llmCase.Title,
                InitialText = llmCase.InitialText,
                IsProcedural = true,
                Difficulty = difficulty,
                DifficultyScore = llmCase.DifficultyScore,
                DifficultyReason = llmCase.DifficultyReason,
                PatientInfo = patientInfo,
                Stages = llmCase.Stages.Select(s => new CaseStageDto
                {
                    Id = Guid.NewGuid(),
                    OrderIndex = s.OrderIndex,
                    Text = s.Text,
                    Options = s.Options.Select(o => new CaseOptionDto
                    {
                        Id = Guid.NewGuid(),
                        Text = o.Text,
                        IsCorrect = o.IsCorrect,
                        Feedback = o.Feedback
                    }).ToList()
                }).ToList()
            };

            ShuffleOptions(finalCase);
            return finalCase;
        }

        throw new Exception("LLM geçerli bir yanıt dönmedi.");
    }

    private PatientInfoDto BuildPatientInfo(LLMCaseResponse llmCase, string departmentName)
    {
        var llmInfo = llmCase.PatientInfo;

        // If LLM provided patient info, use it — otherwise generate random
        if (llmInfo != null && !string.IsNullOrEmpty(llmInfo.Name))
        {
            return new PatientInfoDto
            {
                Name = llmInfo.Name,
                Age = llmInfo.Age > 0 ? llmInfo.Age : GenerateRandomAge(departmentName),
                Gender = llmInfo.Gender,
                ChiefComplaint = llmInfo.ChiefComplaint,
                BloodPressure = llmInfo.BloodPressure,
                HeartRate = llmInfo.HeartRate,
                Temperature = llmInfo.Temperature,
                OxygenSaturation = llmInfo.OxygenSaturation,
                RespiratoryRate = llmInfo.RespiratoryRate,
                PhysicalExam = llmInfo.PhysicalExam,
                MedicalHistory = llmInfo.MedicalHistory
            };
        }

        // Fallback: generate random name + default vitals
        var maleNames = new[] { "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "İsmail", "Osman", "Halil" };
        var femaleNames = new[] { "Ayşe", "Fatma", "Emine", "Hatice", "Zeynep", "Elif", "Meryem", "Şerife", "Zehra", "Sultan" };
        var lastNames = new[] { "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir" };

        bool isMale = _random.Next(2) == 0;
        var name = isMale ? maleNames[_random.Next(maleNames.Length)] : femaleNames[_random.Next(femaleNames.Length)];
        var lastName = lastNames[_random.Next(lastNames.Length)];

        return new PatientInfoDto
        {
            Name = $"{name} {lastName}",
            Age = GenerateRandomAge(departmentName),
            Gender = isMale ? "Erkek" : "Kadın"
        };
    }

    private int GenerateRandomAge(string departmentName) =>
        departmentName == "Pediatri" ? _random.Next(1, 15) : _random.Next(18, 85);

    private void ShuffleOptions(MedicalCaseDto caseDto)
    {
        foreach (var stage in caseDto.Stages)
            stage.Options = stage.Options.OrderBy(x => _random.Next()).ToList();
    }

    public async Task<string> ExplainTusConceptsAsync(string questionText, string optionA, string optionB, string optionC, string optionD, string optionE, string correctOption, string baseExplanation)
    {
        var apiKey = _configuration["AI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("AI_API_KEY (Google Gemini) appsettings.json dosyasında tanımlı değil.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}";

        var prompt = $@"
Sen uzman bir tıp akademisyenisin. Aşağıdaki TUS (Tıpta Uzmanlık Sınavı) sorusunu, seçeneklerini ve doğru cevabı incele.
Amacın: Bu soruda veya seçeneklerinde geçen tıbbi kavramlarla ilgili SADECE 1-2 CÜMLELİK çok kısa bir ek bilgi vermek. Detaylı açıklama YAPMA.

Soru: {questionText}
Seçenekler: 
A) {optionA}
B) {optionB}
C) {optionC}
D) {optionD}
E) {optionE}
Doğru Cevap: {correctOption}
Kısa Açıklama: {baseExplanation}

Lütfen yukarıdaki bilgiler ışığında, sadece sorunun doğru çözümünü DEĞİL, şıklarda geçen diğer önemli hastalıkları/kavramları da içeren maksimum 1 veya 2 cümlelik, çok kısa bir not oluştur. Çıktıyı düz metin olarak ver. Sadece bu kısa metni döndür.";

        var payload = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            }
        };

        var response = await _httpClient.PostAsJsonAsync(url, payload);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {response.StatusCode} - {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var text = candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text ?? "Açıklama üretilemedi.";
        }

        return "Gemini API geçerli bir metin döndürmedi.";
    }

    public async Task<List<TusQuestion>> GenerateTusQuestionsAsync(string subject, int count, string difficulty = "Orta")
    {
        var apiKey = _configuration["AI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("AI_API_KEY (Google Gemini) appsettings.json dosyasında tanımlı değil.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}";

        var difficultyRules = GetDifficultyPromptForTus(difficulty);
        var rand = new Random();
        var tusFocusAreas = new[] { 
            "Fizyopatolojik Mekanizma", 
            "En olası tanı (Tipik veya atipik vaka)", 
            "En uygun tedavi ve yan etkiler", 
            "Farmakolojik etki mekanizması", 
            "Spesifik komplikasyonlar ve mortalite nedeni" 
        };
        var randomFocus = tusFocusAreas[rand.Next(tusFocusAreas.Length)];
        var randomVariationSeed = Guid.NewGuid().ToString().Substring(0, 8);

        var prompt = $@"
Sen uzman bir tıp akademisyenisin. TUS (Tıpta Uzmanlık Sınavı) standartlarında '{subject}' dersi ile ilgili {difficulty} seviyesinde, ayırt edici ve öğretici tam {count} adet yepyeni soru hazırla.

ZORUNLU SORU KONSEPTİ:
- Benzersizlik Kodu (Seed): {randomVariationSeed}
- Soru Odak Noktası: {randomFocus}
Lütfen tüm soruları ağırlıklı olarak '{randomFocus}' konseptine göre kurgula. Asla daha önce ürettiğin bilindik örnekleri veya standart TUS çıkmış sorularının aynısını tekrar etme.

Kritik Kural (Çok Önemli):
1. Soru metni (questionText) çok ÖZET ve KISA olmalıdır. Kesinlikle gereksiz detaylar ve laf kalabalığı yapılmamalı, okumayı zorlaştıracak uzunlukta olmamalıdır.
2. Şıkların metinleri MÜMKÜN OLDUĞUNCA KISA tutulmalıdır (tercihen 2-5 kelime arası). Ayrıca tüm şıklar kelime/karakter uzunluğu olarak birbirine neredeyse eşit olmalıdır. Doğru şık kesinlikle diğerlerinden daha uzun olmamalıdır.
3. Şıklarda KESİNLİKLE parantez içinde ek bilgiler, açıklamalar veya ipuçları (örn. '... (en olası)', '... (altın standart)') yer almamalıdır. Parantez kullanımı şıklarda tamamen yasaktır.
4. ""explanation"" (açıklama) kısmı ÇOK DETAYLI ve ÖĞRETİCİ olmalıdır. Ancak okunmasını kolaylaştırmak için DÜZ YAZI YERİNE mutlaka HTML etiketleri (<b>, <br/><br/>, <ul><li> vb.) kullanılarak paragraflara ve maddelere bölünmelidir. Örneğin: '<b>Doğru Cevap:</b> ... <br/><br/> <b>Diğer Şıklar Neden Yanlış:</b><ul><li><b>A Şıkkı:</b> ...</li></ul>' şeklinde göze hitap eden bir format kullanılmalıdır.

{difficultyRules}

Çıktıyı KESİNLİKLE JSON formatında ver. Format aşağıdaki gibi bir liste (array) olmalı:

[
  {{
    ""questionText"": ""Soru metni..."",
    ""optionA"": ""A şıkkı"",
    ""optionB"": ""B şıkkı"",
    ""optionC"": ""C şıkkı"",
    ""optionD"": ""D şıkkı"",
    ""optionE"": ""E şıkkı"",
    ""correctOption"": ""C"",
    ""explanation"": ""Doğru cevabın açıklaması"",
    ""difficulty"": ""{difficulty}"",
    ""difficultyScore"": 8,
    ""difficultyReason"": ""Bu soruyu çözmek için şu klinik bulguların sentezlenmesi gerekir...""
  }}
]

Lütfen JSON dışında hiçbir metin, açıklama veya markdown bloğu kullanma. Sadece geçerli JSON çıktısı üret.";

        var payload = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                temperature = 0.7,
                response_mime_type = "application/json"
            }
        };

        var response = await _httpClient.PostAsJsonAsync(url, payload);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {response.StatusCode} - {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var text = candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (!string.IsNullOrEmpty(text))
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsedList = JsonSerializer.Deserialize<List<LLMTusQuestionResponse>>(text, options);
                
                if (parsedList != null)
                {
                    return parsedList.Select(q => new TusQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuestionText = q.QuestionText,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        OptionE = q.OptionE,
                        CorrectOption = q.CorrectOption,
                        Explanation = q.Explanation,
                        Difficulty = q.Difficulty,
                        DifficultyScore = q.DifficultyScore,
                        DifficultyReason = q.DifficultyReason,
                        Category = "Temel Bilimler", // Simplification
                        Subject = subject
                    }).ToList();
                }
            }
        }

        return new List<TusQuestion>();
    }

    public async Task<(TusKnowledge Knowledge, List<TusQuestion> Questions)> GenerateClassicKnowledgeAndQuestionsAsync(string subject, string topicName, string subTopicName)
    {
        var apiKey = _configuration["AI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("AI_API_KEY (Google Gemini) appsettings.json dosyasında tanımlı değil.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}";

        var prompt = $@"
Sen uzman bir tıp akademisyenisin. TUS (Tıpta Uzmanlık Sınavı) standartlarında, '{subject}' dersi, '{topicName}' konusu ve '{subTopicName}' alt konusu ile ilgili en sık sorulan, yüksek frekanslı, hap bilgi niteliğinde tek bir Klasikleşmiş TUS Bilgisi (TusKnowledge) ve bu bilgiye bağlı tam 3 adet farklı kısa soru varyasyonu üret.

KURALLAR:
1. Bilgi (KnowledgeText): Çok net, tek cümlelik, ezberlenmesi kolay bir bilgi olmalıdır. Örn: ""ACE inhibitörleri gebelikte kontrendikedir."" veya ""Osteokondrom en sık görülen benign kemik tümörüdür.""
2. Sorular (Questions): 
   - Tam 3 adet soru varyasyonu üret.
   - Sorular KISA ve DİREKT olmalıdır. Gereksiz uzun klinik vaka hikayesi, laboratuvar veya görüntüleme sonucu içermemelidir.
   - Hızlı çözülebilir (10-30 saniye) ve tek bir bilgiyi (yukarıdaki KnowledgeText) ölçmelidir.
   - Her soru 5 seçenekli (OptionA-E) olmalı, tek bir doğru cevap (CorrectOption: A, B, C, D, E) içermelidir.
   - Doğru şık kesinlikle diğer şıklardan uzun veya parantez içi açıklama içeren yapıda olmamalıdır.
   - ""explanation"" (açıklama) kısmı kısa, net ve öğretici olmalıdır.
3. ImportanceScore: Bu bilginin TUS'taki çıkma/sorulma önem derecesi (0-100 arası bir sayı).
4. RepetitionFrequency: ""Çok Yüksek"", ""Yüksek"", ""Orta"" değerlerinden biri.
5. Sources: Bu bilginin geçtiği TUS kaynakları (Örn: ""ÖSYM TUS 2023; TUS Konu Kitabı X""). Semicolon ile ayrılmış liste olmalı.

Çıktıyı KESİNLİKLE JSON formatında ver. Sadece geçerli JSON çıktısı üret, başka metin yazma:

{{
  ""knowledgeText"": ""Osteokondrom en sık görülen benign kemik tümörüdür."",
  ""importanceScore"": 95,
  ""repetitionFrequency"": ""Çok Yüksek"",
  ""sources"": ""ÖSYM TUS 2023; TUS Soru Bankası Y"",
  ""questions"": [
    {{
      ""questionText"": ""En sık görülen benign kemik tümörü hangisidir?"",
      ""optionA"": ""Osteoid osteoma"",
      ""optionB"": ""Osteokondrom"",
      ""optionC"": ""Kondrom"",
      ""optionD"": ""Osteoblastom"",
      ""optionE"": ""Kondroblastom"",
      ""correctOption"": ""B"",
      ""explanation"": ""Osteokondrom en sık görülen iyi huylu kemik tümörüdür. Genellikle metafizde lokalize olur.""
    }}
  ]
}}
";

        var payload = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                temperature = 0.6,
                response_mime_type = "application/json"
            }
        };

        var response = await _httpClient.PostAsJsonAsync(url, payload);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {response.StatusCode} - {error}");
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var text = candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (!string.IsNullOrEmpty(text))
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsed = JsonSerializer.Deserialize<LLMClassicKnowledgeResponse>(text, options);
                
                if (parsed != null)
                {
                    var knowledge = new TusKnowledge
                    {
                        Id = Guid.NewGuid(),
                        KnowledgeText = parsed.KnowledgeText,
                        Subject = subject,
                        ImportanceScore = parsed.ImportanceScore,
                        RepetitionFrequency = parsed.RepetitionFrequency,
                        Sources = parsed.Sources,
                        IsActive = true
                    };

                    var questions = parsed.Questions.Select(q => new TusQuestion
                    {
                        Id = Guid.NewGuid(),
                        TusKnowledgeId = knowledge.Id,
                        TusKnowledge = knowledge,
                        QuestionText = q.QuestionText,
                        OptionA = q.OptionA,
                        OptionB = q.OptionB,
                        OptionC = q.OptionC,
                        OptionD = q.OptionD,
                        OptionE = q.OptionE,
                        CorrectOption = q.CorrectOption,
                        Explanation = q.Explanation,
                        Subject = subject,
                        Category = subject == "Anatomi" || subject == "Fizyoloji" || subject == "Biyokimya" || subject == "Mikrobiyoloji" || subject == "Patoloji" || subject == "Farmakoloji" ? "Temel Bilimler" : "Klinik Bilimler",
                        IsClassic = true,
                        IsApproved = false, // AI-generated starts as pending approval
                        Difficulty = parsed.ImportanceScore >= 80 ? "Zor" : parsed.ImportanceScore >= 50 ? "Orta" : "Kolay",
                        DifficultyScore = parsed.ImportanceScore / 10
                    }).ToList();

                    return (knowledge, questions);
                }
            }
        }

        throw new Exception("Yapay zeka klasik soru üretemedi.");
    }
}

// DTOs for parsing LLM JSON response
public class LLMCaseResponse
{
    public string Title { get; set; } = string.Empty;
    public string InitialText { get; set; } = string.Empty;
    
    public string Difficulty { get; set; } = string.Empty;
    public int DifficultyScore { get; set; }
    public string DifficultyReason { get; set; } = string.Empty;

    public LLMPatientInfoResponse? PatientInfo { get; set; }
    public List<LLMStageResponse> Stages { get; set; } = new();
}

public class LLMPatientInfoResponse
{
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string ChiefComplaint { get; set; } = string.Empty;
    public string BloodPressure { get; set; } = string.Empty;
    public string HeartRate { get; set; } = string.Empty;
    public string Temperature { get; set; } = string.Empty;
    public string OxygenSaturation { get; set; } = string.Empty;
    public string RespiratoryRate { get; set; } = string.Empty;
    public string PhysicalExam { get; set; } = string.Empty;
    public string MedicalHistory { get; set; } = string.Empty;
}

public class LLMStageResponse
{
    public int OrderIndex { get; set; }
    public string Text { get; set; } = string.Empty;
    public List<LLMOptionResponse> Options { get; set; } = new();
}

public class LLMOptionResponse
{
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public string Feedback { get; set; } = string.Empty;
}

public class LLMTusQuestionResponse
{
    public string QuestionText { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string OptionE { get; set; } = string.Empty;
    public string CorrectOption { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    
    public string Difficulty { get; set; } = string.Empty;
    public int DifficultyScore { get; set; }
    public string DifficultyReason { get; set; } = string.Empty;
}

public class LLMClassicKnowledgeResponse
{
    public string KnowledgeText { get; set; } = string.Empty;
    public int ImportanceScore { get; set; }
    public string RepetitionFrequency { get; set; } = string.Empty;
    public string Sources { get; set; } = string.Empty;
    public List<LLMTusQuestionResponse> Questions { get; set; } = new();
}
