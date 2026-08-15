// MEDSIM - CLINICAL CASE DATABASE & GENERATOR

const firstNamesM = ["Ali", "Kemal", "Hasan", "Mert", "Burak", "Emre", "Berk", "Can", "Kaan", "Ozan", "Hüseyin", "Cem"];
const firstNamesF = ["Ayşe", "Fatma", "Zeynep", "Elif", "Merve", "Aslı", "Selin", "Gizem", "Büşra", "Ece", "Derya", "Cansu"];
const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Arslan", "Doğan", "Kılıç", "Özdemir", "Çetin"];

const deptsByYear = {
  1: ["Anatomi", "Tıbbi Biyoloji", "Biyokimya"],
  2: ["Fizyoloji", "Mikrobiyoloji", "Histoloji"],
  3: ["Patoloji", "Farmakoloji", "Klinik Beceriler"],
  4: ["Dahiliye", "Genel Cerrahi", "Pediatri", "Kadın Doğum"],
  5: ["Ortopedi", "Psikiyatri", "KBB", "Göz", "Nöroloji"],
  6: ["Acil Tıp", "Aile Hekimliği", "Kardiyoloji"]
};

// Massive Department Database
const deptData = {
  "Anatomi": {
    titles: ["Eklem ve Kas Değerlendirmesi", "Sinir Sıkışması Sendromu", "Kemik Kırığı Trasesi"],
    actions: ["Kadavra diseksiyonu yap", "Kemik yapı analizi yap", "Kranial sinir trasesini incele", "Fasya planlarını ayır"],
    correctPaths: [
      {
        stage: "Karpal tünel sendromunda hangi yapının sıkıştığını öğrenmek istiyorsunuz.",
        correct: "Kadavra diseksiyonu yap",
        wrong: "Kranial sinir trasesini incele",
        feedbackCorrect: "Doğru. Karpal tünelde Nervus Medianus trasesi kolda diseksiyonla daha iyi kavranır.",
        feedbackWrong: "Yanlış. Karpal tünel üst ekstremite ile ilgilidir, kranial sinirlerle değil."
      },
      {
        stage: "Humerus cisim kırığı olan hastada radial sinir hasarını değerlendirmek için anatomik komşulukları inceleyeceksiniz.",
        correct: "Kemik yapı analizi yap",
        wrong: "Fasya planlarını ayır",
        feedbackCorrect: "Doğru. Sulcus nervi radialis humerus üzerindedir, kemik komşuluğu kritiktir.",
        feedbackWrong: "Yanlış. Sinir doğrudan kemik oluğunda seyreder."
      }
    ]
  },
  "Tıbbi Biyoloji": {
    titles: ["Organel Disfonksiyonu", "Genetik Mutasyon Analizi"],
    actions: ["Mitokondriyal DNA analizi yap", "Hücre kültürü başlat", "Kromozom analizi (Karyotip) iste"],
    correctPaths: [
      {
        stage: "Hücrede aşırı yorgunluk ve laktik asit birikimi mevcut. Oksijenli solunum durmuş.",
        correct: "Mitokondriyal DNA analizi yap",
        wrong: "Hücre kültürü başlat",
        feedbackCorrect: "Doğru. Enerji metabolizması defektleri mitokondri kaynaklıdır.",
        feedbackWrong: "Yanlış. Sorun doğrudan enerji metabolizmasında, genel bir kültürden ziyade hedeflenmiş analiz gerekir."
      }
    ]
  },
  "Biyokimya": {
    titles: ["Enzim Eksikliği", "Metabolik Asidoz Paneli"],
    actions: ["Arter Kan Gazı (AKG) Analizi", "Kandaki Laktat Düzeyini Ölç", "Karaciğer Enzimlerini (AST/ALT) Değerlendir"],
    correctPaths: [
      {
        stage: "Aşırı alkol alımı sonrası başvuran hastada glukoneogenez inhibisyonu şüphesi var.",
        correct: "Kandaki Laktat Düzeyini Ölç",
        wrong: "Arter Kan Gazı (AKG) Analizi",
        feedbackCorrect: "Doğru. Alkol metabolizması NADH artışına ve pirüvatın laktata dönüşmesine sebep olur.",
        feedbackWrong: "Kısmen yanlış. AKG asidozu gösterir ancak laktat ölçümü spesifiktir."
      }
    ]
  },
  "Fizyoloji": {
    titles: ["Kardiyak Debi Hesaplaması", "Sinaps İletim Hızı"],
    actions: ["Frank-Starling Yasasını Değerlendir", "Aksiyon Potansiyelini Ölç", "Membran Dinlenim Potansiyelini Hesapla"],
    correctPaths: [
      {
        stage: "Kalbe venöz dönüşün (Preload) artmasının atım hacmine etkisini gözlemliyorsunuz.",
        correct: "Frank-Starling Yasasını Değerlendir",
        wrong: "Membran Dinlenim Potansiyelini Hesapla",
        feedbackCorrect: "Doğru. Kalp kası lifleri ne kadar gerilirse kasılma o kadar güçlü olur (Frank-Starling).",
        feedbackWrong: "Yanlış. Elektrofizyolojik ölçüm mekanik gerilimi doğrudan açıklamaz."
      }
    ]
  },
  "Mikrobiyoloji": {
    titles: ["Gram Boyama Analizi", "Kültür Antibiogram", "Viral Yük Testi"],
    actions: ["Gram Boyama Yap", "Kan Kültürü Al", "PCR (Polimeraz Zincir Reaksiyonu) İste"],
    correctPaths: [
      {
        stage: "Hastada ense sertliği, ateş ve fotofobi var. BOS (Beyin Omurilik Sıvısı) örneği alındı.",
        correct: "Gram Boyama Yap",
        wrong: "Kan Kültürü Al",
        feedbackCorrect: "Doğru. Akut bakteriyel menenjitte BOS'un hızlı Gram boyaması hayat kurtarıcıdır.",
        feedbackWrong: "Yanlış. Kan kültürü de alınmalıdır ancak BOS doğrudan enfeksiyon alanıdır, hızlı sonuç için boyama önceliklidir."
      }
    ]
  },
  "Histoloji": {
    titles: ["Doku Mikroskobisi", "Epitel Hücre Analizi"],
    actions: ["H&E (Hematoksilen & Eozin) Boyama Yap", "Işık Mikroskobu ile İncele", "Elektron Mikroskobu İste"],
    correctPaths: [
      {
        stage: "Mide mukozasından alınan biyopside paryetal hücrelerin asit salgılayan yapılarını inceleyeceksiniz.",
        correct: "H&E (Hematoksilen & Eozin) Boyama Yap",
        wrong: "Elektron Mikroskobu İste",
        feedbackCorrect: "Doğru. Rutin histolojik incelemelerde H&E boyama standarttır.",
        feedbackWrong: "Yanlış. Elektron mikroskobu çok spesifik ultrastrüktürler için kullanılır, ilk tercih değildir."
      }
    ]
  },
  "Patoloji": {
    titles: ["Malignite Şüphesi (Biyopsi)", "Enflamatuar Yanıt Analizi"],
    actions: ["İmmünohistokimya (IHK) İste", "Frozen Section (Hızlı Kesit) Çalış", "Makroskobik İnceleme Yap"],
    correctPaths: [
      {
        stage: "Ameliyat sırasında cerrah lenf nodunda tümör metastazı olup olmadığını acil olarak bilmek istiyor.",
        correct: "Frozen Section (Hızlı Kesit) Çalış",
        wrong: "İmmünohistokimya (IHK) İste",
        feedbackCorrect: "Doğru. Operasyon esnasında dakikalar içinde sonuç veren yöntem 'frozen' kesittir.",
        feedbackWrong: "Yanlış. İHK günlerce sürer, acil ameliyat sırasında kullanılamaz."
      }
    ]
  },
  "Farmakoloji": {
    titles: ["İlaç Etkileşimi", "Doz Optimizasyonu", "Toksisite Yönetimi"],
    actions: ["Sitokrom P450 Enzim Profiline Bak", "Yarı Ömür (T1/2) Hesapla", "Antidot Uygula"],
    correctPaths: [
      {
        stage: "Parasetamol zehirlenmesi ile gelen hastada karaciğer yetmezliği riski var.",
        correct: "Antidot Uygula",
        wrong: "Yarı Ömür (T1/2) Hesapla",
        feedbackCorrect: "Doğru. N-Asetil Sistein (NAC) parasetamolün spesifik antidotudur.",
        feedbackWrong: "Yanlış. Akut zehirlenmede farmakokinetik hesaplamalarla vakit kaybedilemez."
      }
    ]
  },
  "Dahiliye": {
    titles: ["Halsizlik ve Kilo Kaybı", "Karın Ağrısı ve Sarılık", "Diyabetik Ketoasidoz"],
    actions: ["Geniş Biyokimya ve Hemogram", "Tiroid Fonksiyon Testleri iste", "HbA1c ve Kan Şekeri Ölç", "Batın USG İste"],
    correctPaths: [
      {
        stage: "Hasta son 3 ayda 10 kilo kaybetmiş, çarpıntı ve sıcağa tahammülsüzlük şikayeti var.",
        correct: "Tiroid Fonksiyon Testleri iste",
        wrong: "Batın USG İste",
        feedbackCorrect: "Doğru. Hipertiroidi şüphesi nedeniyle TSH, sT3, sT4 bakılmalıdır.",
        feedbackWrong: "Yanlış. Karın içi patolojiden çok endokrinolojik bir sorun düşündürüyor."
      },
      {
        stage: "Hasta derin soluk alıp veriyor (Kussmaul), nefesinde aseton kokusu var. Bilinci uykuya meyilli.",
        correct: "HbA1c ve Kan Şekeri Ölç",
        wrong: "Geniş Biyokimya ve Hemogram",
        feedbackCorrect: "Doğru. Diyabetik Ketoasidoz (DKA) tanısı için hızlı kan şekeri ölçümü ve kan gazı şarttır.",
        feedbackWrong: "Kısmen yanlış. Biyokimya istenir ancak öncelikli spesifik şüphe DKA'dır."
      }
    ]
  },
  "Genel Cerrahi": {
    titles: ["Akut Karın (Apandisit)", "Kolesistit Şüphesi", "Gastrointestinal Kanama"],
    actions: ["Fizik Muayene (Rebound/Defans)", "Batın USG İste", "Nazogastrik Sonda Tak", "Acil Laparotomi Kararı Al"],
    correctPaths: [
      {
        stage: "Sağ üst kadranda ağrı, ateş ve bulantı. Murphy bulgusu pozitif.",
        correct: "Batın USG İste",
        wrong: "Acil Laparotomi Kararı Al",
        feedbackCorrect: "Doğru. Akut kolesistit tanısında ilk görüntüleme USG'dir.",
        feedbackWrong: "Yanlış. Tanı kesinleşmeden ve tıbbi tedavi denenmeden direkt açık cerrahi yapılmaz."
      }
    ]
  },
  "Pediatri": {
    titles: ["Büyüme Gelişme Geriliği", "Döküntülü Hastalık", "Solunum Sıkıntısı (Bronşiolit)"],
    actions: ["Persentil Eğrilerini Değerlendir", "Aşılama Öyküsünü Sorgula", "Nebülize Bronkodilatör Ver", "Kan Kültürü İste"],
    correctPaths: [
      {
        stage: "6 aylık bebek hırıltılı solunum ve burun akıntısı ile getirildi. Dinlemekle yaygın ronküs mevcut.",
        correct: "Nebülize Bronkodilatör Ver",
        wrong: "Kan Kültürü İste",
        feedbackCorrect: "Doğru. Akut bronşiolit / viral enfeksiyon tablosunda solunum desteği esastır.",
        feedbackWrong: "Yanlış. Ateşsiz, tipik viral solunum yolu enfeksiyonunda rutin kan kültürü alınmaz."
      }
    ]
  },
  "Kadın Doğum": {
    titles: ["Gebelik Takibi (NST)", "Postpartum Kanama", "Ektopik Gebelik"],
    actions: ["Fetal Monitörizasyon (NST) bağla", "Beta-hCG Kantitatif İste", "Transvajinal USG (TVUSG) Yap", "Oksitosin İnfüzyonu Başla"],
    correctPaths: [
      {
        stage: "6 haftalık gebe sağ kasıkta şiddetli ağrı ve lekelenme ile başvurdu. Tansiyonu 90/60.",
        correct: "Transvajinal USG (TVUSG) Yap",
        wrong: "Fetal Monitörizasyon (NST) bağla",
        feedbackCorrect: "Doğru. Dış gebelik (Ektopik) rüptürünü dışlamak için acil TVUSG gerekir.",
        feedbackWrong: "Yanlış. NST 3. trimesterde (28. hafta sonrası) uygulanır."
      }
    ]
  },
  "Ortopedi": {
    titles: ["Açık Kırık Yönetimi", "Osteoartrit (Kireçlenme)"],
    actions: ["Direkt Röntgen (X-Ray) Çek", "Tetanoz Aşısı ve Antibiyotik Yap", "Eklem İçi Enjeksiyon Uygula"],
    correctPaths: [
      {
        stage: "Motosiklet kazası sonrası tibia kemiği ciltten dışarı çıkmış şekilde acile getirildi.",
        correct: "Tetanoz Aşısı ve Antibiyotik Yap",
        wrong: "Direkt Röntgen (X-Ray) Çek",
        feedbackCorrect: "Doğru. Açık kırıklar yüksek enfeksiyon riski taşır, görüntülemeden bile önce profilaksi başlanmalıdır.",
        feedbackWrong: "Yanlış. Röntgen istenir ancak açık kırıkta ilk ve en acil müdahale antibiyoterapi ve yara örtülmesidir."
      }
    ]
  },
  "Nöroloji": {
    titles: ["İskemik İnme (Felç)", "Epilepsi Nöbeti", "Multipl Skleroz Atak"],
    actions: ["Kontrastsız Beyin BT İste", "EEG (Elektroensefalografi) Çek", "Lomber Ponksiyon (BOS) Yap", "Trombolitik Tedavi (tPA) Ver"],
    correctPaths: [
      {
        stage: "Hasta sağ kolda güç kaybı ve konuşma bozukluğu ile acile geldi. Şikayetler 1 saat önce başlamış.",
        correct: "Kontrastsız Beyin BT İste",
        wrong: "Trombolitik Tedavi (tPA) Ver",
        feedbackCorrect: "Doğru. Kanama (Hemorajik inme) dışlanmadan kan sulandırıcı (tPA) verilemez. İlk adım BT'dir.",
        feedbackWrong: "Yanlış. Kanamayı ekarte etmeden pıhtı eritici vermek hastayı öldürebilir."
      }
    ]
  },
  "Acil Tıp": {
    titles: ["Travma Resüsitasyonu", "Anafilaksi Şoku"],
    actions: ["Birincil Bakı (ABC) Değerlendir", "Adrenalin IM (Kas İçi) Uygula", "Acil Entübasyon Yap"],
    correctPaths: [
      {
        stage: "Arı sokması sonrası hastanın dudakları şişti, hırıltılı soluyor ve tansiyonu 70/40 mmHg.",
        correct: "Adrenalin IM (Kas İçi) Uygula",
        wrong: "Birincil Bakı (ABC) Değerlendir",
        feedbackCorrect: "Doğru. Anafilaktik şokta hayat kurtaran tek ilaç Adrenalin'dir (Epinefrin).",
        feedbackWrong: "Kısmen doğru ancak klinik anafilaksi çok bariz, vakit kaybetmeden adrenalin yapılmalıdır."
      }
    ]
  },
  "Kardiyoloji": {
    titles: ["Akut Koroner Sendrom", "Kalp Yetmezliği Alevlenmesi"],
    actions: ["12 Derivasyonlu EKG Çek", "Troponin I İste", "Ekokardiyografi Yap", "Diüretik (Furosemid) IV Yap"],
    correctPaths: [
      {
        stage: "Bacaklarda ciddi ödem ve sırt üstü yatınca nefes darlığı (ortopne) şikayetiyle gelen yaşlı hasta.",
        correct: "Diüretik (Furosemid) IV Yap",
        wrong: "12 Derivasyonlu EKG Çek",
        feedbackCorrect: "Doğru. Akut kalp yetmezliği / akciğer ödemi tablosunda ilk tedavi sıvı yükünü azaltmaktır.",
        feedbackWrong: "Yanlış. EKG çekilir ancak hastanın solunum sıkıntısı sıvı yüklenmesine bağlıdır, müdahale önceliklidir."
      }
    ]
  },
  "default": {
    titles: ["Genel Poliklinik Muayenesi", "Rutin Sağlık Taraması"],
    actions: ["Detaylı Anamnez (Öykü) Al", "Sistemik Fizik Muayene Yap", "Rutin Kan Tahlili İste", "Kontrole Çağır"],
    correctPaths: [
      {
        stage: "Belirsiz eklem ağrıları ve halsizlikle gelen hastada ilk adımınız nedir?",
        correct: "Detaylı Anamnez (Öykü) Al",
        wrong: "Rutin Kan Tahlili İste",
        feedbackCorrect: "Doğru. Hastalıkların teşhisinde en değerli araç iyi alınmış bir öyküdür.",
        feedbackWrong: "Yanlış. Ne aradığınızı bilmeden test istemek maliyetli ve kafa karıştırıcıdır."
      }
    ]
  }
};

// Global Empty Cases Array (Auth.js will fill it if needed, but it's generated dynamically now)
let medCases = [];

function generateRandomCase(targetYear = null, targetDept = null) {
  const isMale = Math.random() > 0.5;
  const name = isMale ? firstNamesM[Math.floor(Math.random() * firstNamesM.length)] : firstNamesF[Math.floor(Math.random() * firstNamesF.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const age = Math.floor(Math.random() * 70) + 10;
  
  const year = targetYear || (Math.floor(Math.random() * 6) + 1);
  const possibleDepts = deptsByYear[year];
  const department = targetDept || possibleDepts[Math.floor(Math.random() * possibleDepts.length)];

  // Get department specific data or fallback to default
  const deptSpecific = deptData[department] || deptData["default"];
  
  const title = deptSpecific.titles[Math.floor(Math.random() * deptSpecific.titles.length)];
  const path = deptSpecific.correctPaths[Math.floor(Math.random() * deptSpecific.correctPaths.length)];
  
  // Create a unique ID based on timestamp
  const newId = Date.now() + Math.floor(Math.random() * 1000);

  return {
    id: newId,
    title: title, 
    department: department,
    year: year,
    patient: { name: `${name} ${lastName}`, age: age, gender: isMale ? "Erkek" : "Kadın" },
    description: `Klinik Vaka: ${age} yaşında, ${department} departmanına başvurdu. Şikayetleri değerlendiriniz.`,
    stages: [
      {
        stageId: 1,
        text: path.stage,
        options: [
          {
            text: path.correct,
            isCorrect: true,
            feedback: path.feedbackCorrect,
            nextStage: 2
          },
          {
            text: path.wrong,
            isCorrect: false,
            feedback: path.feedbackWrong
          }
        ]
      },
      {
        stageId: 2,
        text: "Müdahaleniz sonrasında hastanın durumu stabil ve tedavisi planlandı. Vaka tamamlandı.",
        options: [
          {
            text: "Vakayı Bitir",
            isCorrect: true,
            feedback: "Başarılı klinik yönetim. Hastayı taburcu edebilirsiniz.",
            nextStage: null
          }
        ]
      }
    ]
  };
}
