let medCases = [
  {
    id: 1,
    title: "Nefes Darlığı ve Göğüs Ağrısı",
    department: "Kardiyoloji",
    year: 6,
    patient: { name: "Ahmet Yılmaz", age: 65, gender: "Erkek" },
    description: "Ani başlayan nefes darlığı ve göğüs ağrısı şikayeti.",
    stages: [
      {
        stageId: 1,
        text: "Hasta acil servise terlemiş ve soluk bir şekilde getirildi. Göğsünde baskı tarzında bir ağrı olduğunu ve sol koluna yayıldığını belirtiyor. İlk olarak ne yaparsınız?",
        options: [
          {
            text: "Hemen EKG çekerim ve vital bulgularına bakarım.",
            isCorrect: true,
            feedback: "Doğru. Akut Koroner Sendrom şüphesi olan her hastada ilk 10 dakika içinde EKG çekilmeli ve değerlendirilmelidir.",
            nextStage: 2
          },
          {
            text: "Ağrı kesici (NSAID) verip gözlem odasına alırım.",
            isCorrect: false,
            feedback: "Yanlış. Göğüs ağrısı ile gelen hastada kardiyak nedenler dışlanmadan ağrı kesici verilmesi tanıyı geciktirir."
          }
        ]
      },
      {
        stageId: 2,
        text: "EKG sonucunda V1-V4 derivasyonlarında ST elevasyonu tespit ettiniz. Hastanın tansiyonu 140/90 mmHg, nabzı 95/dk. Ne tedavisi başlarsınız?",
        options: [
          {
            text: "Sadece Oksijen verip beklerim.",
            isCorrect: false,
            feedback: "Yanlış. Hastada Akut Anteroseptal MI mevcut. Zaman kas demektir."
          },
          {
            text: "Aspirin 300mg çiğnetir, P2Y12 inhibitörü yükler ve acil koroner anjiyografi (primer PCI) için hazırlık yaparım.",
            isCorrect: true,
            feedback: "Harika! STEMI tedavisinde ikili antiplatelet tedavi ve acil reperfüzyon (PCI) altın standarttır.",
            nextStage: 3
          }
        ]
      },
      {
        stageId: 3,
        text: "Hasta başarıyla anjiyografiye alındı ve LAD (Sol Ön İnen Arter) %100 tıkalı bulunarak stent takıldı. Hastanın şikayetleri geriledi. Vaka başarıyla tamamlandı!",
        options: [
          {
            text: "Vakayı Bitir",
            isCorrect: true,
            feedback: "Tebrikler, bu vakayı başarıyla yönettiniz.",
            nextStage: null
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Karın Ağrısı ve Ateş",
    department: "Genel Cerrahi",
    year: 4,
    patient: { name: "Ayşe K.", age: 22, gender: "Kadın" },
    description: "Sağ alt kadranda şiddetli karın ağrısı.",
    stages: [
      {
        stageId: 1,
        text: "Hastanın ağrısı göbek çevresinde başlamış, sonra sağ alt kadrana yerleşmiş. Bulantısı var ama kusmamış. Ateşi 37.8°C. İlk olarak ne yaparsınız?",
        options: [
          {
            text: "McBurney noktasında hassasiyet ve rebound ararım.",
            isCorrect: true,
            feedback: "Doğru. Klasik akut apandisit tablosunda fizik muayene temeldir.",
            nextStage: 2
          },
          {
            text: "Sadece bağırsak seslerini dinlerim.",
            isCorrect: false,
            feedback: "Yanlış. Lokalize peritonit bulgularını değerlendirmek elzemdir."
          }
        ]
      },
      {
        stageId: 2,
        text: "Muayenede McBurney'de belirgin hassasiyet saptadınız. Genç doğurgan çağda kadın hasta. Hangi görüntülemeyi istersiniz?",
        options: [
          {
            text: "Batın USG",
            isCorrect: true,
            feedback: "Doğru. Genç kadında radyasyon riskinden kaçınmak için ilk tercih USG olmalıdır.",
            nextStage: 3
          },
          {
            text: "Direkt Batın Tomografisi (BT)",
            isCorrect: false,
            feedback: "Yanlış. BT altın standart olsa da genç kadında ilk seçenek USG'dir."
          }
        ]
      },
      {
        stageId: 3,
        text: "USG sonucunda akut apandisit tablosu doğrulandı. Hasta apendektomiye alındı.",
        options: [
          {
            text: "Vakayı Bitir",
            isCorrect: true,
            feedback: "Tebrikler.",
            nextStage: null
          }
        ]
      }
    ]
  }
];

// Generator Data
const firstNamesM = ["Ali", "Kemal", "Hasan", "Mert", "Burak", "Emre", "Berk", "Can", "Kaan", "Ozan"];
const firstNamesF = ["Ayşe", "Fatma", "Zeynep", "Elif", "Merve", "Aslı", "Selin", "Gizem", "Büşra", "Ece"];
const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Arslan", "Doğan", "Kılıç"];

const deptsByYear = {
  1: ["Anatomi", "Tıbbi Biyoloji", "Biyokimya"],
  2: ["Fizyoloji", "Mikrobiyoloji", "Histoloji"],
  3: ["Patoloji", "Farmakoloji", "Klinik Beceriler"],
  4: ["Dahiliye", "Genel Cerrahi", "Pediatri", "Kadın Doğum"],
  5: ["Ortopedi", "Psikiyatri", "KBB", "Göz", "Nöroloji"],
  6: ["Acil Tıp", "Aile Hekimliği", "Kardiyoloji"]
};

// Department Specific Actions and Templates
const deptData = {
  "Kardiyoloji": {
    titles: ["Göğüs Ağrısı Değerlendirmesi", "Çarpıntı ve Nefes Darlığı", "Senkop (Bayılma) Atağı"],
    actions: ["Vital bulgulara bak", "12 derivasyonlu EKG çek", "Kardiyak enzim (Troponin) iste", "Ekokardiyografi yap", "Kalp Sintigrafisi (Miyokard perfüzyon) planla", "Efor Testi yap"],
    correctPaths: [
      {
        stage: "Hasta polikliniğe eforla gelen göğüs ağrısı şikayetiyle başvurdu. Stabil angina şüphesi var.",
        correct: "Efor Testi yap",
        wrong: "Doğrudan Kalp Sintigrafisi (Miyokard perfüzyon) planla",
        feedbackCorrect: "Doğru. Stabil hastada ilk non-invaziv test Efor Testi'dir.",
        feedbackWrong: "Yanlış. Sintigrafi daha pahalı ve radyasyon içerir, ilk seçenek efor testidir."
      },
      {
        stage: "Acil servise çarpıntı ile gelen hastanın nabzı 160/dk. Tansiyon stabil.",
        correct: "12 derivasyonlu EKG çek",
        wrong: "Ekokardiyografi yap",
        feedbackCorrect: "Doğru. Aritmi tanısında EKG altın standarttır.",
        feedbackWrong: "Yanlış. Akut aritmide öncelik elektriksel aktiviteyi (EKG) görmektir."
      }
    ]
  },
  "Dahiliye": {
    titles: ["Halsizlik ve Kilo Kaybı", "Karın Ağrısı ve Sarılık", "Ateş Odak Araştırması"],
    actions: ["Hemogram (Tam kan sayımı) iste", "Geniş Biyokimya (KC ve Böbrek fonksiyon) iste", "Batın USG yap", "Periferik yayma incele", "Tiroid Fonksiyon Testleri iste"],
    correctPaths: [
      {
        stage: "Hasta son 3 ayda 10 kilo kaybetmiş, halsizlik ve çarpıntı şikayeti mevcut. Boynunda şişlik var.",
        correct: "Tiroid Fonksiyon Testleri iste",
        wrong: "Batın USG yap",
        feedbackCorrect: "Doğru. Hipertiroidi şüphesi nedeniyle TSH, sT3, sT4 bakılmalıdır.",
        feedbackWrong: "Yanlış. Karın içi bir patoloji düşünmeden önce tiroid dışlanmalıdır."
      }
    ]
  },
  "Anatomi": {
    titles: ["Eklem ve Kas Değerlendirmesi", "Sinir Sıkışması Sendromu"],
    actions: ["Kadavra diseksiyonu yap", "Kemik yapı analizi yap", "Kranial sinir trasesini incele", "Fasya planlarını ayır"],
    correctPaths: [
      {
        stage: "Karpal tünel sendromunda hangi yapının sıkıştığını öğrenmek istiyorsunuz.",
        correct: "Kadavra diseksiyonu yap",
        wrong: "Kranial sinir trasesini incele",
        feedbackCorrect: "Doğru. Karpal tünelde Nervus Medianus trasesi kolda diseksiyonla daha iyi kavranır.",
        feedbackWrong: "Yanlış. Karpal tünel üst ekstremite ile ilgilidir, kranial sinirlerle değil."
      }
    ]
  },
  "Acil Tıp": {
    titles: ["Travma Yönetimi", "Şuur Bulanıklığı", "Nefes Darlığı Krizi"],
    actions: ["Birincil Bakı (ABC) değerlendir", "Acil Travma USG (FAST) yap", "Arter Kan Gazı (AKG) al", "Entübasyon hazırla", "Boyunluk tak ve immobilizasyon sağla"],
    correctPaths: [
      {
        stage: "Trafik kazası sonrası getirilen hastanın bilinci kapalı, solunumu yüzeyel.",
        correct: "Birincil Bakı (ABC) değerlendir",
        wrong: "Acil Travma USG (FAST) yap",
        feedbackCorrect: "Doğru. Her travmada ilk adım Havayolu, Solunum ve Dolaşım (ABC) kontrolüdür.",
        feedbackWrong: "Yanlış. ABC güvenliği sağlanmadan görüntüleme veya FAST USG yapılamaz."
      }
    ]
  },
  "Kadın Doğum": {
    titles: ["Gebelik Takibi", "Pelvik Ağrı"],
    actions: ["Fetal Monitörizasyon (NST) bağla", "Pelvik Ultrasonografi yap", "Vajinal muayene yap", "Beta-hCG iste"],
    correctPaths: [
      {
        stage: "35 haftalık gebe azalan bebek hareketleri şikayetiyle başvurdu.",
        correct: "Fetal Monitörizasyon (NST) bağla",
        wrong: "Vajinal muayene yap",
        feedbackCorrect: "Doğru. Fetal iyilik halini değerlendirmede ilk test NST'dir.",
        feedbackWrong: "Yanlış. Erken membran rüptürü veya kanama yokken gereksiz tuşe yapılmamalı, önce NST çekilmelidir."
      }
    ]
  },
  "default": {
    titles: ["Genel Değerlendirme Vaka Analizi", "Poliklinik Rutin Kontrol"],
    actions: ["Anamnez (Öykü) al", "Fizik muayene yap", "Laboratuvar tetkiki iste", "Görüntüleme iste"],
    correctPaths: [
      {
        stage: "Polikliniğe başvuran yeni hastada ilk yapmanız gereken nedir?",
        correct: "Anamnez (Öykü) al",
        wrong: "Görüntüleme iste",
        feedbackCorrect: "Doğru. Hastalıkların %70'i sadece iyi bir öykü ile teşhis edilebilir.",
        feedbackWrong: "Yanlış. Öykü ve muayene yapılmadan direkt görüntüleme istenmesi hatalı tıp pratiğidir."
      }
    ]
  }
};

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
  
  const newId = medCases.length > 0 ? Math.max(...medCases.map(c => c.id)) + 1 : 1;

  return {
    id: newId,
    title: title, // Removed [OTOMATİK]
    department: department,
    year: year,
    patient: { name: `${name} ${lastName}`, age: age, gender: isMale ? "Erkek" : "Kadın" },
    description: `Hastanın genel profili: ${age} yaşında, ${department} departmanına başvurdu.`,
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
            feedback: "Başarılı klinik yönetim.",
            nextStage: null
          }
        ]
      }
    ]
  };
}
