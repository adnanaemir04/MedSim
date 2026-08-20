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
          { text: "Karotis kılıfını açıp içeriği incelerim.", isCorrect: true, feedback: "Kesinlikle doğru yaklaşım. Boyun kitlelerinde karotis kılıfının içeriklerinin (V. Jugularis interna, A. carotis communis ve N. vagus) anatomik komşuluklarını detaylıca değerlendirmek cerrahi planlamanın temelidir. Vasküler veya sinirsel bir invazyon olup olmadığını saptamak morbiditeyi (örneğin ses kısıklığı, inme riskini) dramatik şekilde azaltır." },
          { text: "Kitleyi doğrudan eksize ederim.", isCorrect: false, feedback: "Bu majör bir cerrahi hatadır. Karotis kılıfı, V. jugularis interna, A. carotis communis ve N. vagus'u barındırır. Körlemesine yapılacak bir eksizyon veya yetersiz ekspojur, masif kanamaya veya N. vagus kesisine bağlı kalıcı vokal kord paralizisine yol açarak hastanın yaşam kalitesini ve hayatını tehlikeye atar." }
        ]
      },
      {
        text: "Kılıfı açtığınızda N. Vagus'un seyri etrafında bir lenf nodu büyümesi gördünüz. Hangi lenf nodu grubu olabilir?",
        options: [
          { text: "Derin servikal lenf nodları", isCorrect: true, feedback: "Harika bir anatomik analiz! Derin servikal lenf nodları, özellikle jugulodigastrik nodlar (Waldeyer halkasının ana drenaj istasyonu) N. vagus ve V. jugularis interna çevresinde seyreder. Bu nodların büyümesi, baş-boyun bölgesi malignitelerinin (örn: tonsil yassı hücreli karsinom) ilk metastaz duraklarından biridir." },
          { text: "Submental lenf nodları", isCorrect: false, feedback: "Yanlış anatomik lokasyon. Submental lenf nodları M. mylohyoideus üzerinde, çene altında (Level Ia) bulunur ve genellikle alt dudak, ağız tabanı ve dil ucunun drenajını sağlar. Karotis kılıfı boyunca uzanan yapılar derin servikal (Level II, III, IV) lenf nodlarıdır." }
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
          { text: "Hücreleri apopitoza zorlayacak kaspaz aktivatörü eklerim.", isCorrect: true, feedback: "Çok doğru. p53, 'genomun bekçisi' olarak bilinir ve DNA hasarı durumunda hücre döngüsünü G1'de durdurarak apopitozu tetikler. Fonksiyonel p53 eksikliğinde (örneğin mutasyona uğramış kanser hücrelerinde), dışarıdan kaspaz aktivatörleri (özellikle Kaspaz-8 veya Kaspaz-9) gibi pro-apoptotik sinyallerin kullanılması, hücresel ölümü başlatarak onkojenik proliferasyonu durdurmanın en etkili yoludur." },
          { text: "G1 evresini hızlandıran büyüme faktörleri eklerim.", isCorrect: false, feedback: "Klinik olarak çok tehlikeli bir karar. Kanser hücreleri halihazırda kontrolsüz proliferasyon (mitoz) halindedir. Ortama büyüme faktörleri (örneğin EGF, PDGF) eklemek, onkojenik sinyal yolaklarını (RAS/RAF/MEK/ERK veya PI3K/AKT/mTOR) daha da aktive ederek tümör büyümesini agresifleştirecektir." }
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
          { text: "Skuamöz Metaplazi", isCorrect: true, feedback: "Tebrikler, mükemmel patolojik yorum. Sigara dumanı gibi kronik irritanlar, solunum yollarındaki normal yalancı çok katlı silli epitelin, daha dayanıklı olan çok katlı yassı (skuamöz) epitele dönüşmesine neden olur. Buna 'skuamöz metaplazi' denir. Metaplazi reverzibldir ancak stimulus devam ederse displazi ve skuamöz hücreli karsinoma ilerleyebilir." },
          { text: "Basit Atrofi", isCorrect: false, feedback: "Yanlış hücresel adaptasyon mekanizması. Atrofi, hücresel organellerin yıkımı ve hücre boyutunun küçülmesidir (örneğin immobilizasyona bağlı kas atrofisi). Ortada epitelin bir fenotipten diğerine dönüşümü (keratinize olan çok katlı yassı epitele dönüşüm) varsa, bu durum atrofi değil 'metaplazi'dir." }
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
          { text: "Asetilkolin Reseptör Antikoru testi", isCorrect: true, feedback: "Kesinlikle doğru. Myastenia Gravis (MG), nöromüsküler kavşaktaki postsinaptik asetilkolin reseptörlerine karşı otoantikorların geliştiği otoimmün bir hastalıktır. Eforda artan yorgunluk klasik bulgusudur. Teşhiste ilk ve en spesifik adım Anti-AChR (Asetilkolin Reseptör Antikoru) ve Anti-MuSK antikorlarının bakılmasıdır." },
          { text: "İleri düzey Kas Biyopsisi analizi", isCorrect: false, feedback: "Hatalı bir ilk tercih. Kas biyopsisi oldukça invaziv, maliyetli ve genellikle miyopatilerin (örneğin Musküler Distrofiler veya Polimiyozit) teşhisinde kullanılır. Nöromüsküler kavşak hastalıklarında ilk tercih serolojik antikor testleri ve EMG'dir (ardışık sinir uyarımında dekrement yanıt)." }
        ]
      },
      {
        text: "Test sonucu AChR antikoru pozitif geldi. Hastanın kas kasılmasını iyileştirmek için ne verirsiniz?",
        options: [
          { text: "Asetilkolinesteraz İnhibitörü ilacı", isCorrect: true, feedback: "Mükemmel tedavi yaklaşımı. Asetilkolinesteraz inhibitörleri (Örn: Piridostigmin, Neostigmin), sinaptik aralıktaki asetilkolin yıkımını engelleyerek ACh konsantrasyonunu artırır. Bu sayede, otoantikorlar nedeniyle sayıları azalmış olan sağlam ACh reseptörlerine bağlanma olasılığı artar ve kas zayıflığı semptomları hızla geriler." },
          { text: "Botulinum Toksini enjeksiyonu uygulaması", isCorrect: false, feedback: "Ölümcül bir hata. Botulinum toksini, presinaptik uçtan asetilkolin salınımını geri dönüşümsüz olarak bloke eder (SNARE proteinlerini yıkarak). Myastenia Gravis'te zaten asetilkolin yetersizliği sendromu olduğundan, bu toksinin uygulanması mevcut güçsüzlüğü hızla solunum yetmezliğine ve ölüme götürür." }
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
          { text: "Ampirik Vankomisin tedavisi başlarım", isCorrect: true, feedback: "Doğru farmakolojik yaklaşım. Üzüm salkımı şeklinde Gram (+) koklar ve pozitif koagülaz testi kesin olarak Stafilokokus Aureus'u gösterir. Hastanede veya toplum kökenli ciddi enfeksiyonlarda ampirik tedavide her zaman MRSA (Metisiline Dirençli S. Aureus) ihtimali düşünülmeli ve Vankomisin veya Daptomisin gibi glikopeptit/lipopeptitler başlanmalıdır." },
          { text: "Sadece Parasetamol verip takip ederim", isCorrect: false, feedback: "Bu bir tıbbi ihmaldir (Malpraktis). Kan kültüründe Stafilokokus Aureus üremesi her zaman patojenik kabul edilir ve acil IV antibiyoterapi gerektirir. Sadece semptomatik tedaviyle hastayı izlemek, endokardit, osteomiyelit ve hızla gelişecek fatal septik şok tablosuna neden olur." }
        ]
      },
      {
        text: "Antibiyogram sonucu geldi. Bakteri metisiline duyarlı (MSSA) çıktı. Tedaviyi nasıl değiştirirsiniz?",
        options: [
          { text: "Sefazolin veya Nafsilin tedavisine geçerim", isCorrect: true, feedback: "Mükemmel bir de-eskalasyon örneği! Kan kültürü Metisiline Duyarlı S. Aureus (MSSA) geldiğinde, Vankomisin tedavisi kesilmeli ve Nafsilin, Oksasilin veya Sefazolin (1. kuşak sefalosporin) tedavisine geçilmelidir. Beta-laktamlar, MSSA için vankomisinden çok daha hızlı bakterisidal etki gösterir ve doku penetrasyonları daha iyidir." },
          { text: "Vankomisin tedavisine aynen devam ederim", isCorrect: false, feedback: "Gereksiz geniş spektrum kullanımı. Bakterinin metisiline duyarlı olduğu kanıtlandıktan sonra Vankomisin'e devam etmek, hem bakteriyel temizlenme (klirens) hızını yavaşlatır hem de hastayı nefrotoksisite, ototoksisite ve VRE (Vankomisine Dirençli Enterokok) gibi dirençli süperenfeksiyon risklerine maruz bırakır." }
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
          { text: "N-Asetilsistein infüzyonu tedavisi", isCorrect: true, feedback: "Hayat kurtaran bir müdahale. Parasetamol zehirlenmesinde toksik metabolit olan NAPQI karaciğerde birikerek hepatosit nekrozuna yol açar. N-Asetilsistein (NAC), karaciğerin glutatyon depolarını yenileyerek NAPQI'yi sülfatla konjuge edip zararsız hale getirir ve toksik hepatiti engeller." },
          { text: "Flumazenil infüzyonu tedavisi başlarım", isCorrect: false, feedback: "Yanlış antidot seçimi. Flumazenil, benzodiazepinlerin (Örn: Diazepam, Alprazolam) kompetitif antagonistidir ve sadece benzodiazepin zehirlenmelerinde kullanılır. Parasetamol zehirlenmesinde hiçbir etkisi olmadığı gibi, hastanın akut karaciğer yetmezliğine girmesine neden olursunuz." }
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
          { text: "Hedefe yönelik akıllı tedaviyi planlamak için", isCorrect: true, feedback: "Doğru onkolojik prensip. İnvaziv duktal karsinomda hormon reseptörlerinin (Östrojen ve Progesteron) ve HER2 gen amplifikasyonunun durumu tedavinin köşe taşıdır. ER/PR pozitifliğinde anti-östrojen ajanlar (Örn: Tamoksifen, Aromataz İnhibitörleri), HER2 pozitifliğinde ise monoklonal antikorlar (Örn: Trastuzumab) ile sağkalım ciddi oranda artar." },
          { text: "Sadece hastanın yaşını doğru tahmin etmek için", isCorrect: false, feedback: "Hatalı bir düşünce yapısı. Kanser yönetiminde moleküler patoloji, hastanın takvim yaşından çok daha önemlidir. Hastanın yaşı kemoterapi toleransını etkilese de, tümörün biyolojik karakteri (ER, PR, HER2) tüm tedavi şemasını, seçilecek ajanları ve prognozu belirleyen en kritik parametredir." }
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
          { text: "Hızlıca damardan sıvı tedavisi başlarım", isCorrect: true, feedback: "Mükemmel acil yaklaşımı. Diyabetik Ketoasidoz (DKA) patofizyolojisinde ozmotik diürez nedeniyle hastalar ciddi sıvı açığına sahiptir (ortalama 5-8 litre). Tedavide ilk ve en önemli adım agresif izotonik (%0.9 NaCl) sıvı replasmanıdır. Bu hem volüm şokunu engeller hem de böbrek perfüzyonunu artırarak keton atılımını hızlandırır." },
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
          { text: "Geniş spektrumlu damardan antibiyotik tedavisi başlarım", isCorrect: false, feedback: "Gereksiz antibiyotik kullanımı. Çocuklarda sık görülen bronşiolit vakalarının büyük çoğunluğu Respiratuar Sinsityal Virüs (RSV) kaynaklıdır. Bakteriyel enfeksiyon kanıtı (Pnömoni vs.) olmadan damardan antibiyotik vermek sadece dirençli mikroorganizma gelişimine ve potansiyel yan etkilere yol açar." }
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
          { text: "Cerrahi tedaviyle düzeltme planı yaparım", isCorrect: true, feedback: "Doğru ortopedik yaklaşım. Yaşlı hastalarda (özellikle osteoporotik kemiklerde) deplase femur boyun kırıklarında avasküler nekroz riski çok yüksektir. Tedavi altın standardı genellikle hemiartroplasti (yarım kalça protezi) veya total kalça protezidir. Erken mobilizasyon (hareket), fatal komplikasyonları önlemek için kritiktir." },
          { text: "Ağrı kesici verip evde alçı takibi öneririm", isCorrect: false, feedback: "Çok ciddi bir klinik yönetim hatası. Femur boynu kırıkları konservatif (alçı/yatak) istirahati ile tedavi edilmez. Hastayı yatağa bağlamak; Derin Ven Trombozu (DVT), Pulmoner Emboli (PE), dekübitüs ülserleri (yatak yaraları) ve ölümcül pnömonilerle sonuçlanan bir mortalite zincirini başlatır." }
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
          { text: "İntihar riskini sorgulayıp yatış kararı alırım", isCorrect: true, feedback: "Hayat kurtaran psikiyatrik karar. Majör depresif atakta en büyük mortalite riski intihardır. Hastanın aktif suisidal düşünceleri, planı veya eylemi varsa, hastanın kendi rızası dışında (istemsiz yatış) bile olsa kapalı bir psikiyatri servisine yatırılarak güvenliğinin sağlanması tıbbi ve yasal bir zorunluluktur." },
          { text: "Hastayı tatile çıkması için taburcu ederim", isCorrect: false, feedback: "Bu, çağ dışı ve tehlikeli bir yaklaşımdır. Majör Depresif Bozukluk (MDB), beynin nörotransmitter (Serotonin, Norepinefrin, Dopamin) dengesinin bozulduğu biyolojik bir hastalıktır. İntihar riski taşıyan bir hastayı sadece tavsiyelerle eve veya tatile göndermek, intihara teşvik etmek veya göz yummakla eşdeğer tıbbi bir hatadır." }
        ]
      },
      {
        text: "Hasta güvende. İlaç tedavisi başlanacak. Hangi grup ilacı ilk seçenek olarak düşünürsünüz?",
        options: [
          { text: "Seçici serotonin geri alım inhibitörü başlarım", isCorrect: true, feedback: "Doğru farmakolojik tercih. Seçici Serotonin Geri Alım İnhibitörleri (SSRI - örn: Sertralin, Essitalopram, Fluoksetin), trisiklik antidepresanlara (TCA) kıyasla kardiyotoksik, antikolinerjik ve antihistaminik yan etkileri çok daha düşük olduğu için depresyon tedavisinde birinci basamak ajanlardır." },
          { text: "Eski nesil yüksek doz antipsikotik tedavisi başlarım", isCorrect: false, feedback: "Hatalı bir ilaç tercihi. Antipsikotikler (özellikle 1. nesil tipik antipsikotikler; Haloperidol vb.), dopamin D2 reseptörlerini bloke ederek ekstrapiramidal yan etkiler (Parkinsonizm, distoni), tardiv diskinezi ve Nöroleptik Malign Sendrom gibi çok ağır riskler taşır. Psikotik bulgusu olmayan depresyonda endikasyon dışı ve zararlıdır." }
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
          { text: "Eksizyonel biyopsi ile lezyonu çıkarıp gönderirim", isCorrect: true, feedback: "Çok doğru onkolojik/cerrahi yaklaşım. Şüpheli pigmente lezyonlarda tanısal altın standart 'Total Eksizyonel Biyopsi'dir (1-2 mm sağlam sınır ile). İnsizyonel (parça alma) veya punch biyopsi, lezyonun kalınlığını (Breslow derinliğini) yanlış değerlendirmeye ve tümörün evrelenmesinde ölümcül hatalara yol açabilir." },
          { text: "Nemlendirici krem verip evine gönderir takip ederim", isCorrect: false, feedback: "Büyük bir malpraktis. Malign melanom, çok hızlı metastaz yapma potansiyeli olan (özellikle beyin, karaciğer, akciğer) ölümcül bir deri kanseridir. Dermatoskopik olarak şüpheli (Asimetri, Sınır düzensizliği, Renk değişkenliği, Çap >6mm) bir lezyonu tedavisiz bırakmak, hastanın kısa sürede yaygın metastazla kaybedilmesine neden olur." }
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
          { text: "Aspirin, nitrat ve oksijen tedavisi başlarım", isCorrect: true, feedback: "Mükemmel acil refleks. Akut Koroner Sendromda (özellikle STEMI) anında Aspirin (trombosit agregasyonunu engeller), Oksijen (iskemik doku perfüzyonunu artırır), Nitrat (vazodilatasyonla kalbin iş yükünü azaltır) ve Morfin (ağrı ve sempatik tonusu düşürür) verilmesi standart hayat kurtarıcı ilk protokoldür." },
          { text: "Sırtına masaj yapıp ağrı kesici reçete ederim", isCorrect: false, feedback: "Ölümcül hata! Akut myokard enfarktüsünde Aspirin dışındaki tüm non-steroid anti-inflamatuar ilaçlar (NSAİİ'ler - Örn: İbuprofen, Diklofenak) miyokardiyal rüptür (kalp yırtılması) riskini artırdığı, iyileşme dokusunu bozduğu ve pro-trombotik etkileri olabileceği için KESİNLİKLE kontrendikedir." }
        ]
      },
      {
        text: "Acil medikal tedaviyi başlattınız. Hastanın tıkanan kalp damarını açmak için kesin tedavisi nedir?",
        options: [
          { text: "Acil koroner anjiyografi laboratuvarına almak", isCorrect: true, feedback: "Kesinlikle doğru karar! STEMI'de (ST elevasyonlu miyokard enfarktüsü) asıl hedef reperfüzyondur. Altın standart, ilk 90 dakika içinde Primer Perkütan Koroner Girişim (PCI / Anjiyo ve Stent) yaparak tıkalı koroner arteri mekanik olarak açmaktır. Eğer PCI imkanı yoksa trombolitik (pıhtı eritici) tedavi ilk 30 dakikada verilmelidir." },
          { text: "Kardiyoloji servisine yatırıp kontrol planlarım", isCorrect: false, feedback: "Hastanın hayatını riske attınız. 'Time is Muscle' (Zaman Kastır) prensibi gereği, miyokard enfarktüsünde geçen her dakika geri dönüşümsüz kas nekrozuna (ölümüne), kalp yetmezliğine ve fatal aritmilere yol açar. Damarı açmadan sadece yatırmak, modern tıpta kabul edilemez bir eksik tedavidir." }
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
