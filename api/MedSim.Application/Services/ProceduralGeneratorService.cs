using System.Net.Http.Json;
using System.Text.Json;
using MedSim.Application.DTOs;
using Microsoft.Extensions.Configuration;

namespace MedSim.Application.Services;

public interface IProceduralGeneratorService
{
    Task<MedicalCaseDto> GenerateCaseAsync(string departmentName, Guid departmentId);
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
- Tüm şık metinleri benzer uzunlukta olsun
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
