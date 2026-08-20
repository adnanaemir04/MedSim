// Kapsamlı Tıbbi Vaka Üretim Motoru (Çok Aşamalı - Multi Stage)

export const deptsByYear: Record<number, string[]> = {
  1: ["Anatomi", "Tıbbi Biyoloji", "Histoloji"],
  2: ["Fizyoloji", "Mikrobiyoloji", "Biyokimya"],
  3: ["Farmakoloji", "Patoloji"],
  4: ["Dahiliye", "Genel Cerrahi", "Kadın Hastalıkları ve Doğum", "Pediatri"],
  5: ["Ortopedi", "Göz Hastalıkları", "KBB", "Psikiyatri", "Dermatoloji"],
  6: ["Acil Tıp", "Aile Hekimliği", "Yoğun Bakım"]
};

export const medCasesData: Record<string, any> = {
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
          { text: "Asetilkolin Reseptör Antikoru testi", isCorrect: true, feedback: "Doğru. Myastenia Gravis şüphesinde ilk istenmesi gereken antikor testidir." },
          { text: "İleri düzey Kas Biyopsisi analizi", isCorrect: false, feedback: "Hata: İlk aşamada çok invaziv ve spesifik olmayan bir yöntem." }
        ]
      },
      {
        text: "Test sonucu AChR antikoru pozitif geldi. Hastanın kas kasılmasını iyileştirmek için ne verirsiniz?",
        options: [
          { text: "Asetilkolinesteraz İnhibitörü ilacı", isCorrect: true, feedback: "Tebrikler. Kavşakta asetilkolin miktarını artırarak kasılmayı düzeltirsiniz." },
          { text: "Botulinum Toksini enjeksiyonu uygulaması", isCorrect: false, feedback: "Hata: Kas felcine yol açarak hastanın ölümüne sebep olabilirsiniz." }
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
          { text: "Ampirik Vankomisin tedavisi başlarım", isCorrect: true, feedback: "Doğru. MRSA (Metisiline Dirençli S. Aureus) ihtimaline karşı Vankomisin iyi bir başlangıçtır." },
          { text: "Sadece Parasetamol verip takip ederim", isCorrect: false, feedback: "Hata: Bakteriyemisi olan hasta sepsise gidebilir." }
        ]
      },
      {
        text: "Antibiyogram sonucu geldi. Bakteri metisiline duyarlı (MSSA) çıktı. Tedaviyi nasıl değiştirirsiniz?",
        options: [
          { text: "Sefazolin veya Nafsilin tedavisine geçerim", isCorrect: true, feedback: "Mükemmel. MSSA enfeksiyonlarında Vankomisine göre çok daha etkilidir." },
          { text: "Vankomisin tedavisine aynen devam ederim", isCorrect: false, feedback: "Kısmi Hata: Gerekli değildir, nefrotoksisite riski artar." }
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
          { text: "N-Asetilsistein infüzyonu tedavisi", isCorrect: true, feedback: "Doğru. Glutatyon depolarını yenileyerek karaciğeri korur." },
          { text: "Flumazenil infüzyonu tedavisi başlarım", isCorrect: false, feedback: "Hata: Flumazenil benzodiazepin antidotudur." }
        ]
      }
    ]
  },
  "Patoloji": {
    titles: ["Meme Biyopsisi: Kitle", "Gastrik Ülser İncelemesi"],
    tests: "Biyopsi Raporu: İnvaziv Duktal Karsinom. Desmoplastik stroma reaksiyonu (+).",
    stages: [
      {
        text: "Memedeki kitleden yapılan biyopside İnvaziv Duktal Karsinom saptandı. Tümörün reseptör durumunu bilmek neden önemlidir?",
        options: [
          { text: "Hedefe yönelik akıllı tedaviyi planlamak için", isCorrect: true, feedback: "Doğru. ER, PR ve HER2 durumuna göre tedavi belirlenir." },
          { text: "Sadece hastanın yaşını doğru tahmin etmek için", isCorrect: false, feedback: "Hata: Patolojide reseptörler tedaviyi belirler." }
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
        text: "Hasta bilinç bulanıklığı ve Kussmaul solunumu ile acile getirildi. Ağzında aseton kokusu var. İlk adımınız nedir?",
        options: [
          { text: "Hızlıca damardan sıvı tedavisi başlarım", isCorrect: true, feedback: "Çok doğru. DKA hastaları şiddetli dehidratedir, ilk iş sıvı vermektir." },
          { text: "Anında yüksek doz insülin tedavisi yaparım", isCorrect: false, feedback: "Hata: Yeterli sıvı vermeden insülin yaparsanız hasta hipovolemik şoka girer." }
        ]
      },
      {
        text: "Sıvı resüsitasyonu sonrası hastanın kan şekeri düşmeye başladı ancak Potasyum değeri 3.2 mEq/L'ye geriledi. Ne yaparsınız?",
        options: [
          { text: "İnsüline devam edip sıvıya potasyum eklerim", isCorrect: true, feedback: "Harika yönetim! İnsülin potasyumu hücre içine sokar, düşüşü engellemelisiniz." },
          { text: "İnsülin infüzyonunu tamamen durdururum", isCorrect: false, feedback: "Hata: İnsülini kapatırsanız ketoasidoz tablosu tekrar derinleşir." }
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
          { text: "Nemli oksijen desteği ve burun aspirasyonu yaparım", isCorrect: true, feedback: "Doğru. Bronşiolitte en önemli tedavi oksijenizasyon ve hidrasyondur." },
          { text: "Geniş spektrumlu damardan antibiyotik tedavisi başlarım", isCorrect: false, feedback: "Hata: Bronşiolit %90 viraldir (RSV), antibiyotik faydasızdır." }
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
          { text: "Cerrahi tedaviyle düzeltme planı yaparım", isCorrect: true, feedback: "Doğru. Yaşlı hastalarda deplase femur boyun kırığı cerrahi gerektirir." },
          { text: "Ağrı kesici verip evde alçı takibi öneririm", isCorrect: false, feedback: "Hata: Femur boynu alçıyla iyileşmez, hasta yatağa bağımlı kalıp emboliden ölür." }
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
          { text: "İntihar riskini sorgulayıp yatış kararı alırım", isCorrect: true, feedback: "Kritik Karar! Suisidal düşüncesi olan hasta acil psikiyatrik müdahale gerektirir." },
          { text: "Hastayı tatile çıkması için taburcu ederim", isCorrect: false, feedback: "Hata: Depresyon tıbbi bir hastalıktır, tavsiye ile geçmez." }
        ]
      },
      {
        text: "Hasta güvende. İlaç tedavisi başlanacak. Hangi grup ilacı ilk seçenek olarak düşünürsünüz?",
        options: [
          { text: "Seçici serotonin geri alım inhibitörü başlarım", isCorrect: true, feedback: "Doğru. Yan etki profili düşük ve etkilidir (Örn: Sertralin, Essitalopram)." },
          { text: "Eski nesil yüksek doz antipsikotik tedavisi başlarım", isCorrect: false, feedback: "Hata: Psikozu olmayan hastaya gereksiz yan etki yüklemiş olursunuz." }
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
          { text: "Eksizyonel biyopsi ile lezyonu çıkarıp gönderirim", isCorrect: true, feedback: "Doğru. Melanom şüphesinde lezyon bütünüyle çıkarılıp incelenmelidir." },
          { text: "Nemlendirici krem verip evine gönderir takip ederim", isCorrect: false, feedback: "Hata: Malign Melanom çok agresif bir kanserdir, hasta kaybedilebilir." }
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
        text: "60 yaşında göğsünde baskı hisseden hasta terleyerek acile girdi. EKG'de Anteriyor STEMI gördünüz. İlk yapılması gereken medikal müdahale?",
        options: [
          { text: "Aspirin, nitrat ve oksijen tedavisi başlarım", isCorrect: true, feedback: "Çok doğru! MONA-B (Morfin, Oksijen, Nitrat, Aspirin) yaklaşımı." },
          { text: "Sırtına masaj yapıp ağrı kesici reçete ederim", isCorrect: false, feedback: "Ölümcül Hata: NSAID'ler kriz anında kontrendikedir." }
        ]
      },
      {
        text: "Acil medikal tedaviyi başlattınız. Hastanın tıkanan kalp damarını açmak için kesin tedavisi nedir?",
        options: [
          { text: "Acil koroner anjiyografi laboratuvarına almak", isCorrect: true, feedback: "Harika! Altın standart tedavi, tıkalı damarı stent ile açmaktır." },
          { text: "Kardiyoloji servisine yatırıp kontrol planlarım", isCorrect: false, feedback: "Hata: Dakikalar içinde kalp kası ölür (Time is muscle)." }
        ]
      }
    ]
  }
};

function generateRandomCase(yearParam: string | number | null = null, deptParam: string | null = null) {
  const departmentsByYear = deptsByYear;

  let year = yearParam;
  if (!year) {
    const years = Object.keys(departmentsByYear);
    year = years[Math.floor(Math.random() * years.length)];
  }

  let department = deptParam;
  if (!department) {
    const depts = departmentsByYear[year as keyof typeof departmentsByYear];
    department = depts[Math.floor(Math.random() * depts.length)];
  }
  
  // Fallback to "Dahiliye" if data doesn't exist yet
  const deptData = medCasesData[department as keyof typeof medCasesData] || medCasesData["Dahiliye"];

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
    year: Number(year),
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
