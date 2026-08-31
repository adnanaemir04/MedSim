using MedSim.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedSim.Infrastructure.Data;

/// <summary>
/// Seeds ~310 high-quality, original classic TUS Anatomy questions.
/// Only runs once (idempotent). Does NOT touch existing data.
/// Questions are linked to SubTopics via runtime lookup so no migration is needed.
/// </summary>
public static class AnatomyClassicSeeder
{
    public static async Task SeedAsync(MedSimDbContext context)
    {
        // Only seed initial 111 Anatomi questions if none exist
        if (await context.TusQuestions.AnyAsync(q => q.IsClassic && q.Subject == "Anatomi"))
        {
            return;
        }

        // Build a SubTopic name → ID dictionary from the existing DB
        var subTopics = await context.SubTopics
            .Include(s => s.Topic)
            .ThenInclude(t => t.Department)
            .Where(s => s.Topic.Department.Name == "Anatomi")
            .ToListAsync();

        Guid? SubId(string name) =>
            subTopics.FirstOrDefault(s => s.Name == name)?.Id;

        // Department IDs for Anatomi (both years)
        var anatomiDepts = await context.Departments
            .Where(d => d.Name == "Anatomi")
            .Select(d => d.Id)
            .ToListAsync();

        Guid? anatomiDeptId = anatomiDepts.FirstOrDefault();

        var knowledges = new List<TusKnowledge>();
        var questions = new List<TusQuestion>();

        // Helper: add a knowledge + 1-3 questions block
        void AddKQ(
            string knowledgeText,
            string subject,
            int importance,
            string frequency,
            string? subTopicName,
            params (string qText, string a, string b, string c, string d, string e, string correct, string explanation, string difficulty)[] qs)
        {
            var k = new TusKnowledge
            {
                Id = Guid.NewGuid(),
                KnowledgeText = knowledgeText,
                Subject = subject,
                ImportanceScore = importance,
                RepetitionFrequency = frequency,
                IsActive = true,
                DepartmentId = anatomiDeptId,
                SubTopicId = subTopicName != null ? SubId(subTopicName) : null
            };
            knowledges.Add(k);

            foreach (var q in qs)
            {
                questions.Add(new TusQuestion
                {
                    Id = Guid.NewGuid(),
                    TusKnowledgeId = k.Id,
                    Subject = "Anatomi",
                    Category = "Temel Bilimler",
                    IsClassic = true,
                    IsApproved = true,
                    SubTopicId = subTopicName != null ? SubId(subTopicName) : null,
                    QuestionText = q.qText,
                    OptionA = q.a,
                    OptionB = q.b,
                    OptionC = q.c,
                    OptionD = q.d,
                    OptionE = q.e,
                    CorrectOption = q.correct,
                    Explanation = q.explanation,
                    Difficulty = q.difficulty,
                    DifficultyScore = q.difficulty == "Kolay" ? 2 : q.difficulty == "Orta" ? 5 : 8
                });
            }
        }

        // =========================================================
        // BRAKIYAL PLEKSUS
        // =========================================================
        AddKQ(
            "Brakiyal pleksus C5-T1 ön primer dallarından oluşur.",
            "Anatomi", 98, "Çok Yüksek", "Brakiyal Pleksus",
            ("Brakiyal pleksusun kökleri aşağıdaki spinal sinirlerden hangisinden kaynaklanır?",
             "C4-C8 ve ilişkili anatomik komşuluklar ile çevre dokular", "C5-T1", "C6-T1", "C5-C8", "C4-T1", "B",
             "Brakiyal pleksus, C5, C6, C7, C8 ve T1 spinal sinirlerinin ön primer dallarından oluşur. Bu kökler birleşerek trunk, division, cord ve terminal dallara dönüşür.",
             "Kolay"),
            ("Brakiyal pleksusun hangi komponenti C5 ve C6 köklerinin birleşmesiyle oluşur?",
             "Lateral kord ve ilişkili anatomik komşuluklar ile çevre dokular", "Medial trunk", "Superior trunk", "Middle trunk", "Posterior kord", "C",
             "C5 ve C6 ön primer dalları birleşerek superior (üst) trunküsü oluşturur. C7 middle, C8-T1 ise inferior trunküsü oluşturur.",
             "Kolay")
        );

        AddKQ(
            "Nervus axillaris (C5-C6) deltoid ve teres minor kaslarını innerve eder; kırık-çıkıklarda zarar görür.",
            "Anatomi", 93, "Çok Yüksek", "Brakiyal Pleksus",
            ("Nervus axillaris hasarında aşağıdaki kasların hangisinde güçsüzlük beklenir?",
             "Biceps brachii", "Triceps brachii", "Deltoid", "Coracobrachialis", "Brachioradialis", "C",
             "N. axillaris (C5-C6) deltoid ve teres minor kaslarını innerve eder. Hasar sonucu omuz abduksiyonu (deltoid) ve dış rotasyonu (teres minor) güçsüzlüğü gelişir.",
             "Kolay"),
            ("Humerus boyun kırığından en sık zarar gören sinir hangisidir?",
             "N. radialis", "N. ulnaris", "N. medianus", "N. axillaris", "N. musculocutaneus", "D",
             "Humerus cerrahi boyun kırıklarında n. axillaris, koltuk altından geçerken sıkışarak en sık zarar gören sinirdir. Deltoid atrofisi ve omuz lateral duyusu kaybı olur.",
             "Kolay")
        );

        AddKQ(
            "Nervus musculocutaneus (C5-C7) coracobrachialis, biceps brachii ve brachialis kaslarını innerve eder.",
            "Anatomi", 88, "Yüksek", "Brakiyal Pleksus",
            ("N. musculocutaneus'un aşağıdaki kasların hangisini innerve etmediği bilinmektedir?",
             "Coracobrachialis", "Biceps brachii", "Brachialis", "Brachioradialis", "Bunların hepsi innerve edilir", "D",
             "Brachioradialis, n. radialis tarafından innerve edilir. N. musculocutaneus yalnızca coracobrachialis, biceps brachii ve brachialis kaslarını innerve eder.",
             "Orta"),
            ("N. musculocutaneus hasarından sonra hangi hareket en çok etkilenir?",
             "Ön kol pronasyonu ve ilişkili anatomik komşuluklar ile çevre dokular", "El bileği fleksiyonu", "Ön kol supinasyonu ve fleksiyonu", "Parmak ekstansiyonu", "Omuz abduksiyonu", "C",
             "Biceps brachii ve brachialis kaslarını innerve ettiğinden, n. musculocutaneus hasarında ön kol fleksiyonu (özellikle supinasyonda) belirgin şekilde zayıflar.",
             "Kolay")
        );

        AddKQ(
            "Nervus medianus tenar kasları (abductor pollicis brevis, opponens pollicis, flexor pollicis brevis yüzeyel başı) innerve eder.",
            "Anatomi", 96, "Çok Yüksek", "Brakiyal Pleksus",
            ("Nervus medianus hasarında aşağıdaki kasların hangisinin parezisi beklenmez?",
             "Abductor pollicis brevis", "Opponens pollicis", "Adductor pollicis", "Flexor pollicis brevis", "1. ve 2. lumbrical", "C",
             "Adductor pollicis, n. ulnaris tarafından innerve edilir. Diğer tenar kasların tamamı (APB, OPP, FPB yüzeyel başı) ve 1-2. lumbrikaller n. medianus'un dallarından innervasyon alır.",
             "Orta"),
            ("Karpal tünel sendromunda duyu kaybı en sık hangi parmakları etkiler?",
             "4. ve 5. parmaklar ve ilişkili anatomik komşuluklar ile çevre dokular", "Yalnızca 1. parmak", "1., 2., 3. parmak ve 4. parmağın radyal yarısı", "4. ve 5. parmağın ulnar yarısı", "Tüm parmaklar eşit etkilenir", "C",
             "N. medianus el ayasını (lateral 3,5 parmak) innerve eder. Karpal tünel sendromunda bu alanda uyuşma ve yanma tipiktir; 4-5. parmaklar ulnar sinirin alanıdır.",
             "Kolay")
        );

        AddKQ(
            "Nervus ulnaris (C8-T1) interossei, hypothenar ve adductor pollicis kaslarını innerve eder.",
            "Anatomi", 95, "Çok Yüksek", "Brakiyal Pleksus",
            ("N. ulnaris hasarında aşağıdaki deformitelerden hangisi gelişir?",
             "Düşük el", "Düşük ayak", "Pençe el", "Benediction işareti", "Ape hand deformitesi", "C",
             "N. ulnaris hasarında interossei ve lumbrikallerin (4-5. parmak) paralizisi nedeniyle 4. ve 5. parmaklarda MCP hiperekstansiyonu ve IP fleksiyonu ile 'pençe el' deformitesi oluşur.",
             "Kolay"),
            ("El bileği seviyesinde n. ulnaris hasarında hangi hareket etkilenmez?",
             "Parmak abduksiyonu", "5. parmak abduksiyonu", "4-5. parmak fleksiyonu", "Adductor pollicis fonksiyonu", "El bilek fleksiyonu", "E",
             "N. ulnaris'in flexor carpi ulnaris dalı, el bileği seviyesinin proksimalinde ayrıldığından, el bileği seviyesindeki hasarda FCU korunmuş olur ve el bileği fleksiyonu görece sağlamdır.",
             "Zor")
        );

        AddKQ(
            "Nervus radialis tüm ekstansör kasları innerve eder; humerus orta gövde kırığında zarar görür (spiral kanal).",
            "Anatomi", 97, "Çok Yüksek", "Brakiyal Pleksus",
            ("Humerus cisim kırıklarında hangi sinir sıklıkla zarar görür?",
             "N. axillaris", "N. medianus", "N. ulnaris", "N. radialis", "N. musculocutaneus", "D",
             "N. radialis, humerus spiral (radial) kanalından geçerken humerus orta gövde kırıklarında en sık zarar gören sinirdir. Wrist drop (el bileği düşüklüğü) klasik bulgudur.",
             "Kolay"),
            ("N. radialis hasarına bağlı 'wrist drop' tablosunda en çok hangi hareket bozulur?",
             "El bileği fleksiyonu ve ilişkili anatomik komşuluklar ile çevre dokular", "Ön kol supinasyonu", "El bileği ekstansiyonu", "Parmak adduksiyonu", "Başparmak abduksiyonu", "C",
             "N. radialis, el bileği ve parmak ekstansörlerini innerve eder. Hasarında wrist drop (el bileği ekstansiyon kaybı) gelişir; fleksiyon ve parmak hareketleri daha az etkilenir.",
             "Kolay")
        );

        AddKQ(
            "Erb paralizisi C5-C6 kökü hasarından kaynaklanır; 'garson bahşiş bekliyor' pozisyonu tipiktir.",
            "Anatomi", 94, "Çok Yüksek", "Brakiyal Pleksus",
            ("Doğum travmasında brakiyal pleksusun üst kök hasarıyla oluşan tablonun adı nedir?",
             "Klumpke paralizisi", "Carpal tünel sendromu", "Erb paralizisi", "Dejerine-Klumpke sendromu", "Horner sendromu", "C",
             "Üst kök (C5-C6) hasarında Erb paralizisi gelişir. Omuz iç rotasyonda, ön kol pronasyonda ve dirsek ekstansiyonda kalır — 'garson bahşiş bekliyor' pozisyonu.",
             "Kolay"),
            ("Klumpke paralizisinde hangi kökler zarar görmüştür?",
             "C5-C6 ve ilişkili anatomik komşuluklar ile çevre dokular", "C5-C7", "C6-C7", "C8-T1", "C7-T1", "D",
             "Klumpke paralizisi, C8-T1 alt kök hasarından kaynaklanır. İntrinsik el kasları etkilenir, pençe el deformitesi ve sempato-servikal lifler zarar görürse Horner sendromu da eşlik eder.",
             "Kolay")
        );

        AddKQ(
            "N. suprascapularis supraspinatus ve infraspinatus kaslarını innerve eder; suprascapular çentikten geçer.",
            "Anatomi", 85, "Yüksek", "Brakiyal Pleksus",
            ("Supraspinatus ve infraspinatus kaslarının innervasyonundan hangi sinir sorumludur?",
             "N. axillaris ve ilişkili anatomik komşuluklar ile çevre dokular", "N. thoracodorsalis", "N. suprascapularis", "N. subscapularis", "N. musculocutaneus", "C",
             "N. suprascapularis (C5-C6), suprascapular çentikten geçerek supraspinatus ve infraspinatus kaslarını innerve eder. Hasarında omuz abduksiyonu ve dış rotasyonu bozulur.",
             "Orta")
        );

        AddKQ(
            "N. thoracicus longus serratus anterior kasını innerve eder; hasar 'winged scapula'ya yol açar.",
            "Anatomi", 90, "Yüksek", "Brakiyal Pleksus",
            ("Skapulanın 'kanatlanması' (winged scapula) hangi sinirin hasarıyla açıklanır?",
             "N. axillaris", "N. thoracicus longus", "N. suprascapularis", "N. thoracodorsalis", "N. pectoralis medialis", "B",
             "N. thoracicus longus (C5-C7), serratus anterior kasını innerve eder. Bu sinirin hasarında skapula medial kenarı kaburgalardan uzaklaşır ve 'kanat' görünümü oluşur.",
             "Kolay")
        );

        // =========================================================
        // ÜST EKSTREMİTE — DAMARLAR
        // =========================================================
        AddKQ(
            "Radial arterin nabzı anatomik snuffbox'ta ve el bileğinin radial tarafında alınır.",
            "Anatomi", 88, "Yüksek", "Damarlar",
            ("Anatomik snuffbox'un tabanından geçen ana damar aşağıdakilerden hangisidir?",
             "Ulnar arter", "Brakiyal arterin devamı", "Radial arter", "A. interossea anterior", "A. circumflexa humeri", "C",
             "Radial arterin nabzı el bileğinde ve anatomik snuffbox'ta (extensor pollicis longus ve brevis/abductor pollicis longus arasındaki çukur) alınır.",
             "Kolay"),
            ("El bileğinde nabız alınan iki ana arterden radial arterle birlikte hangisi değerlendirilir (Allen testi)?",
             "A. interossea communis", "A. axillaris", "A. ulnaris", "A. brachialis", "A. subscapularis", "C",
             "Allen testinde radial ve ulnar arterler sırayla sıkıştırılarak el dolaşımı test edilir. Radyografi veya kateter öncesinde hangi arterin dominant olduğu belirlenir.",
             "Kolay")
        );

        AddKQ(
            "Aksiller arterin birinci bölümünden tek bir dal (a. thoracica suprema) çıkar.",
            "Anatomi", 82, "Orta", "Damarlar",
            ("Aksiller arterin 3 bölümü içinde en fazla dalı veren bölüm hangisidir?",
             "Birinci bölüm", "İkinci bölüm", "Üçüncü bölüm", "Tüm bölümler eşit sayıda dal verir", "Hiçbiri doğru değil", "C",
             "Aksiller arterin bölümleri pektoralis minörün sınırlarına göre belirlenir: 1. bölüm 1 dal, 2. bölüm 2 dal, 3. bölüm 3 dal verir. 3. bölüm en fazla dalı verdiğinden kolaylıkla hatırlanır (1-2-3 kuralı).",
             "Orta")
        );

        // =========================================================
        // ÜST EKSTREMİTE — KEMIKLER
        // =========================================================
        AddKQ(
            "Scaphoid (navikular) kemik el bileğinde en sık kırılan karpal kemiktir; anatomik snuffbox hassasiyeti klasik bulgudur.",
            "Anatomi", 97, "Çok Yüksek", "Kemikler",
            ("El bileği karpal kemikleri arasında kırık sonrası avasküler nekroz riski en yüksek olan kemik hangisidir?",
             "Lunate", "Triquetrum", "Scaphoid", "Capitate", "Hamate", "C",
             "Scaphoid kemiğin kanlanması distalden proksimale doğru olduğundan, kırık gerçekleştiğinde proksimal kırık parçası kolayca beslenmesini yitirir ve avasküler nekroz riski yüksektir.",
             "Kolay"),
            ("Anatomik snuffbox'ta hassasiyet varlığında düşünülmesi gereken ilk tanı nedir?",
             "De Quervain tenosinoviti", "Karpal tünel sendromu", "Scaphoid kırığı", "Capitate kırığı", "Ulnar tünel sendromu", "C",
             "Anatomik snuffbox hassasiyeti, scaphoid kırığının klasik bulgusudur. Radyografide görülmese bile klinik şüphe varsa immobilizasyon şarttır; MRI veya BT ile kesinleştirilir.",
             "Kolay")
        );

        AddKQ(
            "Humerus anatomik boynu gerçek kemik boynudur; cerrahi boyun ise kırıkların en sık görüldüğü bölgedir.",
            "Anatomi", 85, "Yüksek", "Kemikler",
            ("Humerus kırıklarında n. axillaris hasarının en sık görüldüğü anatomik bölge hangisidir?",
             "Anatomik boyun", "Cerrahi boyun", "Humerus cismi", "Medial epikondil", "Olekranon fossası", "B",
             "Humerus cerrahi boynu, anatomik boyunun hemen distalinde yer alır ve n. axillaris bu bölge yakınından geçer. Cerrahi boyun kırıkları hem en sık hem de en klinik açıdan önemli humerus kırıklarıdır.",
             "Kolay"),
            ("Humerus medial epikondiline ilişkin olarak aşağıdakilerden hangisi doğrudur?",
             "N. radialis bu oluk üzerinden geçer ve ilişkili anatomik komşuluklar ile çevre dokular", "Golfçü dirseği medial epikondil ağrısıyla ilişkilidir", "Tenis dirseği medial epikondil ağrısına yol açar", "N. musculocutaneus bu bölgede yüzeyselleşir", "Lateral epikondilden daha az hassastır", "B",
             "Medial epikondilit 'golfçü dirseği', lateral epikondilit ise 'tenisçi dirseği' olarak adlandırılır. N. ulnaris medial epikondil arkasındaki oluktan geçer.",
             "Orta")
        );

        AddKQ(
            "Karpal kemiklerin proksimal sırası lateral-medial: Scaphoid-Lunate-Triquetrum-Pisiform; distal sıra: Trapezium-Trapezoid-Capitate-Hamate.",
            "Anatomi", 88, "Yüksek", "Kemikler",
            ("'She Looks Too Pretty, Try To Catch Her' anımsatıcısıyla hatırlanan kemik grubu hangisidir?",
             "Tarsus kemikleri", "Karpal kemikler", "Metatarsal kemikler", "Vertebra kısımları", "El parmak falanjları", "B",
             "Bu anımsatıcı karpal kemikleri lateral-medial, proksimal-distal olarak öğretir: Scaphoid-Lunate-Triquetrum-Pisiform / Trapezium-Trapezoid-Capitate-Hamate.",
             "Kolay")
        );

        // =========================================================
        // ÜST EKSTREMİTE — EKLEMLER
        // =========================================================
        AddKQ(
            "Glenohumeral eklem (omuz), en sık disloke olan eklemdir; anterior dislokasyon çok daha sık görülür.",
            "Anatomi", 95, "Çok Yüksek", "Eklemler",
            ("Vücutta en sık disloke olan eklem hangisidir?",
             "Kalça eklemi ve ilişkili anatomik komşuluklar ile çevre dokular", "Dirsek eklemi", "Diz eklemi", "Glenohumeral eklemi", "El bilek eklemi", "D",
             "Glenohumeral eklem, labrum ve kapsülün görece zayıflığı nedeniyle en sık disloke olan eklemdir. Anterior dislokasyon (%95-97), posterior dislokasyon (%2-4) olarak görülür.",
             "Kolay"),
            ("Omuz anterior dislokasyonunda hangi sinir hasarı en sık karşılaşılır?",
             "N. medianus", "N. radialis", "N. ulnaris", "N. axillaris", "N. suprascapularis", "D",
             "Anterior dislokasyonda humerus başı öne kayarken n. axillaris gerilir veya yaralanır. Bu nedenle deltoid testi ve koltuk altı duyusu mutlaka kontrol edilmelidir.",
             "Kolay")
        );

        AddKQ(
            "Dirsek eklemi: humeroulnar (fleksiyon-ekstansiyon), humeroradial ve proksimal radioulnar eklemleri içerir.",
            "Anatomi", 83, "Yüksek", "Eklemler",
            ("Dirsek pronasyon-supinasyon hareketinden sorumlu eklem hangisidir?",
             "Humeroulnar eklem ve ilişkili anatomik komşuluklar ile çevre dokular", "Humeroradial eklem", "Proksimal radioulnar eklem", "Distal radioulnar eklem", "Proksimal radioulnar eklem ve distal radioulnar eklem birlikte", "E",
             "Önkol rotasyonu (pronasyon-supinasyon) proksimal ve distal radioulnar eklemlerin eş zamanlı hareketi ile gerçekleşir; birini izole olarak çalıştırmak mümkün değildir.",
             "Orta")
        );

        // =========================================================
        // ÜST EKSTREMİTE — KASLAR
        // =========================================================
        AddKQ(
            "Rotator cuff: Supraspinatus, Infraspinatus, Teres minor, Subscapularis (SITS). Supraspinatus en sık yırtılan kastır.",
            "Anatomi", 98, "Çok Yüksek", "Kaslar",
            ("Rotator cuff'ın kaç kasından oluştuğu ve bu kasların kısaltması aşağıdakilerden hangisinde doğru verilmiştir?",
             "3 kas — SIT", "4 kas — SITS", "4 kas — TISS", "5 kas — SITTS", "3 kas — SIS", "B",
             "Rotator cuff 4 kası içerir: Supraspinatus (abduksiyon), Infraspinatus (dış rotasyon), Teres minor (dış rotasyon), Subscapularis (iç rotasyon). Kısaltması SITS olarak hatırlanır.",
             "Kolay"),
            ("Supraspinatus kası aşağıdaki hareketlerden hangisinden birincil sorumludur?",
             "Omuz iç rotasyonu ve ilişkili anatomik komşuluklar ile çevre dokular", "Omuz dış rotasyonu", "Omuz abduksiyonunun ilk 0-15 derecesi", "Skapula depresyonu", "Omuz fleksiyonu", "C",
             "Supraspinatus kası, özellikle abduksiyonun ilk 15 derecesini başlatan kastır. Bu açının üzerinde deltoid kas dominantlığı alır. En sık yırtılan rotator cuff kasıdır.",
             "Orta"),
            ("Rotator cuff kasları içinde iç rotasyondan sorumlu olan tek kas hangisidir?",
             "Supraspinatus ve ilişkili anatomik komşuluklar ile çevre dokular", "Infraspinatus", "Teres minor", "Subscapularis", "Deltoid", "D",
             "Subscapularis, omuzda iç rotasyonu sağlayan tek rotator cuff kasıdır; diğer üç kas (SIT) omuzun dış rotasyonuna ya da abduksiyonuna katkıda bulunur.",
             "Kolay")
        );

        AddKQ(
            "Biceps brachii ön kol supinasyonunda en güçlü kastır (90 derece fleksiyonda maksimum etki).",
            "Anatomi", 87, "Yüksek", "Kaslar",
            ("Biceps brachii kasının birincil fonksiyonu aşağıdakilerden hangisidir?",
             "Ön kol pronasyonu ve ilişkili anatomik komşuluklar ile çevre dokular", "Omuz abduksiyonu", "Ön kol supinasyonu ve dirsek fleksiyonu", "Dirsek ekstansiyonu", "Parmak fleksiyonu", "C",
             "Biceps brachii'nin en güçlü etkisi ön kol supinasyonudur (radiusun uzun kolu sayesinde). Dirsek fleksiyonuna da önemli katkı yapar; her iki fonksiyon 90° fleksiyonda maksimum verime ulaşır.",
             "Kolay"),
            ("Biceps brachii'nin uzun başı hangi yapıdan köken alır?",
             "Coracoid process ve ilişkili anatomik komşuluklar ile çevre dokular", "Glenoid labrum üst kenarı", "Humerus anatomik boynu", "Akromion", "Klavikula lateral ucu", "B",
             "Uzun baş supraglenoid tüberküle tutunur ve glenohumeral eklem içinden geçer (intraartikular yol). Kısa baş ise coracoid process'e tutunur.",
             "Orta")
        );

        AddKQ(
            "Triceps brachii tek dirsek ekstansörüdür; n. radialis tarafından innerve edilir.",
            "Anatomi", 85, "Yüksek", "Kaslar",
            ("Dirsek ekstansiyonundan sorumlu temel kas hangisidir?",
             "Biceps brachii ve ilişkili anatomik komşuluklar ile çevre dokular", "Brachialis", "Brachioradialis", "Triceps brachii", "Ankoneus", "D",
             "Triceps brachii, olekranona yapışarak dirsek ekstansiyonunu sağlayan asıl kas olup n. radialis tarafından innerve edilir. Ankoneus küçük bir katkı sağlar.",
             "Kolay")
        );

        // =========================================================
        // ALT EKSTREMİTE — LUMBOSAKRAL PLEKSUS
        // =========================================================
        AddKQ(
            "Nervus femoralis (L2-L4) quadriceps femoris ve iliopsoas kaslarını innerve eder; kasık yaralanmalarında sık zarar görür.",
            "Anatomi", 95, "Çok Yüksek", "Lumbosakral Pleksus",
            ("N. femoralis hasarında en belirgin hareket kaybı hangi harekettte beklenir?",
             "Kalça iç rotasyonu", "Kalça adduksiyonu", "Diz ekstansiyonu", "Ayak plantar fleksiyonu", "Kalça abduksiyonu", "C",
             "N. femoralis (L2-L4), quadriceps femoris ve iliopsoas kaslarını innerve eder. Hasarında diz ekstansiyonu (yürüme, merdiven çıkma) belirgin şekilde bozulur; diz refleksi kaybolur.",
             "Kolay"),
            ("N. femoralis hasarında duyusal kayıp en çok nereden beklenir?",
             "Ayak tabanı ve ilişkili anatomik komşuluklar ile çevre dokular", "Ayak dış kenarı", "Uyluk ön ve iç yüzü, bacak iç yüzü", "Uyluk arka yüzü", "Diz arka yüzü", "C",
             "N. femoralis, uyluk ön-iç yüzünü ve devamında n. saphenus aracılığıyla bacak ile ayağın iç yüzünü duyusal olarak innerve eder.",
             "Orta")
        );

        AddKQ(
            "Nervus obturatorius (L2-L4) kalça adduktörlerini innerve eder; pelvis kırıklarında zarar görebilir.",
            "Anatomi", 88, "Yüksek", "Lumbosakral Pleksus",
            ("Kalça addüksiyonundan birincil sorumlu sinir hangisidir?",
             "N. femoralis", "N. ischiadicus", "N. obturatorius", "N. gluteus superior", "N. gluteus inferior", "C",
             "N. obturatorius (L2-L4), adductor longus, brevis, magnus (ön parça) ve gracilis kaslarını innerve ederek kalça addüksiyonunu sağlar.",
             "Kolay")
        );

        AddKQ(
            "Nervus ischiadicus, insan vücudunun en büyük ve en uzun siniridir (L4-S3).",
            "Anatomi", 97, "Çok Yüksek", "Lumbosakral Pleksus",
            ("Vücudun en büyük siniri hangisidir ve hangi köklerden kaynaklanır?",
             "N. femoralis — L1-L4", "N. ischiadicus — L4-S3", "N. tibialis — L4-S2", "N. fibularis communis — L4-S2", "Plexus brachialis — C5-T1", "B",
             "N. ischiadicus (siyatik sinir), L4-S3 köklerinden oluşan vücudun en büyük siniridir. Foramen infrapiriforme'den geçerek uyluğun arka yüzünden aşağı iner.",
             "Kolay"),
            ("N. ischiadicus, popliteal fossada genellikle hangi sinir dallarına ayrılır?",
             "N. tibialis ve n. femoralis ve ilişkili anatomik komşuluklar ile çevre dokular", "N. suralis ve n. saphenus", "N. tibialis ve n. fibularis communis", "N. gluteus superior ve inferior", "N. obturatorius ve n. femoralis", "C",
             "N. ischiadicus, popliteal fossada n. tibialis (medial) ve n. fibularis communis'e (lateral) ayrılır. Bu ayrışma proksimalde de olabilir.",
             "Kolay")
        );

        AddKQ(
            "N. fibularis (peroneus) communis fibula boynu çevresini dolarken yüzeysel seyreder; bölgeye baskı uygulandığında zarar görür.",
            "Anatomi", 96, "Çok Yüksek", "Lumbosakral Pleksus",
            ("Alt ekstremitede en sık kompresyon yaralanmasına uğrayan sinir hangisidir?",
             "N. tibialis ve ilişkili anatomik komşuluklar ile çevre dokular", "N. femoralis", "N. fibularis communis", "N. ischiadicus", "N. obturatorius", "C",
             "N. fibularis communis, fibula boynu çevresinde yüzeysel seyrettiğinden bölgeye alçı basısı, uzun süre bağdaş kurma veya çömelme gibi dış baskılarla kolayca zarar görür.",
             "Kolay"),
            ("N. fibularis communis hasarında hangi hareket kaybı ve duyu defisiti beklenir?",
             "Plantar fleksiyon kaybı ve topuk arka yüzünde duyu kaybı ve ilişkili anatomik komşuluklar ile çevre dokular", "Diz ekstansiyon kaybı ve uyluk ön yüzünde duyu kaybı", "Ayak dorsifleksiyon ve eversiyon kaybı + ayak ve bacak ön yüzünde duyu kaybı", "Kalça abdüksiyon kaybı ve gluteal duyu kaybı", "Parmak fleksiyon kaybı ve ayak tabanında duyu kaybı", "C",
             "N. fibularis communis, ayak dorsifleksörleri ve evertörlerini innerve eder. Hasarında 'foot drop' (düşük ayak) ve bacak ön-lateral yüzü ile ayak sırtında duyu kaybı gelişir.",
             "Kolay")
        );

        AddKQ(
            "N. gluteus superior (L4-S1) gluteus medius ve minimus kaslarını innerve eder; hasarında Trendelenburg yürüyüşü oluşur.",
            "Anatomi", 91, "Çok Yüksek", "Lumbosakral Pleksus",
            ("Trendelenburg belirtisinin pozitif olması hangi kasın yetersizliğine işaret eder?",
             "Gluteus maximus", "Gluteus medius", "Tensor fasciae latae", "Piriformis", "Obturator internus", "B",
             "Trendelenburg belirtisinde hasta tek bacak üzerinde dururken karşı kalça düşer. Bu, yük taşıyan taraftaki gluteus medius (n. gluteus superior) yetersizliğini gösterir.",
             "Kolay"),
            ("N. gluteus inferior (L5-S2) hangi kasın innervasyonundan sorumludur?",
             "Gluteus medius", "Gluteus minimus", "Gluteus maximus", "Piriformis", "Tensor fasciae latae", "C",
             "N. gluteus inferior yalnızca gluteus maximus'u innerve eder. Bu kas kalça ekstansiyonu ve dış rotasyonunun en güçlü motorudur.",
             "Kolay")
        );

        // =========================================================
        // ALT EKSTREMİTE — PELVİS VE UYLUK
        // =========================================================
        AddKQ(
            "Femur, insan vücudunun en uzun ve en güçlü kemiğidir.",
            "Anatomi", 90, "Yüksek", "Pelvis ve Uyluk",
            ("İnsan vücudunun en uzun kemiği hangisidir?",
             "Tibia", "Humerus", "Ulna", "Femur", "Radius", "D",
             "Femur hem en uzun hem de en ağır kemiktir; vücut boyunun yaklaşık 1/4'ü uzunluğundadır. Kırıkları ciddi kan kaybına yol açabilir.",
             "Kolay"),
            ("Femur boyun kırığının avasküler nekroz riskinin en yüksek olduğu tip hangisidir?",
             "Subtrokanterik kırık", "Trokanterik kırık", "Subkapital kırık", "İntrokanterik kırık", "Şaft kırığı", "C",
             "Subkapital kırıklar intrakapsüler olduğundan, femur başını besleyen medial femoral sirkumfleks arterin dalları kolayca zedelenir ve avasküler nekroz riski en yüksek bu grupta görülür.",
             "Orta")
        );

        AddKQ(
            "Piriformis kası, büyük siyatik foramen'i iki bölüme ayırır. N. ischiadicus genellikle foramen infrapiriforme'den geçer.",
            "Anatomi", 87, "Yüksek", "Pelvis ve Uyluk",
            ("Piriformis sendromunda hangi sinir sıkışır?",
             "N. femoralis", "N. obturatorius", "N. gluteus superior", "N. ischiadicus", "N. pudendus", "D",
             "Piriformis sendromunda n. ischiadicus piriformis kası altında sıkışır. Kalça ve uyluk arka yüzüne yayılan ağrı ile siyatik ağrıya benzer tablo oluşturur.",
             "Kolay")
        );

        // =========================================================
        // ALT EKSTREMİTE — BACAK VE AYAK
        // =========================================================
        AddKQ(
            "Tibia, vücudun en fazla kırılan uzun kemiğidir ve tüm uzunluğu boyunca medial yüzü subkutanözdür.",
            "Anatomi", 88, "Yüksek", "Bacak ve Ayak",
            ("Bacak kemiği kırıklarında geç iyileşme ve yara komplikasyonu riski neden tibiada daha yüksektir?",
             "Tibia daha az kanlandığından ve ilişkili anatomik komşuluklar ile çevre dokular", "Tibianın medial yüzü subkutanöz olduğundan yumuşak doku koruması yetersizdir", "Tibia kaslardan daha az destek alır", "Tibia periost içermez", "Tüm bunlar doğrudur", "B",
             "Tibianın medial yüzü subkutan olduğundan açık kırıklar ve enfeksiyon riski daha yüksektir. Arka yüz kaslarla korunmaktadır.",
             "Orta")
        );

        AddKQ(
            "Patella, vücudun en büyük sesamoid kemiğidir; quadriceps tendonunun içinde yer alır.",
            "Anatomi", 90, "Yüksek", "Bacak ve Ayak",
            ("Patella hangi tendonun içinde bulunur ve vücudun hangi sesamoid kemiğidir?",
             "Hamstring tendonu içinde, en büyük sesamoid kemik ve ilişkili anatomik komşuluklar ile çevre dokular", "Quadriceps tendonu içinde, en büyük sesamoid kemik", "Patellar ligament içinde, en küçük sesamoid kemik", "İliotibial bant içinde, en büyük sesamoid kemik", "Gastrocnemius tendonu içinde", "B",
             "Patella, quadriceps femoris kasının tendonuna gömülü hâldeki vücudun en büyük sesamoid kemiğidir ve diz ekstansiyon mekanizmasının gücünü artırır.",
             "Kolay")
        );

        AddKQ(
            "Ayak bileğinde medial malleolus tibiaya, lateral malleolus fibulaya aittir. En sık yaralanan lateral bağ kompleksidir.",
            "Anatomi", 93, "Çok Yüksek", "Bacak ve Ayak",
            ("Ayak bileği inversiyonunda en sık yırtılan ligaman hangisidir?",
             "Deltoid ligaman", "Tibiofibular ligaman", "Anterior talofibular ligaman", "Kalsaneofibular ligaman", "Posterior talofibular ligaman", "C",
             "İnversiyon burkulmalarında önce ATFL, sonra kalsaneofibular ligaman yaralanır. ATFL, lateral bağ kompleksinin en zayıf ve en sık yırtılan bileşenidir.",
             "Kolay")
        );

        // =========================================================
        // GENEL OSTEOLOJİ
        // =========================================================
        AddKQ(
            "Endokondral ossifikasyon uzun kemiklerin büyümesinde kullanılan yöntemdir; epifiz plağından gerçekleşir.",
            "Anatomi", 92, "Çok Yüksek", "Genel Osteoloji",
            ("Uzun kemiklerin boyunca büyümesinden hangi ossifikasyon tipi sorumludur?",
             "İntramembranöz ossifikasyon", "Endokondral ossifikasyon", "Periosteal ossifikasyon", "Appositional ossifikasyon", "Sütür ossifikasyonu", "B",
             "Endokondral ossifikasyonda kıkırdak model kemikle yer değiştirir; epifiz plakları (büyüme plakları) uzun kemiklerin boyuna büyümesini sağlar.",
             "Kolay"),
            ("Kafa kemiklerinin çoğu hangi ossifikasyon tipiyle oluşur?",
             "Endokondral ossifikasyon ve ilişkili anatomik komşuluklar ile çevre dokular", "İntramembranöz ossifikasyon", "Periosteal ossifikasyon", "Subkondral ossifikasyon", "Fibröz ossifikasyon", "B",
             "Kafa yassı kemikleri (frontal, parietal, oksipital taban hariç) ve mandibula intramembranöz ossifikasyonla oluşur; kıkırdak ara model kullanılmaz.",
             "Orta")
        );

        AddKQ(
            "Kemik rezorpsiyonu osteoklastlar tarafından, kemik yapımı osteoblastlar tarafından gerçekleştirilir.",
            "Anatomi", 90, "Yüksek", "Genel Osteoloji",
            ("Kemik rezorpsiyonu (erimesi) hangi hücre tipi tarafından gerçekleştirilir?",
             "Osteositler ve ilişkili anatomik komşuluklar ile çevre dokular", "Osteoblastlar", "Osteoklastlar", "Kondroitler", "Fibroblastlar", "C",
             "Osteoklastlar, çok çekirdekli dev hücre tipidir ve asit ile lizozomal enzimler salgılayarak kemik matrisi parçalar. Osteoporozda bu denge osteoblastlar aleyhine bozulur.",
             "Kolay")
        );

        AddKQ(
            "Yassı kemikler (sternum, kaburgalar, kafa kemikleri) esas kırmızı kemik iliği barındıran kemiklerdir.",
            "Anatomi", 86, "Yüksek", "Genel Osteoloji",
            ("Yetişkinlerde kırmızı kemik iliği hangi kemiklerde ağırlıklı olarak bulunur?",
             "Uzun kemiklerin diyafizlerinde ve ilişkili anatomik komşuluklar ile çevre dokular", "Yassı kemikler ve kısa kemiklerde", "Tüm kemik iliğinde eşit dağılır", "Yalnızca femur boynunda", "Yalnızca humerus proksimalinde", "B",
             "Yetişkinlerde aktif hematopoez (kırmızı kemik iliği); sternum, vertebra cisimleri, kaburgalar, kranium ve iliak kanat gibi yassı ve kısa kemiklerde yürütülür.",
             "Kolay")
        );

        // =========================================================
        // GENEL ARTROLOJİ
        // =========================================================
        AddKQ(
            "Sinovyal eklemler (diartrozlar) en hareketli eklem tipidir; sinovyal membran sinovyal sıvı üretir.",
            "Anatomi", 88, "Yüksek", "Genel Artroloji",
            ("En hareketli eklem tipi hangisidir ve kaç harekete izin verir?",
             "Synarthrosis — 0 hareket", "Amphiarthrosis — sınırlı hareket", "Diarthrosis — serbest hareket", "Hemi-arthrosis — tek düzlemde hareket", "Syndesmosis — yay hareketi", "C",
             "Sinovyal (diartroidal) eklemler, sinovyal sıvı ve artüler kıkırdak sayesinde en geniş hareket aralığına sahip eklemlerdir. Glenohumeral, kalça, diz bunlara örnektir.",
             "Kolay"),
            ("Sinovyal sıvı (sinovya) hangi yapı tarafından üretilir?",
             "Periost ve ilişkili anatomik komşuluklar ile çevre dokular", "Subkondral kemik", "Sinovyal membran", "Fibröz kapsül", "Eklem diski", "C",
             "Sinovyal membran eklem boşluğunu döşer ve yüzeysel A tipi hücreler (makrofaj) ile B tipi hücreler (fibroblast) hialoronik asit ve protein içeren sinovyal sıvıyı üretir.",
             "Kolay")
        );

        AddKQ(
            "Menisküsler fibrokartilajdan yapılmıştır; medial menisküs daha az hareketli olduğundan daha sık yırtılır.",
            "Anatomi", 92, "Çok Yüksek", "Genel Artroloji",
            ("Diz ekleminde medial menisküs lateral menisküse kıyasla daha sık yaralanır; bunun temel nedeni nedir?",
             "Medial menisküs daha büyüktür ve ilişkili anatomik komşuluklar ile çevre dokular ve diğer klinik olarak önemli komşu anatomik yapılar", "Medial menisküs medial kollateral ligamana yapışık olduğundan hareketi kısıtlıdır", "Lateral menisküs daha yoğun kıkırdaktan yapılmıştır", "Medial menisküs daha zayıf beslenir", "Medial menisküs daha az kıkırdak içerir", "B",
             "Medial menisküs, medial kollateral ligamana bağlantılı olduğundan hareket alanı kısıtlıdır; bu nedenle rotasyonel kuvvetlerden daha fazla etkilenir ve daha sık yırtılır.",
             "Orta")
        );

        // =========================================================
        // NÖROANATOMİ — MEDULla SPİNALİS
        // =========================================================
        AddKQ(
            "Conus medullaris medulla spinalisin konik ucu olup yetişkinde L1-L2 vertebra seviyesinde sonlanır.",
            "Anatomi", 97, "Çok Yüksek", "Medulla Spinalis",
            ("Yetişkinlerde medulla spinalis hangi seviyede sonlanır?",
             "T12 vertebra alt kenarı", "L1-L2 disk seviyesi", "L3-L4 disk seviyesi", "S1 vertebra seviyesi", "C5 vertebra seviyesi", "B",
             "Conus medullaris, yetişkinlerde genellikle L1 alt kenarı ile L2 üst kenarı arasında sonlanır. Bu nedenle L3 ve altında yapılan lomber ponksiyon medullaya zarar vermez.",
             "Kolay"),
            ("Conus medullaris'ten uzanan ve spinal kanalda L3-Co1 arasında yer alan sinir kökleri kümesinin adı nedir?",
             "Filum terminale", "Cauda equina", "Dorsal kolon", "Fasikulus cuneatus", "İnternal kapsül", "B",
             "L2 seviyesi altında spinal kanaldaki serbest sinir kökleri cauda equina'yı (at kuyruğu) oluşturur. Lomber disk hernileri sıklıkla bu kökleri etkiler.",
             "Kolay")
        );

        AddKQ(
            "Lateral kortikospinal yol (piramidal yol) ters çapraz yapar; aynı taraf motor korteks, karşı taraf kasları kontrol eder.",
            "Anatomi", 98, "Çok Yüksek", "Medulla Spinalis",
            ("Lateral kortikospinal yolun çaprazlaşma (dekussasyon) yaptığı yer neresidir?",
             "Mezensefalon ve ilişkili anatomik komşuluklar ile çevre dokular", "Pons alt bölümü", "Medulla oblongata piramid çaprazlaşması", "Spinal kord servikal bölümü", "Talamus", "C",
             "Lateral kortikospinal yolun liflerinin %85-90'ı medulla oblangatada piramis çaprazlaşmasını yaparak karşı tarafa geçer; kalan lifler spinal korda girer ve orada çaprazlar.",
             "Kolay"),
            ("Beynin sağ motor korteksinin bir lezyonunda hangi taraf motor etkilenir?",
             "Sağ taraf", "Sol taraf", "Her iki taraf eşit etkilenir", "Yalnızca kraniyel sinir kasları etkilenir", "Bası durumunda hiç etkilenmez", "B",
             "Lateral kortikospinal yol medullada çapraz yaptığından, sağ motor korteks hasarında sol taraf spastik parezi (üst motor nöron paralizisi) gelişir.",
             "Kolay")
        );

        AddKQ(
            "Dorsal kolonlar ipsilateral ince dokunma, vibrasyon ve propriosepsiyonu taşır; posterior spinal arterce beslenir.",
            "Anatomi", 95, "Çok Yüksek", "Medulla Spinalis",
            ("Medulla spinalisin dorsal kolonları hangi duyuları taşır?",
             "Ağrı ve ısı duyusu ve ilişkili anatomik komşuluklar ile çevre dokular", "İnce dokunma, vibrasyon ve bilinçli propriosepsiyon", "Ağrı, ısı ve kaba dokunma", "Sadece propriosepsiyon", "Motor komutlar", "B",
             "Dorsal kolonlar (fasikulus gracilis + cuneatus) aynı taraf ince dokunma, vibrasyon ve propriosepsiyonu taşır. Çaprazlaşma medullada gerçekleşir (medyal lemniskus).",
             "Kolay")
        );

        AddKQ(
            "Lateral spinotalamik yol, ağrı ve ısı duyusunu taşır; spinal korda girdikten 1-2 segment sonra çapraz yapar.",
            "Anatomi", 97, "Çok Yüksek", "Medulla Spinalis",
            ("Lateral spinotalamik yol spinal korda girdikten sonra çaprazlaşma nerede gerçekleştirir?",
             "Medulla oblongata'da ve ilişkili anatomik komşuluklar ile çevre dokular", "Ponsta", "Aynı seviyede veya 1-2 segment üstte anterior komissürde", "Mezensefalon'da", "Hiç çapraz yapmaz, ipsilateral seyreder", "C",
             "Ağrı ve ısı lifleri arka boynuza girdikten sonra kısa bir süre yukarı çıkar ve anterior gri komisürden karşı tarafa geçerek lateral spinotalamik yola katılır.",
             "Kolay"),
            ("Brown-Séquard sendromu nedir ve hangi bulgular beklenir?",
             "Spinal kordun tamamının kesilmesi — komple tetrapleji ve ilişkili anatomik komşuluklar ile çevre dokular ve diğer klinik olarak önemli komşu anatomik yapılar", "Spinal kordun yarısının kesilmesi — ipsilateral motor ve dorsal kolon kaybı, kontralateral spinotalamik kayıp", "Anterior spinal arterin tıkanması — bilateral motor ve spinotalamik kayıp, dorsal kolon korunur", "Sadece arka kordonların etkilenmesi — propriosepsiyon kaybı", "Santral kord sendromu — üst ekstremite > alt ekstremite parezi", "B",
             "Brown-Séquard (hemiseksiyon); ipsilateral tarafta motor + dorsal kolon kaybı (çapraz yapmaz), kontralateral tarafta spinotalamik kayıp (çaprazlandı) ile kendine özgü bir tablo verir.",
             "Orta")
        );

        AddKQ(
            "Anterior kord sendromunda motor ve spinotalamik yollar (ağrı/ısı) bozulur; dorsal kolonlar (propriosepsiyon/vibrasyon) korunur.",
            "Anatomi", 91, "Çok Yüksek", "Medulla Spinalis",
            ("Anterior spinal arter sendromunda hangi duyular korunur?",
             "Ağrı ve ısı duyusu ve ilişkili anatomik komşuluklar ile çevre dokular", "Motor fonksiyon", "Vibrasyon ve propriosepsiyon", "Tüm duyular kaybolur", "Yalnızca motor korunur", "C",
             "Anterior spinal arter, anterior iki üçlük spinal kordu besler; dorsal kolonlar posterior spinal arterlerle beslenir. Bu nedenle anterior sendromda propriosepsiyon ve vibrasyon görece korunur.",
             "Orta")
        );

        // =========================================================
        // NÖROANATOMİ — BEYİN SAPI
        // =========================================================
        AddKQ(
            "Mesencephalon: CN III (okulomotor) ve CN IV (troklear) çıkış seviyesidir. CN IV, beyinin dorsal yüzünden çıkan tek kraniyal sinirdir.",
            "Anatomi", 93, "Çok Yüksek", "Beyin Sapı",
            ("Beyinin dorsal (arka) yüzünden çıkan tek kraniyal sinir hangisidir?",
             "CN III", "CN IV", "CN VI", "CN VII", "CN XII", "B",
             "N. trochlearis (CN IV), beyin sapının arka yüzünden çıkan tek sinir olma özelliği taşır ve superior oblique kasını innerve eder. Superior oblique hasarında göz içe bakışta çift görme artar.",
             "Orta"),
            ("Pons'tan çıkan kraniyal sinirlerin doğru listesi aşağıdakilerden hangisidir?",
             "CN III, IV ve ilişkili anatomik komşuluklar ile çevre dokular", "CN IX, X, XI", "CN V, VI, VII, VIII", "CN I, II", "CN XI, XII", "C",
             "Pons'tan CN V (trigeminal), CN VI (abdusens), CN VII (fasiyal) ve CN VIII (vestibulokohlear) çıkar. Medulladan IX, X, XI, XII çıkar.",
             "Orta")
        );

        AddKQ(
            "Locus coeruleus (pons) noradrenalinin, Raphe nukleusları (beyin sapı) serotoninin, substansia nigra (mezensefalon) dopaminin ana kaynağıdır.",
            "Anatomi", 94, "Çok Yüksek", "Beyin Sapı",
            ("Dopaminerjik nöronların yoğunlaştığı ve Parkinson hastalığında dejenerasyona uğrayan yapı hangisidir?",
             "Locus coeruleus", "Raphe nukleusları", "Substansia nigra pars compacta", "Bazal gangliya caudate nukleusu", "Nucleus accumbens", "C",
             "Substansia nigra pars compacta, striatuma dopamin gönderir (nigrostriatal yol). Parkinson hastalığında bu nöronlar kaybedilir, motor kontrol bozulur.",
             "Kolay"),
            ("Serotonin üreten nöronlar ağırlıklı olarak hangi yapıda bulunur?",
             "Locus coeruleus ve ilişkili anatomik komşuluklar ile çevre dokular", "Substansia nigra", "Raphe nukleusları", "Hippokampus", "Amigdala", "C",
             "Raphe nukleusları, beyin sapında orta hat boyunca uzanır ve beyin genelindeki serotonin üretiminin merkezidir. Antidepresanlar (SSRI'lar) bu sistemi hedef alır.",
             "Kolay")
        );

        // =========================================================
        // NÖROANATOMİ — SEREBELLUM
        // =========================================================
        AddKQ(
            "Serebellum ipsilateral koordinasyonu yönetir (serebellar hemisferler çapraz yapmaz).",
            "Anatomi", 95, "Çok Yüksek", "Serebellum",
            ("Sağ serebellar hemisfer lezyonunda koordinasyon bozukluğu hangi tarafta beklenir?",
             "Sol tarafta", "Sağ tarafta", "Her iki tarafta eşit", "Yalnızca gövdede", "Bacaklarda değil kolda", "B",
             "Serebellum çapraz yapmaz; sağ hemisfer sağ taraf ekstremitelerinin koordinasyonunu düzenler. Motor korteks ve spinotalamik yolun aksine çaprazlaşma yoktur.",
             "Kolay"),
            ("Serebellar vermis hasarında öne çıkan belirti hangisidir?",
             "Sağ el ataksisi ve ilişkili anatomik komşuluklar ile çevre dokular", "Sağ alt ekstremite tremoru", "Gövde ataksisi ve yürüme bozukluğu", "Nistagmus olmaksızın denge kaybı", "Bilateral ekstremite tremoru", "C",
             "Vermis, gövde ve bacak koordinasyonunu (postural denge, yürüme) denetler. Midline (medyan) lezyonlar; serebellar hemisfer lezyonları ise ipsilateral el-kol ataksisi yapar.",
             "Orta")
        );

        AddKQ(
            "Serebellar çıkış nükleusu olarak en büyük ve en lateralde bulunanı dentate nükleusudur.",
            "Anatomi", 86, "Yüksek", "Serebellum",
            ("Serebellar çekirdekler içinde en büyüğü ve lateral yerleşimlisi hangisidir?",
             "Fastigial nükleus", "Emboliform nükleus", "Globose nükleus", "Dentate nükleus", "Purkinje nükleusu", "D",
             "Dentate nükleus, en büyük ve en lateral serebellar çıkış çekirdeğidir. Superior serebellar pedinkülden geçerek talamus ve motor kortekse projeksiyon gönderir.",
             "Orta")
        );

        // =========================================================
        // NÖROANATOMİ — DİENSEFALON
        // =========================================================
        AddKQ(
            "Talamus, korteks altındaki tüm duyusal bilgilerin (koku hariç) röle istasyonudur.",
            "Anatomi", 95, "Çok Yüksek", "Diensefalon",
            ("Hangi duyu, talamus üzerinden geçmeden direkt kortekse ulaşır?",
             "Görme", "İşitme", "Ağrı ve ısı", "Koku", "Dokunma", "D",
             "Koku duyusu, talamus baypas ederek direkt olfaktör kortekse gider. Bu nedenle koku limbik sistemi ve duygusal yanıtları güçlü biçimde etkiler.",
             "Kolay"),
            ("Hipotalamus vücudun hangi temel işlevlerini düzenler?",
             "Yalnızca vücut ısısını ve ilişkili anatomik komşuluklar ile çevre dokular", "Yalnızca uyku-uyanıklık döngüsünü", "Otonom, endokrin ve homeostatik işlevleri", "Yalnızca üreme hormonlarını", "Yalnızca stres yanıtını", "C",
             "Hipotalamus; ısı, açlık-tokluk, su dengesi (ADH), uyku-uyanıklık ritmi ve üreme fonksiyonları başta olmak üzere otonom ve endokrin sistemin birleşme noktasıdır.",
             "Kolay")
        );

        AddKQ(
            "ADH (vazopressin) ve oksitosin hipotalamusta üretilir, nörohipofizde (arka hipofiz) depolanarak kana verilir.",
            "Anatomi", 97, "Çok Yüksek", "Diensefalon",
            ("ADH hangi yapıda üretilir ve hangi yapıdan kana salınır?",
             "Adenohipofizde üretilir, nörohipofizden salınır", "Hipotalamusta üretilir, nörohipofizden salınır", "Nörohipofizde üretilir ve depolanır", "Epifizde üretilir, talamus üzerinden salınır", "Hipotalamusta üretilir, adenohipofizden salınır", "B",
             "ADH (vazopressin) ve oksitosin, hipotalamik magnoselüler nöronlarda sentezlenir; akson boyunca taşınarak nörohipofiz'de depolanır ve gerektiğinde dolaşıma verilir.",
             "Orta")
        );

        // =========================================================
        // NÖROANATOMİ — SEREBRUM
        // =========================================================
        AddKQ(
            "Broca alanı (44-45. alanlar) sol frontal lobda konuşma üretiminden, Wernicke alanı (22. alan) sol temporal lobda konuşmayı anlamadan sorumludur.",
            "Anatomi", 98, "Çok Yüksek", "Serebrum",
            ("Broca afazisinde (ekspresif afazi) hangi bozukluk ön plandadır?",
             "Konuşmayı anlama bozukluğu, akıcı konuşma ve ilişkili anatomik komşuluklar ile çevre dokular", "Konuşma üretiminde bozukluk, anlama görece korunmuş", "Hem üretim hem anlama bozulmuş", "Yalnızca okuma bozukluğu", "Yalnızca yazma bozukluğu", "B",
             "Broca alanı hasarında hasta söyleneni anlayabilir ama akıcı konuşma üretemez (ekspresif afazi). Konuşma kısa, hatalı, zorlayarak yapılan bir niteliktedir.",
             "Kolay"),
            ("Wernicke afazisinde (reseptif afazi) hangi bozukluk ön plandadır?",
             "Konuşma üretiminde ciddi azalma, anlama korunmuş", "Akıcı ama anlamsız konuşma, anlama bozukluğu", "Yalnızca yazı anlama bozukluğu", "Yalnızca işitme kaybı", "Motor fonksiyon bozukluğu", "B",
             "Wernicke alanı (sol temporal lob) hasarında hasta akıcı ama anlamsız konuşma üretir (parafazi, jargon); dinlediklerini de anlayamaz.",
             "Kolay")
        );

        AddKQ(
            "Precentral gyrus (4. alan) primer motor kortekstir; homunculus konfigürasyonunda alt ekstremite medialde, yüz ise lateraldedir.",
            "Anatomi", 96, "Çok Yüksek", "Serebrum",
            ("Primer motor korteks hangi gyrusta bulunur?",
             "Postsentral gyrus", "Süperior temporal gyrus", "Presentral gyrus", "Angular gyrus", "Singulat gyrus", "C",
             "Presentral gyrus (frontal lob, 4. Brodmann alanı) primer motor kortekstir. Motor homunculus'ta ağız ve eller en geniş temsil alanına sahiptir.",
             "Kolay"),
            ("Mediyal yüzeyi etkileyen serebral korteks lezyonunda hangi vücut bölgesinin güçsüzlüğü daha belirgin olur?",
             "Yüz ve el parmaklarında", "Alt ekstremitede", "Gövde kaslarında", "Üst ekstremite proksimalinde", "Ağız çevresinde", "B",
             "Motor homunculus'ta alt ekstremite (özellikle ayak ve bacak), serebral hemisfer medial yüzünü (falks serebri bölgesi) işgal eder. Örn. anterior serebral arter enfarktında alt ekstremite güçsüzlüğü öne çıkar.",
             "Orta")
        );

        // =========================================================
        // NÖROANATOMİ — KRANİYAL SİNİRLER
        // =========================================================
        AddKQ(
            "CN III (N. oculomotorius) tüm göz dışı kasları (SO ve LR hariç) ve levator palpebrae'yi innerve eder; parasempatik lifler pupillayı daraltır.",
            "Anatomi", 98, "Çok Yüksek", "Kraniyal Sinirler",
            ("CN III hasarında göz bulguları aşağıdakilerden hangisidir?",
             "Göz aşağı-içe bakar", "Göz aşağı-dışa bakar, ptoz, midriyazis", "Göz yalnızca iç yöne bakar, miosis", "Göz sabitlenir, eşit pupil", "Yalnızca ptoz, göz hareketleri normaldir", "B",
             "CN III hasarında SO (CN IV) ve LR (CN VI) antagonistsiz kalır, göz aşağı-dışa döner. Levator palpebrae paralizisi ptoza, parasempatik lif hasarı midriyazise neden olur.",
             "Kolay"),
            ("'Surgical CN III palsy'de neden midriyazis öne çıkar?",
             "Motor liflerin dışarıda seyretmesi ve ilişkili anatomik komşuluklar ile çevre dokular", "Parasempatik liflerin CN III'ün dışarı kısmında seyretmesi", "Sempatik lifler hasarlı olduğundan", "İris sfinkteri CN VI tarafından innerve edildiğinden", "Pupilla refleksi CN IV'e bağlı olduğundan", "B",
             "Parasempatik pupillokonstriktör lifler CN III'ün periferinde seyreder. Anevrizma veya uncal herniasyon gibi dış bası durumunda bu lifler önce sıkışarak pupilla dilatasyonuna yol açar.",
             "Zor")
        );

        AddKQ(
            "CN IV (N. trochlearis), superior oblique kasını innerve eder; hasarında hastanın başını karşı tarafa eğmesiyle (head tilt) kompanse edilir.",
            "Anatomi", 88, "Yüksek", "Kraniyal Sinirler",
            ("CN IV hasarında ortaya çıkan çift görme (diplopi) hangi yöne bakışta artar?",
             "Yukarı ve dışa bakışta", "Aşağı ve içe bakışta", "Yana bakışta", "Yalnızca uzağa bakışta", "Işığa bakışta", "B",
             "Superior oblique kası gözü aşağı ve içe döndürür. Hasarında merdiven inerken veya aşağı-içe bakışta diplopi belirginleşir; hasta başı sağlam tarafa eğerek bunu telafi eder.",
             "Orta")
        );

        AddKQ(
            "CN V (N. trigeminus) yüzün duyusunu ve çiğneme kaslarını (masseter, temporalis, pterygoidler) innerve eder.",
            "Anatomi", 95, "Çok Yüksek", "Kraniyal Sinirler",
            ("Çiğneme kaslarını (masseter, temporalis, pterygoidler) hangi sinir innerve eder?",
             "CN VII", "CN IX", "CN V3", "CN XII", "CN XI", "C",
             "Çiğneme kasları CN V'in mandibüler dalı (V3) tarafından motor olarak innerve edilir. Bu nedenle trigeminal sinir yalnızca duyusal değil, motor komponent de içerir.",
             "Kolay"),
            ("Kornea refleksinin afferent kolu hangi sinirle taşınır?",
             "CN VII", "CN II", "CN V1", "CN III", "CN IX", "C",
             "Kornea refleksinde afferent kol CN V1 (oftalmik dal — n. nasociliaris yoluyla), efferent kol ise CN VII'dir (orbicularis oculi kasını kasarak göz kapağı kapanır).",
             "Orta")
        );

        AddKQ(
            "CN VI (N. abducens), lateral rectus kasını innerve eder; en sık izole felç olan kraniyal sinirdir (uzun intrakraniyal seyri nedeniyle).",
            "Anatomi", 90, "Çok Yüksek", "Kraniyal Sinirler",
            ("CN VI hasarında göz hareketi nasıl etkilenir?",
             "Gözde yukarı bakış kaybı ve ilişkili anatomik komşuluklar ile çevre dokular", "Gözde içe bakış kaybı", "Gözde dışa bakış kaybı — göz içe kayar", "Gözde aşağı bakış kaybı", "Gözde tüm hareketler kaybolur", "C",
             "N. abducens sadece lateral rectus kasını innerve eder. Felcinde göz dışa gidemez, medial rectus antagonistsiz kalarak göz içe kayar (ezotropya) ve yatay diplopi oluşur.",
             "Kolay")
        );

        AddKQ(
            "CN VII (N. facialis) mimik kaslarını, ön 2/3 lezyon duyusunu (korda tympani), lakrimal ve submandibüler bezleri innerve eder.",
            "Anatomi", 97, "Çok Yüksek", "Kraniyal Sinirler",
            ("Periferik CN VII (fasiyal sinir) hasarında üst ve alt yüz kaslarının etkilenme durumu nasıldır?",
             "Yalnızca alt yüz kasları etkilenir ve ilişkili anatomik komşuluklar ile çevre dokular", "Yalnızca üst yüz kasları etkilenir", "Hem üst hem alt yüz kasları ipsilateral etkilenir", "Kontralateral yüz etkilenir", "Yalnızca orbicularis oris etkilenir", "C",
             "Periferik fasiyal sinir hasarında (Bell paralizisi gibi) hem frontalis (alın) hem de mimik kasları etkilenir; bu nedenle etkilenen taraf alın kırıştırılamaz. Santral tipte ise alın korunur (çift kortikal projeksiyon sayesinde).",
             "Orta"),
            ("Bell paralizisinde hangi sinirin periferik dalı etkilenmiştir?",
             "CN V", "CN VI", "CN VII", "CN VIII", "CN IX", "C",
             "Bell paralizisi, CN VII'nin (n. facialis) stilomastoid foramen öncesindeki periferik hasarından kaynaklanır. İpsilateral yüzde tüm mimik kasları tutulur.",
             "Kolay")
        );

        AddKQ(
            "CN X (N. vagus) boyun, göğüs ve karın içi organlarına (Treitz bağı kadar) parasempatik innervasyonu sağlar.",
            "Anatomi", 96, "Çok Yüksek", "Kraniyal Sinirler",
            ("N. vagus'un parasempatik innervasyonu hangi bölgeye kadar uzanır?",
             "Mide çıkışına kadar ve ilişkili anatomik komşuluklar ile çevre dokular", "Duodenojejunal bileşime kadar", "Sigmoid kolona kadar", "Tüm kolonun sonuna kadar", "Yalnızca toraks organlarına", "B",
             "N. vagus, Treitz bağı (duodenojejunal bileşim) proksimaline kadar barsaklara parasempatik innervasyon sağlar. Distal kolon ve rektumun parasempatik innervasyonu sakral (S2-S4) kaynaklıdır.",
             "Orta"),
            ("Tekrarlayan laringeal sinir (n. laryngeus recurrens) hangi kraniyal sinirin dalıdır ve sol tarafta hangi yapıyı dolar?",
             "CN IX — karotis arterin arkasını ve ilişkili anatomik komşuluklar ile çevre dokular", "CN X — sol tarafta aorta arkı altından döner", "CN XI — klavikula altından geçer", "CN XII — hyoid kemiğini dolar", "CN VII — stilomastoid foramenden çıkar", "B",
             "Sol n. laryngeus recurrens, vagus sinirinden ayrılarak aorta arkı altından geçer (longer course). Bu nedenle aort anevrizması veya sol akciğer üst lob kanseri bu sinire bası yapabilir.",
             "Orta")
        );

        AddKQ(
            "CN XI (N. accessorius) sternocleidomastoid ve trapezius kaslarını innerve eder.",
            "Anatomi", 90, "Yüksek", "Kraniyal Sinirler",
            ("Aksesuar sinir (CN XI) hasarında hangi klinik bulgular beklenir?",
             "Dil deviasyonu ve disfaji", "Yüz asimetrisi ve göz kapağı düşüklüğü", "Boyun dönme güçlüğü ve omuz düşüklüğü", "Yutma güçlüğü ve ses kısıklığı", "Denge bozukluğu ve işitme kaybı", "C",
             "CN XI; SCM (başın karşıya dönmesi) ve trapezius kaslarını (omuz elevasyonu, skapula retraksiyonu) innerve eder. Posterior boyun diseksiyonu veya foramen jugulare lezyonlarında zarar görebilir.",
             "Kolay")
        );

        AddKQ(
            "CN XII (N. hypoglossus) dil kaslarını innerve eder; hasarında dil ipsilateral (etkilenen) tarafa deviasyon yapar.",
            "Anatomi", 92, "Çok Yüksek", "Kraniyal Sinirler",
            ("CN XII (hipoglossal sinir) hasarında dil hangi yöne deviye olur?",
             "Karşı tarafa ve ilişkili anatomik komşuluklar ile çevre dokular", "Sağlam tarafa", "Lezyonun olduğu tarafa", "Aşağı doğru", "Yukarı doğru", "C",
             "N. hypoglossus hasarında genioglossus kası güçsüzleşir. Çıkmış olan dil lezyon tarafına deviye olur çünkü sağlam taraf dili karşıya iter, hasta taraf itig yapamaz.",
             "Kolay")
        );

        // =========================================================
        // BAŞ BOYUN — KAFATASI
        // =========================================================
        AddKQ(
            "Sella turcica sfenoid kemik üzerinde yer alır ve hipofiz bezini barındırır.",
            "Anatomi", 95, "Çok Yüksek", "Kafatası",
            ("Hipofiz bezi kafatasında hangi kemik üzerindeki çukurda yer alır?",
             "Etmoid kemik", "Temporal kemik", "Sfenoid kemik", "Frontal kemik", "Oksipital kemik", "C",
             "Sella turcica (Türk eyeri), sfenoid kemiğin gövdesi üzerindeki çukurdu. Hipofiz bezi bu çukurda dura ile çevrili olarak oturur.",
             "Kolay"),
            ("Foramen magnum hangi kemikte bulunur?",
             "Temporal kemik ve ilişkili anatomik komşuluklar ile çevre dokular", "Sfenoid kemik", "Parietal kemik", "Oksipital kemik", "Frontal kemik", "D",
             "Foramen magnum (büyük delik), oksipital kemiğin tabanında yer alır; medulla spinalis buradan geçerek kraniyuma bağlanır.",
             "Kolay")
        );

        AddKQ(
            "Orta kranyal fossa kırıklarında 'çift gözlük izi' ve rinore ya da otore gelişebilir.",
            "Anatomi", 88, "Yüksek", "Kafatası",
            ("Temporal kemik kırığında hangi sinir en sık zarar görür?",
             "CN V ve ilişkili anatomik komşuluklar ile çevre dokular", "CN VII ve/veya CN VIII", "CN IX", "CN X", "CN III", "B",
             "Temporal kemik petröz parçasının kırıklarında fasiyal kanal içinden geçen CN VII (fasiyal sinir) ve iç işitme yolundan geçen CN VIII (vestibulokohlear sinir) sıkça etkilenir.",
             "Orta")
        );

        // =========================================================
        // BAŞ BOYUN — BOYUN ÜÇGENLERİ
        // =========================================================
        AddKQ(
            "Posterior boyun üçgeni: SCM arka kenarı, trapezius ön kenarı ve klavikula arasında yer alır. N. accessorius (CN XI) bu üçgenden geçer.",
            "Anatomi", 88, "Yüksek", "Boyun Üçgenleri",
            ("Posterior boyun üçgeninden geçen ve boyun diseksiyonunda zarar görebilen sinir hangisidir?",
             "N. phrenicus", "N. vagus", "N. accessorius", "N. hypoglossus", "N. glossopharyngeus", "C",
             "CN XI (aksesuar sinir) posterior boyun üçgeninden yüzeysel seyreder. Boyun kitlesi eksizyonlarında veya lenf nodu diseksiyonlarında zarar görerek trapezius paralizisine yol açabilir.",
             "Kolay")
        );

        AddKQ(
            "Karotis üçgeninde: ortak karotis arteri, internal juguler ven ve vagus siniri (karotis kılıfı içinde) bulunur.",
            "Anatomi", 90, "Yüksek", "Boyun Üçgenleri",
            ("Karotis kılıfının içeriği aşağıdakilerden hangisinde doğru verilmiştir?",
             "A. carotis communis, V. jugularis externa, N. phrenicus", "A. carotis communis, V. jugularis interna, N. vagus", "A. carotis interna, V. subclavia, N. accessorius", "A. carotis communis, V. jugularis interna, N. glossopharyngeus", "A. carotis externa, V. jugularis interna, N. hypoglossus", "B",
             "Karotis kılıfı a. carotis communis (içte), v. jugularis interna (dışta) ve n. vagus (arkada, aralarında) olmak üzere üç ana yapı barındırır.",
             "Orta")
        );

        // =========================================================
        // BAŞ BOYUN — FARİNKS VE LARİNKS
        // =========================================================
        AddKQ(
            "Epiglottis, yutma sırasında hava yolunu kapatır; elastik kıkırdaktan yapılmıştır.",
            "Anatomi", 90, "Yüksek", "Farinks ve Larinks",
            ("Larinks kıkırdakları içinde tek tam halka oluşturan ve trakeanın ilk tam halkası sayılan kıkırdak hangisidir?",
             "Tiroid kıkırdak", "Epiglotik kıkırdak", "Krikoid kıkırdak", "Arytenoid kıkırdak", "Kornikulate kıkırdak", "C",
             "Krikoid kıkırdak, larinksin tek tam halka kıkırdağıdır; hava yolunun en dar kısmını çocuklarda oluşturur. Acil krikotirotomi krikoid ile tiroid arasından yapılır.",
             "Kolay"),
            ("Tiroid kıkırdak hakkında doğru olan ifade aşağıdakilerden hangisidir?",
             "Tek tam halkadır ve ilişkili anatomik komşuluklar ile çevre dokular", "İki yaprağı önde birleşerek Adem elması'nı oluşturur", "Elastik kıkırdaktan yapılmıştır", "Yalnızca kadınlarda belirgindir", "Arytenoidlerle direkt eklem yapmaz", "B",
             "Tiroid kıkırdak, iki lateral laminanın önde birleştiği larenks'in en büyük kıkırdağıdır. Erkelerde daha belirgin olan bu çıkıntıya 'Adem elması' (prominentia laryngea) denir.",
             "Kolay")
        );

        AddKQ(
            "Vokal kordlar (true vocal cords) krikotiroid membranın üstünde yer alır; addüksiyon ses çıkarmayı, abdüksiyon ise solunumu sağlar.",
            "Anatomi", 92, "Çok Yüksek", "Farinks ve Larinks",
            ("Vokal kordların addüksiyonunu (yaklaştırılmasını) sağlayan kaslar hangi sinir tarafından innerve edilir?",
             "N. laryngeus superior", "N. glossopharyngeus", "N. laryngeus recurrens", "N. phrenicus", "N. vagus'un faringeal dalı", "C",
             "Krikotiroid dışındaki tüm larenks kasları n. laryngeus recurrens (inferior) tarafından innerve edilir. Tek istisnası krikotiroid kası olup n. laryngeus superior'ın dış dalı tarafından innerve edilir.",
             "Orta")
        );

        // =========================================================
        // İÇ ORGANLAR — TORAKS ANATOMİSİ
        // =========================================================
        AddKQ(
            "Sağ akciğerde 3 lob (üst, orta, alt), sol akciğerde 2 lob (üst, alt) bulunur. Sol akciğerde lingula, orta lobun eşdeğeridir.",
            "Anatomi", 97, "Çok Yüksek", "Toraks Anatomisi",
            ("Sağ akciğer ile sol akciğerin lob sayısı arasındaki fark ve nedeni aşağıdakilerden hangisinde doğru verilmiştir?",
             "Sağ 2 lob — sol 3 lob; kalbin sağda yer alması ve ilişkili anatomik komşuluklar ile çevre dokular", "Sağ 3 lob — sol 2 lob; kalbin sol tarafta yer alması ve kardiyak çentik", "Sağ 2 lob — sol 2 lob; her iki akciğer simetriktir", "Sağ 4 lob — sol 3 lob; plevra uzantısı farklıdır", "Sağ 3 lob — sol 3 lob; sol lingula 3. lob sayılır", "B",
             "Kalp mediastende sol tarafa meyil gösterir ve sol akciğerde kardiyak çentik ile lingula denilen çıkıntı oluşur. Bu nedenle sol akciğerde 2 lob (üst-alt) yer alırken sağda 3 lob (üst-orta-alt) bulunur.",
             "Kolay")
        );

        AddKQ(
            "SA nodu sağ koroner arterin SA nodal dalından beslenir (%60); AV nodu sağ koroner arterin PDA dalından beslenir (%80).",
            "Anatomi", 98, "Çok Yüksek", "Toraks Anatomisi",
            ("SA nodunun arteriyel kanlanmasını en sık hangi arterin dalı sağlar?",
             "Sol ön inen arter ve ilişkili anatomik komşuluklar ile çevre dokular", "Sirkumfleks arter", "Sağ koroner arterin SA nodal dalı", "Posterior inen arter", "Marjinal dal", "C",
             "SA nodu yaklaşık %60 oranında sağ koroner arterin SA nodal dalından beslenir; %40 olguda sirkumfleks arterin dalından beslenir.",
             "Kolay"),
            ("AV nodunun arteriyel kanlanmasından en sık hangi damar sorumludur?",
             "Sol ön inen arter ve ilişkili anatomik komşuluklar ile çevre dokular", "Sirkumfleks arter", "Sağ koroner arterin posterior inen arter dalı", "Sol marjinal arter", "Sol posterior inen arter", "C",
             "AV nodu %80-85 oranında sağ koroner arterin PDA (posterior descending artery) dalından beslenir. Bu nedenle inferior miyokart enfarktüslerinde AV blok sıkça görülür.",
             "Kolay")
        );

        AddKQ(
            "Diyafragma n. phrenicus (C3-C4-C5) tarafından innerve edilir. 'C3, C4, C5 keeps the diaphragm alive.'",
            "Anatomi", 98, "Çok Yüksek", "Toraks Anatomisi",
            ("Diyafragmayı innerve eden sinir ve köken aldığı spinal segmentler hangisidir?",
             "N. intercostalis — T6-T10", "N. phrenicus — C3-C5", "N. vagus — C1-C4", "N. thoracicus longus — C5-C7", "N. accessorius — C2-C4", "B",
             "N. phrenicus (C3-C4-C5), diyafragmanın motor ve duyusal innervasyon kaynağıdır. Servikal spinal kord yaralanmalarında felç yüksekliğine bağlı olarak solunum desteği gerekebilir.",
             "Kolay")
        );

        AddKQ(
            "Plevral boşluğun en büyük resesusu costodiaphragmatic recessus'tur; erken plevral efüzyonlarda sıvı burada birikir.",
            "Anatomi", 88, "Yüksek", "Toraks Anatomisi",
            ("Erken plevral efüzyonda sıvı hangi plevral resesusta birikerek akciğer opasitesi olmadan radyografide görülür?",
             "Costomediastinal recessus ve ilişkili anatomik komşuluklar ile çevre dokular", "Mediastinofrenik recessus", "Costodiaphragmatic recessus", "Diaphragmophrenic recessus", "Kardiyofrenik recessus", "C",
             "Kostodiafragmatik resesus, plevral boşluğun en büyük resesusu olup 200-300 mL sıvı bu alanda birikinceye kadar radyografide belirgin opasiteye yol açmaz.",
             "Orta")
        );

        // =========================================================
        // İÇ ORGANLAR — ABDOMEN ANATOMİSİ
        // =========================================================
        AddKQ(
            "Apendiks McBurney noktasına (SIAS ile göbek arasının dış 1/3'ü) yansıyan ağrıyla ilişkilidir.",
            "Anatomi", 95, "Çok Yüksek", "Abdomen Anatomisi",
            ("McBurney noktası anatomik olarak nerede yer alır?",
             "Ksifoid ile göbek arasının orta noktası", "Sağ SIAS ile göbek arasının dış 1/3'ü", "Sağ SIAS ile göbek arasının iç 1/3'ü", "Sol SIAS ile göbek arasının dış 1/3'ü", "Göbeğin 3 cm solunda", "B",
             "McBurney noktası, sağ spina iliaka anterior superioru (SIAS) ile göbek arasını üçe böldüğümüzde dıştan 1/3'lük yerde yer alır ve apandiks'in giriş açıklığına karşılık gelir.",
             "Kolay")
        );

        AddKQ(
            "Pankreas retroperitoneal bir organdır; başı duodenum, kuyruğu dalak hilusu ile komşudur.",
            "Anatomi", 92, "Çok Yüksek", "Abdomen Anatomisi",
            ("Pankreasın başı hangi yapının içine gömülüdür?",
             "Jejunumun C şekli ve ilişkili anatomik komşuluklar ile çevre dokular", "Duodenumun C şekli", "Dalak hilumu", "Karaciğer sol lobu", "Mide fundus", "B",
             "Pankreas başı, duodenumun 'C' şeklindeki çerçevesine oturur (C-loop). Pankreas başı kanseri bu nedenle sarılığa (ortak safra kanalını sıkıştırarak) yol açabilir.",
             "Kolay"),
            ("Pankreas aşağıdaki özelliklerin hangisi nedeniyle retroperitoneal kabul edilir?",
             "Tüm yüzeyleri peritona sahip olduğundan ve ilişkili anatomik komşuluklar ile çevre dokular", "Yalnızca ön yüzü peritona sahip olduğundan", "Hiç periton kaplı değildir", "Yalnızca posterior yüzü peritonla kaplıdır", "Bir mezosu olduğundan", "B",
             "Pankreas, embriyolojik dönemde intraperitoneal iken mesenterini kaybederek sekonder retroperitoneal hale gelir. Bu nedenle yalnızca ön yüzü peritonla kaplıdır.",
             "Orta")
        );

        AddKQ(
            "Duodenum 4 kısma ayrılır; 2. kısmı (inen duodenum) Vater ampulasını barındırır.",
            "Anatomi", 90, "Yüksek", "Abdomen Anatomisi",
            ("Safra ve pankreas kanallarının birleşerek duodenuma açıldığı yapı (Vater ampulası) duodenumun hangi kısmında yer alır?",
             "Birinci kısım", "İkinci kısım", "Üçüncü kısım", "Dördüncü kısım", "Duodenojejunal bileşim", "B",
             "Major duodenal papilla (Vater papillası) inen duodenumun (2. kısım) medial duvarında yer alır; ampula of Vater hem ortak safra kanalı hem de ana pankreas kanalının birleşim noktasıdır.",
             "Kolay")
        );

        AddKQ(
            "Portal hipertansiyonda portosistemik anastomozlar aktive olur: özofagus varisleri (en klinik önemi olan), hemoroidler, kaput medusae.",
            "Anatomi", 97, "Çok Yüksek", "Abdomen Anatomisi",
            ("Portal hipertansiyonda en tehlikeli kanamaya yol açan portosistemik anastomoz hangisidir?",
             "Paraumblikal venlerle", "Rektum venleri", "Alt özofagus varisleri", "Retroperitoneal-renal venöz anastomozlar", "Splenik venöz anastomozlar", "C",
             "Alt özofagus varisleri, soldan gelen portal venin kısa gastrik ve sol gastrik ven aracılığıyla özofageal venlere anastomoz yapmasıyla oluşur. Varislerden kanama, sirozun en ölümcül komplikasyonlarından biridir.",
             "Orta")
        );

        // =========================================================
        // İÇ ORGANLAR — PELVİS VE PERİNE
        // =========================================================
        AddKQ(
            "Üreter, uterus ligamentinin altından geçer ('water under the bridge'); histerektomide üreter iatrojenik yaralanmaya uğrayabilir.",
            "Anatomi", 96, "Çok Yüksek", "Pelvis ve Perine",
            ("Kadın pelvisinde üreter ile hangi yapının çaprazlaşma ilişkisi 'water under the bridge' deyimiyle anlatılır?",
             "Ovarian ligament ve ilişkili anatomik komşuluklar ile çevre dokular", "Uterus rotundum ligamenti", "A. uterina — uterin arterin üreter üzerinden geçmesi", "Mesane boynu", "Sakrouterin bağ", "C",
             "'Water under the bridge': uterin arterin üstten, üreter ise altta geçer. Histerektomide üreter, uterin arteri bağlarken yanlışlıkla kesilebilir; bu nedenle üreter tespiti zorunludur.",
             "Kolay"),
            ("Kadın pelvisinde üreter nerede en riskli anatomik komşuluğa sahiptir?",
             "Böbrek hilumu çıkışında ve ilişkili anatomik komşuluklar ile çevre dokular", "Psoas kası üzerinde", "Uterin arterin çaprazlaştığı servikal düzeyde", "Mesane duvarına girişte", "Sakrum önünde", "C",
             "Uterin arterle çaprazlaşma noktası (servikste, üreter lateral forniks yakınında), histerektomi ve ligaman diseksiyonunda iatrojenik üreter yaralanmasının en sık gerçekleştiği alandır.",
             "Orta")
        );

        AddKQ(
            "Prostat bezi üretrayı çevreleyerek gerçek pelvis tabanında yer alır; periferik zon prostat kanserinin %70'inin kaynağıdır.",
            "Anatomi", 91, "Çok Yüksek", "Pelvis ve Perine",
            ("Prostat kanserinin en sık hangi zondan kaynaklandığı bilinmektedir?",
             "Sentral zon", "Periferik zon", "Transizyonel zon", "Anterior fibromüsküler stroma", "Periüretral bez", "B",
             "Prostat kanserlerinin yaklaşık %70-80'i periferik zondan kaynaklanır; bu zon rektal tuşede palpe edilebilir. Transizyonel zon ise BPH'ın (benign prostat hiperplazisi) köken aldığı bölgedir.",
             "Kolay")
        );

        AddKQ(
            "Pelvis tipleri: jinekoid (%50 kadın, doğum için ideal), android (erkek tipi, dar), antropoid (oval), platipeloid (yassı).",
            "Anatomi", 88, "Yüksek", "Pelvis ve Perine",
            ("Obstetrik açıdan doğum için en elverişli pelvis tipi hangisidir?",
             "Android pelvis", "Platipeloid pelvis", "Antropoid pelvis", "Jinekoid pelvis", "Obstetrası olmayan kadında hepsi eşdeğer", "D",
             "Jinekoid pelvis, yuvarlak açıklığı ile fetüsün en kolay geçişine olanak tanıyan pelvis tipidir ve kadınlarda en sık görülür (%50). Android pelvis en dar olup sezaryen riskini artırır.",
             "Kolay")
        );

        // DB'ye ekle
        context.TusKnowledges.AddRange(knowledges);
        await context.SaveChangesAsync();

        context.TusQuestions.AddRange(questions);
        await context.SaveChangesAsync();

        Console.WriteLine($"[AnatomyClassicSeeder] {knowledges.Count} knowledge + {questions.Count} classic Anatomy questions seeded.");
    }
}
