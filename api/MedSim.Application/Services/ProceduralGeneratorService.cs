using System.Net.Http.Json;
using System.Text.Json;
using MedSim.Application.DTOs;
using MedSim.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace MedSim.Application.Services;

public interface IProceduralGeneratorService
{
    Task<MedicalCaseDto> GenerateCaseAsync(string departmentName, Guid departmentId);
    Task<string> ExplainTusConceptsAsync(string questionText, string optionA, string optionB, string optionC, string optionD, string optionE, string correctOption, string baseExplanation);
    Task<List<TusQuestion>> GenerateTusQuestionsAsync(string subject, int count);
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

    public async Task<MedicalCaseDto> GenerateCaseAsync(string departmentName, Guid departmentId)
    {
        var apiKey = _configuration["AI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("AI_API_KEY (Google Gemini) appsettings.json dosyasında tanımlı değil.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}";

        var prompt = $@"Sen bir tıp eğitmenisin. {departmentName} branşı için özgün bir klinik simülasyon vakası oluştur. SADECE JSON döndür, başka hiçbir şey yazma.

Kurallar:
- 2-4 aşama (orderIndex 1'den başlar)
- Her aşamada tam 4 şık: 1 doğru (isCorrect:true), 3 yanlış (isCorrect:false)
- CRITICAL RULE (ÇOK ÖNEMLİ):
  1. Doğru şık KESİNLİKLE en uzun veya en açıklayıcı şık OLMAMALIDIR. Tüm şıkların kelime ve karakter uzunlukları birbirine neredeyse eşit (birebir aynı) olmalıdır.
  2. Şıklarda KESİNLİKLE parantez içinde ek açıklamalar, detaylar veya ipuçları (örn. '... (en sık)', '... (altın standart)', '... (tercih edilen)') bulunmamalıdır. Parantez kullanımı şıklarda tamamen yasaktır.
  3. Tüm şıklar kelime sayısı olarak neredeyse birebir aynı boyutta olmalıdır.
- Yanlış şıklar güçlü tıbbi çeldiriciler olsun
- title kısa ve net olsun: örn 'Akut Apandisit', 'Tip 2 DM Krizi'
- patientInfo: Türkçe isim, yaş, cinsiyet, şikayet, vitaller, fizik muayene, özgeçmiş

JSON formatı:
{{
  ""title"": ""kısa başlık"",
  ""initialText"": ""1-2 cümle geliş senaryosu"",
  ""patientInfo"": {{
    ""name"": ""Türkçe Ad Soyad"",
    ""age"": 45,
    ""gender"": ""Erkek"",
    ""chiefComplaint"": ""şikayet"",
    ""bloodPressure"": ""TA: 140/90 mmHg"",
    ""heartRate"": ""NDS: 88 atım/dk"",
    ""temperature"": ""Ateş: 37.2°C"",
    ""oxygenSaturation"": ""SpO2: %97"",
    ""respiratoryRate"": ""SS: 18/dk"",
    ""physicalExam"": ""fizik muayene"",
    ""medicalHistory"": ""özgeçmiş ve ilaçlar""
  }},
  ""stages"": [
    {{
      ""orderIndex"": 1,
      ""text"": ""aşama sorusu"",
      ""options"": [
        {{""text"": ""şık A"", ""isCorrect"": true, ""feedback"": ""açıklama""}},
        {{""text"": ""şık B"", ""isCorrect"": false, ""feedback"": ""açıklama""}},
        {{""text"": ""şık C"", ""isCorrect"": false, ""feedback"": ""açıklama""}},
        {{""text"": ""şık D"", ""isCorrect"": false, ""feedback"": ""açıklama""}}
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

            // Strip markdown code fences if Gemini wraps in them
            if (contentText.StartsWith("```json"))
                contentText = contentText[7..];
            else if (contentText.StartsWith("```"))
                contentText = contentText[3..];
            if (contentText.EndsWith("```"))
                contentText = contentText[..^3];
            contentText = contentText.Trim();

            var llmCase = JsonSerializer.Deserialize<LLMCaseResponse>(contentText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (llmCase == null) throw new Exception("LLM yanıtı parse edilemedi.");

            // Build PatientInfoDto from LLM response (preferred) or fallback to random
            var patientInfo = BuildPatientInfo(llmCase, departmentName);

            var finalCase = new MedicalCaseDto
            {
                Id = Guid.NewGuid(),
                DepartmentId = departmentId,
                Title = llmCase.Title,
                InitialText = llmCase.InitialText,
                IsProcedural = true,
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

    public async Task<List<TusQuestion>> GenerateTusQuestionsAsync(string subject, int count)
    {
        var apiKey = _configuration["AI_API_KEY"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("AI_API_KEY (Google Gemini) appsettings.json dosyasında tanımlı değil.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}";

        var prompt = $@"
Sen uzman bir tıp akademisyenisin. TUS (Tıpta Uzmanlık Sınavı) standartlarında '{subject}' dersi ile ilgili zor, ayırt edici ve öğretici tam {count} adet soru hazırla.

Kritik Kural (Çok Önemli):
1. Doğru şık KESİNLİKLE en uzun, en detaylı veya en açıklayıcı şık olmamalıdır. Tüm şıkların kelime ve karakter uzunlukları birbirine neredeyse eşit (birebir aynı) olmalıdır.
2. Şıklarda KESİNLİKLE parantez içinde ek bilgiler, açıklamalar veya ipuçları (örn. '... (en olası)', '... (altın standart)', '... (en sık)') yer almamalıdır. Parantez kullanımı şıklarda tamamen yasaktır.
3. Tüm şıklar (A, B, C, D, E) kelime sayısı olarak neredeyse birebir aynı boyutta olmalıdır.

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
    ""explanation"": ""Doğru cevabın açıklaması""
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
                        Category = "Temel Bilimler", // Simplification
                        Subject = subject
                    }).ToList();
                }
            }
        }

        return new List<TusQuestion>();
    }
}

// DTOs for parsing LLM JSON response
public class LLMCaseResponse
{
    public string Title { get; set; } = string.Empty;
    public string InitialText { get; set; } = string.Empty;
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
}
