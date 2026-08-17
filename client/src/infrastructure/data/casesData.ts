export 
// Kapsamlı Tıbbi Vaka Üretim Motoru (Çok Aşamalı - Multi Stage)

const deptsByYear = {
  1: ["Anatomi", "Tıbbi Biyoloji", "Histoloji"],
  2: ["Fizyoloji", "Mikrobiyoloji", "Biyokimya"],
  3: ["Farmakoloji", "Patoloji"],
  4: ["Dahiliye", "Genel Cerrahi", "Kadın Hastalıkları ve Doğum", "Pediatri"],
  5: ["Ortopedi", "Göz Hastalıkları", "KBB", "Psikiyatri", "Dermatoloji"],
  6: ["Acil Tıp", "Aile Hekimliği", "Yoğun Bakım"]
};

const medCasesData = {
  // --- DÖNEM 1 ---
  "Anatomi": {
    titles: ["Kadavra Diseksiyonu: Boyun Üçgenleri", "Eklemler ve Hareket Açıklığı", "Kafa Çiftleri Lezyonu"],
    tests: "Kadavra İncelemesi: Faringeal pleksus varyasyonu gözlendi. Başka bir anormallik saptanmadı.",
    stages: [
      {
        text: "Kadavra diseksiyonunda boyun ön üçgeninde bir kitle/varyasyon saptadınız. İlk adımınız nedir?",
        options: [
          { text: "Karotis kılıfını açıp içeriği incelerim.", isCorrect: true, feedback: "Doğru yaklaşım. V. Jugularis interna, A. carotis communis ve N. vagus incelenmeli." },
          { text: "Kitleyi doğrudan eksize ederim.", isCorrect: false, feedback: "Hata: Önemli damar/sinir yapılarına zarar verebilirsiniz." }
        ]
      },
      {
        text: "Kılıfı açtığınızda N. Vagus'un seyri etrafında bir lenf nodu büyümesi gördünüz. Hangi lenf nodu grubu olabilir?",
        options: [
          { text: "Derin servikal lenf nodları", isCorrect: true, feedback: "Tebrikler. Jugulodigastrik nodlar da buradadır." },
          { text: "Submental lenf nodları", isCorrect: false, feedback: "Hata: Submental nodlar çene altındadır, karotis kılıfında değil." }
        ]
      }
    ]
  },
  "Tıbbi Biyoloji": {
    titles: ["Hücre Döngüsü İnhibisyonu", "DNA Replikasyon Hatası"],
    tests: "Karyotip Analizi: 46, XX. Genetik Sekanslama: p53 geninde delesyon şüphesi.",
    stages: [
      {
        text: "İncelenen hücre kültüründe mitozun durmadığı ve p53 proteininin fonksiyon göstermediği fark edildi. Ne yaparsınız?",
        options: [
          { text: "Hücreleri apopitoza zorlayacak kaspaz aktivatörü eklerim.", isCorrect: true, feedback: "Doğru. Kanser hücresi modelini durdurmak için apopitoz yolağı uyarılmalıdır." },
          { text: "G1 evresini hızlandıran büyüme faktörleri eklerim.", isCorrect: false, feedback: "Hata: Zaten durmayan mitozu daha da hızlandırırsınız." }
        ]
      }
    ]
  },
  "Histoloji": {
    titles: ["Kemik İliği İncelemesi", "Epitel Hücre Analizi"],
    tests: "Işık Mikroskobu: Çok katlı yassı epitelde keratinizasyon artışı izlendi.",
    stages: [
      {
        text: "Preparatta stratifiye skuamöz epitel izliyorsunuz. Ancak normalde keratinleşmemesi gereken bir bölgede keratin var. Bu nedir?",
        options: [
          { text: "Skuamöz Metaplazi", isCorrect: true, feedback: "Doğru. Sigara veya kronik irritasyon sonucu epitel değişimi olabilir." },
          { text: "Basit Atrofi", isCorrect: false, feedback: "Hata: Atrofide hücre küçülür, tip değiştirip keratin üretmez." }
        ]
      }
    ]
  },

  // --- DÖNEM 2 ---
  "Fizyoloji": {
    titles: ["Efor Testi: Oksijen Borçlanması", "Nöromüsküler Kavşak Bloğu"],
    tests: "EMG (Elektromiyografi): Uyarılmış potansiyellerde ilerleyici amplitüd düşüklüğü izlendi.",
    stages: [
      {
        text: "Hasta efor sırasında aşırı yorgunluk ve kas güçsüzlüğü yaşıyor. Egzersiz sonrasında gücü geri geliyor. Nöromüsküler kavşak hastalığı şüphesi var. Hangi test istenmeli?",
        options: [
          { text: "Asetilkolin Reseptör Antikoru (AChR-Ab) testi", isCorrect: true, feedback: "Doğru. Myastenia Gravis şüphesinde ilk istenmesi gereken antikor testidir." },
          { text: "Kas Biyopsisi", isCorrect: false, feedback: "Hata: İlk aşamada çok invaziv ve spesifik olmayan bir yöntem." }
        ]
      },
      {
        text: "Test sonucu AChR antikoru pozitif geldi. Hastanın kas kasılmasını iyileştirmek için ne verirsiniz?",
        options: [
          { text: "Asetilkolinesteraz İnhibitörü (Neostigmin)", isCorrect: true, feedback: "Tebrikler. Kavşakta asetilkolin miktarını artırarak kasılmayı düzeltirsiniz." },
          { text: "Botulinum Toksini", isCorrect: false, feedback: "Hata: Kas felcine yol açarak hastanın ölümüne sebep olabilirsiniz." }
        ]
      }
    ]
  },
  "Mikrobiyoloji": {
    titles: ["Kültür: Gram Pozitif Kok", "Viral Viral Yük Analizi"],
    tests: "Gram Boyama: Üzüm salkımı şeklinde Gram (+) koklar. Katalaz: Pozitif, Koagülaz: Pozitif.",
    stages: [
      {
        text: "Hastanın kan kültüründe Stafilokokus Aureus üredi. Hastanın ateşi var. İlk antibiyotik tercihiniz nedir?",
        options: [
          { text: "Ampirik Vankomisin başlarım", isCorrect: true, feedback: "Doğru. MRSA (Metisiline Dirençli S. Aureus) ihtimaline karşı Vankomisin iyi bir başlangıçtır." },
          { text: "Sadece Parasetamol verir izlerim", isCorrect: false, feedback: "Hata: Bakteriyemisi olan hasta sepsise gidebilir." }
        ]
      },
      {
        text: "Antibiyogram sonucu geldi. Bakteri metisiline duyarlı (MSSA) çıktı. Tedaviyi nasıl değiştirirsiniz?",
        options: [
          { text: "Sefazolin veya Nafsilin'e geçerim", isCorrect: true, feedback: "Mükemmel. MSSA enfeksiyonlarında Vankomisine göre çok daha etkilidir." },
          { text: "Vankomisin'e aynen devam ederim", isCorrect: false, feedback: "Kısmi Hata: Gerekli değildir, nefrotoksisite riski artar." }
        ]
      }
    ]
  },

  // --- DÖNEM 3 ---
  "Farmakoloji": {
    titles: ["İlaç Zehirlenmesi: Parasetamol", "Digoksin Toksisitesi"],
    tests: "Kan Düzeyi: Parasetamol seviyesi hepatotoksik sınırın çok üstünde. ALT/AST yükselmeye başlamış.",
    stages: [
      {
        text: "Özkıyım amaçlı yüksek doz parasetamol alan hasta acile geldi. Spesifik antidotu nedir?",
        options: [
          { text: "N-Asetilsistein (NAC) infüzyonu", isCorrect: true, feedback: "Doğru. Glutatyon depolarını yenileyerek karaciğeri korur." },
          { text: "Flumazenil", isCorrect: false, feedback: "Hata: Flumazenil benzodiazepin antidotudur." }
        ]
      }
    ]
  },
  "Patoloji": {
    titles: ["Meme Biyopsisi: Kitle", "Gastrik Ülser İncelemesi"],
    tests: "Biyopsi Raporu: İnvaziv Duktal Karsinom. Desmoplastik stroma reaksiyonu (+).",
    stages: [
      {
        text: "Memedeki kitleden yapılan biyopside İnvaziv Duktal Karsinom (Meme Kanseri) saptandı. Tümörün reseptör durumunu bilmek neden önemlidir?",
        options: [
          { text: "Hedefe yönelik (Hormon/Akıllı ilaç) tedaviyi planlamak için.", isCorrect: true, feedback: "Doğru. ER, PR ve HER2 durumuna göre tedavi belirlenir." },
          { text: "Sadece hastanın yaşını tahmin etmek için.", isCorrect: false, feedback: "Hata: Patolojide reseptörler tedaviyi belirler." }
        ]
      }
    ]
  },

  // --- DÖNEM 4 ---
  "Dahiliye": {
    titles: ["Diyabetik Ketoasidoz (DKA)", "Akut Böbrek Hasarı", "Hipertiroidi Krizi"],
    tests: "Kan Gazı: pH 7.15, HCO3 10. Biyokimya: Kan şekeri 450 mg/dL. İdrar: Keton (+++).",
    stages: [
      {
        text: "Hasta bilinç bulanıklığı ve Kussmaul (derin/hızlı) solunumu ile acile getirildi. Ağzında aseton kokusu var. İlk adımınız nedir?",
        options: [
          { text: "Hızlıca İV Serum Fizyolojik (Sıvı) başlarım.", isCorrect: true, feedback: "Çok doğru. DKA hastaları şiddetli dehidratedir, ilk iş sıvı vermektir." },
          { text: "Anında yüksek doz İnsülin yaparım.", isCorrect: false, feedback: "Hata: Yeterli sıvı vermeden insülin yaparsanız hasta hipovolemik şoka girer." }
        ]
      },
      {
        text: "Sıvı resüsitasyonu sonrası hastanın kan şekeri düşmeye başladı ancak Potasyum (K) değeri 3.2 mEq/L'ye geriledi. Ne yaparsınız?",
        options: [
          { text: "İnsüline devam ederken sıvıya Potasyum (KCL) eklerim.", isCorrect: true, feedback: "Harika yönetim! İnsülin potasyumu hücre içine sokar, düşüşü engellemelisiniz." },
          { text: "İnsülini tamamen kapatırım.", isCorrect: false, feedback: "Hata: İnsülini kapatırsanız ketoasidoz tablosu tekrar derinleşir." }
        ]
      }
    ]
  },
  "Pediatri": {
    titles: ["Akut Bronşiolit", "Rotavirüs İshali", "Febril Konvülziyon"],
    tests: "Bulgular: Burun kanadı solunumu (+), dinlemekle yaygın wheezing (hışıltı). Ateş 38.5.",
    stages: [
      {
        text: "6 aylık bebek, öksürük ve hırıltılı solunum ile getirildi. Beslenmesi bozulmuş, SpO2 %89. Solunum sıkıntısı var. İlk müdahale?",
        options: [
          { text: "Nemlendirilmiş Oksijen desteği başlarım ve burun aspirasyonu yaparım.", isCorrect: true, feedback: "Doğru. Bronşiolitte en önemli tedavi oksijenizasyon ve hidrasyondur." },
          { text: "Damardan geniş spektrumlu antibiyotik başlarım.", isCorrect: false, feedback: "Hata: Bronşiolit %90 viraldir (RSV), antibiyotik faydasızdır." }
        ]
      }
    ]
  },

  // --- DÖNEM 5 ---
  "Ortopedi": {
    titles: ["Femur Boyun Kırığı", "Aşil Tendon Rüptürü", "Açık Kırık Yönetimi"],
    tests: "Röntgen (X-Ray): Femur boynunda deplase kırık hattı izlendi. Alt ekstremitede kısalık ve dışa rotasyon mevcut.",
    stages: [
      {
        text: "75 yaşındaki hasta düşme sonrası kalça ağrısıyla geldi. Röntgen femur boyun kırığını doğruladı. Ne önerirsiniz?",
        options: [
          { text: "Ameliyat planlarım (Hemiartroplasti veya Vida).", isCorrect: true, feedback: "Doğru. Yaşlı hastalarda deplase femur boyun kırığı cerrahi gerektirir." },
          { text: "Ağrı kesici verip eve gönderir, alçı yaparım.", isCorrect: false, feedback: "Hata: Femur boynu alçıyla iyileşmez, hasta yatağa bağımlı kalıp emboliden ölür." }
        ]
      }
    ]
  },
  "Psikiyatri": {
    titles: ["Majör Depresif Bozukluk", "Akut Psikoz Atağı", "Bipolar Mizaç Bozukluğu"],
    tests: "Ruhsal Durum Muayenesi (MSE): Duygudurum çökkün, affekt kısıtlı. Psikotik bulgu (hezeyan) saptanmadı. Suisidal (intihar) düşünceler mevcut.",
    stages: [
      {
        text: "Hasta son 1 aydır hayattan zevk alamadığını, uyuyamadığını ve ölmek istediğini söylüyor. İlk adımınız nedir?",
        options: [
          { text: "İntihar riskini detaylı sorgular ve hastaneye yatış/yakın gözetim kararı alırım.", isCorrect: true, feedback: "Kritik Karar! Suisidal düşüncesi olan hasta acil psikiyatrik müdahale gerektirir." },
          { text: "Tatile çıkmasını tavsiye ederim.", isCorrect: false, feedback: "Hata: Depresyon tıbbi bir hastalıktır, tavsiye ile geçmez." }
        ]
      },
      {
        text: "Hasta güvende. İlaç tedavisi başlanacak. Hangi grup ilacı ilk seçenek olarak düşünürsünüz?",
        options: [
          { text: "SSRI (Seçici Serotonin Gerialım İnhibitörü)", isCorrect: true, feedback: "Doğru. Yan etki profili düşük ve etkilidir (Örn: Sertralin, Essitalopram)." },
          { text: "Eski nesil yüksek doz Antipsikotikler", isCorrect: false, feedback: "Hata: Psikozu olmayan hastaya gereksiz yan etki yüklemiş olursunuz." }
        ]
      }
    ]
  },
  "Dermatoloji": {
    titles: ["Malign Melanom Şüphesi", "Atopik Dermatit", "Psoriazis (Sedef)"],
    tests: "Dermatoskopi: Asimetrik, sınırları düzensiz, birden fazla renk barındıran pigmentli lezyon (Çap: 8mm).",
    stages: [
      {
        text: "Hastanın sırtında giderek büyüyen ve rengi koyulaşan asimetrik bir ben var. Dermatoskopi melanom şüphesi uyandırdı. Yaklaşımınız?",
        options: [
          { text: "Lezyonu tamamen çıkararak (Eksizyonel Biyopsi) patolojiye gönderirim.", isCorrect: true, feedback: "Doğru. Melanom şüphesinde lezyon bütünüyle çıkarılıp incelenmelidir." },
          { text: "Krem verip 6 ay sonra kontrole çağırırım.", isCorrect: false, feedback: "Hata: Malign Melanom çok agresif bir kanserdir, hasta kaybedilebilir." }
        ]
      }
    ]
  },

  // --- DÖNEM 6 ---
  "Acil Tıp": {
    titles: ["Akut Myokard Enfarktüsü (Kalp Krizi)", "Gastrointestinal Kanama", "Anafilaksi Şoku"],
    tests: "EKG: V1-V4 derivasyonlarında belirgin ST segment elevasyonu. Troponin: Yükseliyor.",
    stages: [
      {
        text: "60 yaşında göğsünde baskı hisseden hasta terleyerek acile girdi. EKG'de Anteriyor STEMI (Kalp Krizi) gördünüz. İlk yapılması gereken medikal müdahale?",
        options: [
          { text: "Aspirin çiğnetir, Nitrat ve oksijen (gerekirse) veririm.", isCorrect: true, feedback: "Çok doğru! MONA-B (Morfin, Oksijen, Nitrat, Aspirin) yaklaşımı." },
          { text: "Sırtına masaj yaptırıp ağrı kesici (İbuprofen) veririm.", isCorrect: false, feedback: "Ölümcül Hata: NSAID'ler kriz anında kontrendikedir." }
        ]
      },
      {
        text: "Acil medikal tedaviyi başlattınız. Hastanın tıkanan kalp damarını açmak için kesin (definitive) tedavisi nedir?",
        options: [
          { text: "Acil Koroner Anjiyografi (Primer PCI) laboratuvarına almak.", isCorrect: true, feedback: "Harika! Altın standart tedavi, tıkalı damarı stent ile açmaktır." },
          { text: "Yatış verip 1 ay sonrasına poliklinik randevusu vermek.", isCorrect: false, feedback: "Hata: Dakikalar içinde kalp kası ölür (Time is muscle)." }
        ]
      }
    ]
  }
};

function generateRandomCase(yearParam, deptParam) {
  const departmentsByYear = deptsByYear;

  let year = yearParam;
  if (!year) {
    const years = Object.keys(departmentsByYear);
    year = years[Math.floor(Math.random() * years.length)];
  }

  let department = deptParam;
  if (!department) {
    const depts = departmentsByYear[year];
    department = depts[Math.floor(Math.random() * depts.length)];
  }
  
  // Fallback to "Dahiliye" if data doesn't exist yet
  const deptData = medCasesData[department] || medCasesData["Dahiliye"];

  const names = ["Ahmet", "Ayşe", "Mehmet", "Fatma", "Ali", "Zeynep", "Hasan", "Elif"];
  const lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Kılıç"];
  const name = names[Math.floor(Math.random() * names.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const isMale = ["Ahmet", "Mehmet", "Ali", "Hasan"].includes(name);
  const age = 15 + Math.floor(Math.random() * 65);

  const title = deptData.titles[Math.floor(Math.random() * deptData.titles.length)];
  const newId = Date.now() + Math.floor(Math.random() * 1000);

  // Generate Vitals
  let isEmergency = (department === "Acil Tıp" || department === "Kardiyoloji" || department === "Genel Cerrahi");
  let sysBP = 110 + Math.floor(Math.random() * 30);
  let diaBP = 70 + Math.floor(Math.random() * 20);
  let pulse = 60 + Math.floor(Math.random() * 30);
  let temp = 36.5 + (Math.random() * 0.8);
  let resp = 14 + Math.floor(Math.random() * 6);
  let spo2 = 96 + Math.floor(Math.random() * 4);

  if (isEmergency && Math.random() > 0.5) {
    sysBP += 40; diaBP += 20; pulse += 40;
  }

  // Generate Comorbidities
  const comorbiditiesList = ["Hipertansiyon (HT)", "Tip 2 Diyabet", "Koroner Arter Hastalığı", "Astım", "Bilinen ek hastalık yok"];
  let historyText = comorbiditiesList[Math.floor(Math.random() * comorbiditiesList.length)];

  // Patient Profile
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const occupations = ["Öğretmen", "Mühendis", "İşçi", "Memur", "Serbest Meslek", "Emekli", "Öğrenci", "Esnaf"];

  // Lab Tests
  let labName = `🔬 ${department} Tahlilleri`;
  let labResult = deptData.tests || "Rutin laboratuvar testleri normal sınırlar içinde.";

  // Dynamic Stages Deep Copy
  const stagesCopy = JSON.parse(JSON.stringify(deptData.stages));

  return {
    id: newId,
    title: title, 
    department: department,
    year: parseInt(year),
    patient: { 
      name: `${name} ${lastName}`, 
      age: age, 
      gender: isMale ? "Erkek" : "Kadın",
      bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      occupation: age > 60 ? "Emekli" : (age < 22 ? "Öğrenci" : occupations[Math.floor(Math.random() * occupations.length)]),
      height: `${150 + Math.floor(Math.random() * 40)} cm`,
      weight: `${50 + Math.floor(Math.random() * 50)} kg`
    },
    clinical: {
      vitals: {
        bp: `${sysBP}/${diaBP} mmHg`,
        pulse: `${pulse} /dk`,
        temp: `${temp.toFixed(1)} °C`,
        resp: `${resp} /dk`,
        spo2: `%${spo2}`
      },
      history: historyText,
      labTests: {
        name: labName,
        result: labResult
      }
    },
    description: `Klinik Vaka: ${age} yaşında, ${department} departmanına başvurdu.`,
    stages: stagesCopy
  };
}
