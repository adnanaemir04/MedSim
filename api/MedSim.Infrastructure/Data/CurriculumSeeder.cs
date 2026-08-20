using MedSim.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace MedSim.Infrastructure.Data;

public static class CurriculumSeeder
{
    public static async Task SeedAsync(MedSimDbContext context)
    {
        if (await context.Departments.AnyAsync()) return;

        var departments = new List<Department>();

        // Helper to add Department with Topics and SubTopics
        Department AddDept(int year, string name, Dictionary<string, string[]> topicsDict)
        {
            var dept = new Department { Id = Guid.NewGuid(), Year = year, Name = name };
            foreach (var kvp in topicsDict)
            {
                var topic = new Topic { Id = Guid.NewGuid(), Name = kvp.Key, DepartmentId = dept.Id, Department = dept };
                foreach (var sub in kvp.Value)
                {
                    topic.SubTopics.Add(new SubTopic { Id = Guid.NewGuid(), Name = sub, TopicId = topic.Id, Topic = topic });
                }
                dept.Topics.Add(topic);
            }
            departments.Add(dept);
            return dept;
        }

        // --- 1. Sınıf ---
        AddDept(1, "Anatomi", new Dictionary<string, string[]>
        {
            { "Üst Ekstremite", new[] { "Kemikler", "Eklemler", "Kaslar", "Damarlar", "Brakiyal Pleksus" } },
            { "Alt Ekstremite", new[] { "Pelvis ve Uyluk", "Bacak ve Ayak", "Lumbosakral Pleksus" } },
            { "Kemik ve Eklem Genel", new[] { "Genel Osteoloji", "Genel Artroloji" } },
        });

        AddDept(1, "Histoloji ve Embriyoloji", new Dictionary<string, string[]>
        {
            { "Genel Histoloji", new[] { "Hücre", "Epitel Dokusu", "Bağ Dokusu", "Kıkırdak ve Kemik", "Kas Dokusu", "Sinir Dokusu" } },
            { "Genel Embriyoloji", new[] { "Gametogenez", "Fertilizasyon", "Embriyonik Gelişim Evreleri" } },
        });

        AddDept(1, "Tıbbi Biyokimya", new Dictionary<string, string[]>
        {
            { "Temel Kavramlar", new[] { "Su ve pH", "Karbonhidrat Kimyası", "Lipit Kimyası", "Aminoasit ve Protein Kimyası" } },
            { "Enzimoloji", new[] { "Enzim Kinetiği", "Koenzimler ve Vitaminler" } },
            { "Metabolizmaya Giriş", new[] { "Biyoenerjetik ve Oksidatif Fosforilasyon" } },
        });

        AddDept(1, "Fizyoloji", new Dictionary<string, string[]>
        {
            { "Hücre Fizyolojisi", new[] { "Hücre Zarı ve Taşınma", "Aksiyon Potansiyeli" } },
            { "Kan Fizyolojisi", new[] { "Eritrositler ve Anemi", "Lökositler ve Bağışıklık", "Hemostaz ve Pıhtılaşma" } },
            { "Kas Fizyolojisi", new[] { "İskelet Kası", "Düz Kas", "Kalp Kası" } },
        });

        AddDept(1, "Tıbbi Biyoloji ve Genetik", new Dictionary<string, string[]>
        {
            { "Hücre Biyolojisi", new[] { "Hücre Döngüsü", "Apoptoz", "Hücre İçi Sinyal İletimi" } },
            { "Genetik", new[] { "Mendel Genetiği", "DNA Replikasyonu ve Transkripsiyon", "Mutasyonlar" } },
        });

        AddDept(1, "Biyoistatistik", new Dictionary<string, string[]>
        {
            { "Temel Kavramlar", new[] { "Veri Türleri", "Tanımlayıcı İstatistikler", "Olasılık Dağılımları" } },
            { "Hipotez Testleri", new[] { "Parametrik Testler", "Non-parametrik Testler", "Korelasyon ve Regresyon" } },
        });

        // --- 2. Sınıf ---
        AddDept(2, "Anatomi", new Dictionary<string, string[]>
        {
            { "Nöroanatomi", new[] { "Medulla Spinalis", "Beyin Sapı", "Serebellum", "Diensefalon", "Serebrum", "Kraniyal Sinirler" } },
            { "Baş Boyun", new[] { "Kafatası", "Boyun Üçgenleri", "Farinks ve Larinks" } },
            { "İç Organlar", new[] { "Toraks Anatomisi", "Abdomen Anatomisi", "Pelvis ve Perine" } },
        });

        AddDept(2, "Fizyoloji", new Dictionary<string, string[]>
        {
            { "Sinir Sistemi", new[] { "Duyu Fizyolojisi", "Motor Sistemler", "Otonom Sinir Sistemi" } },
            { "Dolaşım ve Solunum", new[] { "Kardiyak Döngü", "EKG", "Kan Basıncı Düzenlenmesi", "Solunum Mekaniği", "Gaz Değişimi" } },
            { "Sindirim ve Boşaltım", new[] { "Gastrointestinal Motilite", "Mide ve Pankreas Salgıları", "Nefron Fonksiyonları", "Asit-Baz Dengesi" } },
        });

        AddDept(2, "Mikrobiyoloji", new Dictionary<string, string[]>
        {
            { "Bakteriyoloji", new[] { "Genel Bakteriyoloji", "Gram Pozitif Koklar", "Gram Negatif Basiller", "Mikobakteriler" } },
            { "Viroloji", new[] { "DNA Virüsleri", "RNA Virüsleri", "Hepatit Virüsleri", "HIV" } },
            { "Parazitoloji ve Mikoloji", new[] { "Protozoalar", "Helmintler", "Dermatofitler", "Sistemik Mantarlar" } },
        });

        AddDept(2, "İmmünoloji", new Dictionary<string, string[]>
        {
            { "Temel İmmünoloji", new[] { "Doğal Bağışıklık", "Edinsel Bağışıklık", "Antijen-Antikor Reaksiyonları" } },
            { "Klinik İmmünoloji", new[] { "Aşırı Duyarlılık Reaksiyonları", "Otoimmünite", "İmmünyetmezlikler" } },
        });

        AddDept(2, "Patoloji", new Dictionary<string, string[]>
        {
            { "Genel Patoloji", new[] { "Hücre Hasarı ve Adaptasyon", "Akut ve Kronik İltihap", "Doku Onarımı", "Hemodinamik Bozukluklar", "Neoplazi Temelleri" } },
        });

        AddDept(2, "Farmakoloji", new Dictionary<string, string[]>
        {
            { "Genel Farmakoloji", new[] { "Farmakokinetik", "Farmakodinamik", "İlaç Etkileşimleri" } },
            { "Otonom Sinir Sistemi", new[] { "Kolinerjik İlaçlar", "Antikolinerjik İlaçlar", "Adrenerjik İlaçlar", "Anti-adrenerjik İlaçlar" } },
        });

        // --- 3. Sınıf ---
        AddDept(3, "Patoloji", new Dictionary<string, string[]>
        {
            { "Kardiyovasküler", new[] { "Ateroskleroz", "İskemik Kalp Hastalıkları", "Kapak Hastalıkları" } },
            { "Solunum", new[] { "KOAH", "Pnömoniler", "Akciğer Tümörleri" } },
            { "Gastrointestinal", new[] { "Gastrit ve Ülser", "İnflamatuar Bağırsak Hastalıkları", "GİS Tümörleri", "Karaciğer Sirozu ve Tümörleri" } },
            { "Genitoüriner", new[] { "Glomerülonefritler", "Böbrek Tümörleri", "Prostat Hastalıkları", "Jinekolojik Patoloji" } },
            { "Hemato-Lenfoid", new[] { "Lenfomalar", "Lösemiler" } },
        });

        AddDept(3, "Farmakoloji", new Dictionary<string, string[]>
        {
            { "Kardiyovasküler", new[] { "Antihipertansifler", "Antianginal İlaçlar", "Antiaritmikler", "Kalp Yetmezliği İlaçları" } },
            { "Santral Sinir Sistemi", new[] { "Antidepresanlar", "Antipsikotikler", "Antiepileptikler", "Analjezikler" } },
            { "Endokrin ve Gastrointestinal", new[] { "Antidiyabetikler", "Kortikosteroidler", "Antiülser İlaçlar" } },
            { "Kemoterapötikler", new[] { "Antibiyotikler (Hücre Duvarı Sentezi İnhibitörleri)", "Protein Sentezi İnhibitörleri", "Antiviraller", "Antineoplastikler" } },
        });

        AddDept(3, "Dahili Tıp Bilimlerine Giriş", new Dictionary<string, string[]>
        {
            { "Klinik Beceriler", new[] { "Anamnez Alma", "Fizik Muayene İlkeleri" } },
            { "Semptomatoloji", new[] { "Ağrı Değerlendirmesi", "Ateş", "Dispne", "Ödem", "Gastrointestinal Semptomlar" } },
        });

        AddDept(3, "Halk Sağlığı", new Dictionary<string, string[]>
        {
            { "Epidemiyoloji", new[] { "Araştırma Yöntemleri", "Bulaşıcı Hastalıklar Epidemiyolojisi", "Kronik Hastalıklar" } },
            { "Çevre Sağlığı", new[] { "İş Sağlığı ve Güvenliği", "Ana-Çocuk Sağlığı", "Sağlık Yönetimi ve Ekonomisi" } },
        });

        // --- 4. Sınıf ---
        AddDept(4, "İç Hastalıkları", new Dictionary<string, string[]>
        {
            { "Kardiyoloji", new[] { "Kalp Yetmezliği", "Akut Koroner Sendromlar", "Kapak Hastalıkları", "Aritmiler", "Hipertansiyon" } },
            { "Endokrinoloji", new[] { "Diyabetes Mellitus", "Tiroid Hastalıkları", "Adrenal Bez Hastalıkları", "Hipofiz Hastalıkları" } },
            { "Gastroenteroloji", new[] { "Peptik Ülser Hastalığı", "İnflamatuar Bağırsak Hastalıkları", "Siroz ve Komplikasyonları", "Akut Pankreatit" } },
            { "Nefroloji", new[] { "Akut Böbrek Hasarı", "Kronik Böbrek Yetmezliği", "Nefritik ve Nefrotik Sendromlar", "Asit-Baz Bozuklukları" } },
            { "Hematoloji", new[] { "Anemiler", "Lösemiler", "Lenfomalar", "Kanama Bozuklukları" } },
            { "Romatoloji", new[] { "Romatoid Artrit", "Sistemik Lupus Eritematozus", "Vaskülitler", "Gut ve Psödogut" } },
        });

        AddDept(4, "Çocuk Sağlığı ve Hastalıkları", new Dictionary<string, string[]>
        {
            { "Genel Pediatri", new[] { "Büyüme ve Gelişme İzlemi", "Aşı Takvimi", "Beslenme ve Malnütrisyon" } },
            { "Neonatoloji", new[] { "Yenidoğan Sarılığı", "Yenidoğan Sepsisi", "Respiratuar Distres Sendromu" } },
            { "Pediatrik Enfeksiyon", new[] { "Döküntülü Hastalıklar", "Menenjit", "Gastroenteritler", "Üst ve Alt Solunum Yolu Enfeksiyonları" } },
            { "Pediatrik Kardiyoloji", new[] { "Doğuştan Kalp Hastalıkları", "Akut Romatizmal Ateş", "Kalp Yetmezliği" } },
            { "Pediatrik Nöroloji", new[] { "Febril Konvülsiyon", "Epilepsi", "Serebral Palsi" } },
        });

        AddDept(4, "Genel Cerrahi", new Dictionary<string, string[]>
        {
            { "Gastrointestinal Cerrahi", new[] { "Akut Batın", "Apandisit", "Safra Kesesi Hastalıkları", "Fıtıklar", "Mide ve Kolorektal Kanserler" } },
            { "Endokrin Cerrahi", new[] { "Tiroid Nodülleri ve Kanserleri", "Paratiroid Hastalıkları", "Sürrenal Cerrahisi" } },
            { "Meme Cerrahisi", new[] { "Benign Meme Hastalıkları", "Meme Kanseri ve Tedavisi" } },
            { "Travma ve Yoğun Bakım", new[] { "Şok ve Tedavisi", "Travmalı Hastaya Yaklaşım", "Yanıklar" } },
        });

        AddDept(4, "Kadın Hastalıkları ve Doğum", new Dictionary<string, string[]>
        {
            { "Obstetrik", new[] { "Gebelikte Fizyolojik Değişiklikler", "Antenatal Takip", "Gebelikte Hipertansif Hastalıklar", "Gestasyonel Diyabet", "Normal Doğum ve Komplikasyonları", "Doğum Sonu Kanamalar" } },
            { "Jinekoloji", new[] { "Menstrüel Siklus Bozuklukları", "Polikistik Over Sendromu", "Pelvik İnflamatuar Hastalık", "Myoma Uteri", "Endometriozis" } },
            { "Jinekolojik Onkoloji", new[] { "Serviks Kanseri", "Endometrium Kanseri", "Over Kanseri" } },
        });

        // --- 5. Sınıf ---
        AddDept(5, "Psikiyatri", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Depresif Bozukluklar", "Bipolar Bozukluk", "Şizofreni ve Diğer Psikotik Bozukluklar", "Anksiyete Bozuklukları", "OKB ve İlişkili Bozukluklar", "Yeme Bozuklukları" } },
            { "Çocuk Ergen Psikiyatrisi", new[] { "DEHB", "Otizm Spektrum Bozuklukları" } },
        });

        AddDept(5, "Nöroloji", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Serebrovasküler Hastalıklar (İnme)", "Epilepsiler", "Baş Ağrıları (Migren vb.)", "Hareket Bozuklukları (Parkinson Hastalığı)", "Multipl Skleroz ve Demiyelinizan Hastalıklar", "Nöromusküler Hastalıklar" } },
        });

        AddDept(5, "Kardiyoloji", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Akut Koroner Sendromlar Detaylı", "Kalp Yetmezliği Yönetimi", "Aritmiler (AF vb.)", "Kapak Hastalıkları Ekokardiyografi", "Hipertansiyon Acilleri" } },
        });

        AddDept(5, "Göğüs Hastalıkları", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Astım", "KOAH", "Akciğer Kanseri", "Pnömoni ve Tüberküloz", "Pulmoner Emboli", "İnterstisyel Akciğer Hastalıkları" } },
        });

        AddDept(5, "Enfeksiyon Hastalıkları", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Ateş Nedeni Bilinmeyen Hastalık", "Sepsis", "Menenjit ve Ensefalit", "Hepatitler", "HIV/AIDS", "Hastane Enfeksiyonları" } },
        });

        AddDept(5, "Üroloji", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Üriner Sistem Taş Hastalığı", "Benign Prostat Hiperplazisi", "Prostat Kanseri", "Mesane Kanseri", "Böbrek Tümörleri", "Pediatrik Üroloji" } },
        });

        AddDept(5, "Göz Hastalıkları", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Kırmızı Göz Ayrımı", "Katarakt", "Glokom", "Diyabetik Retinopati", "Şaşılık ve Pediatrik Oftalmoloji" } },
        });

        AddDept(5, "Kulak Burun Boğaz", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Otitis Media", "İşitme Kayıpları", "Vertigo ve Denge Bozuklukları", "Rinosinüzit", "Tonsillofarenjit", "Baş Boyun Kitleleri" } },
        });

        AddDept(5, "Ortopedi ve Travmatoloji", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Kırık İyileşmesi ve Komplikasyonlar", "Üst Ekstremite Travmaları", "Alt Ekstremite Travmaları", "Pediatrik Ortopedi (GKD vb.)", "Omurga Hastalıkları", "Artrozlar" } },
        });

        AddDept(5, "Dermatoloji", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Bakteriyel ve Viral Deri Enfeksiyonları", "Fungal Deri Enfeksiyonları", "Papüloskuamöz Hastalıklar (Sedef vb.)", "Vezikülobüllöz Hastalıklar", "Akne ve Rosacea", "Deri Tümörleri" } },
        });

        AddDept(5, "Anesteziyoloji ve Reanimasyon", new Dictionary<string, string[]>
        {
            { "Klinik Durumlar", new[] { "Genel Anestezi ve İlaçlar", "Rejyonal Anestezi", "Temel ve İleri Yaşam Desteği (KPR)", "Yoğun Bakım İlkeleri", "Ağrı Yönetimi" } },
        });

        // --- 6. Sınıf ---
        AddDept(6, "Acil Tıp", new Dictionary<string, string[]>
        {
            { "Acil Durumlar", new[] { "Kardiyopulmoner Resüsitasyon (KPR)", "Çoklu Travma Yönetimi", "Şok ve Sıvı Tedavisi", "Toksikoloji (Zehirlenmeler)", "Solunum Acilleri", "Kardiyak Aciller", "Nörolojik Aciller" } },
        });

        AddDept(6, "Aile Hekimliği", new Dictionary<string, string[]>
        {
            { "Birinci Basamak", new[] { "Sağlam Çocuk İzlemi ve Aşılama", "Gebe ve Lohusa İzlemi", "Kronik Hastalık Takibi (DM, HT)", "Geriatrik Yaklaşım", "Koruyucu Hekimlik ve Kanser Taramaları" } },
        });

        AddDept(6, "Halk Sağlığı", new Dictionary<string, string[]>
        {
            { "Saha Çalışmaları", new[] { "Salgın İncelemesi", "Bulaşıcı Hastalık Sürveyansı", "İşçi Sağlığı Uygulamaları" } },
        });

        context.Departments.AddRange(departments);
        await context.SaveChangesAsync();
    }
}
