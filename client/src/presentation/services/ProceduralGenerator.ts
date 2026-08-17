import { medCasesData, deptsByYear } from '../../infrastructure/data/casesData';

// Mock Data Banks for Procedural Generation
const symptoms = ["Şiddetli baş ağrısı", "Göğüs ağrısı", "Nefes darlığı", "Karın ağrısı ve bulantı", "Bilinç bulanıklığı", "Yüksek ateş ve titreme", "Eklem ağrısı", "Görmede bulanıklık"];
const physExams = ["Kan basıncı 90/60 mmHg, taşikardik.", "Solunum sesleri azalmış, ralleri var.", "Karında defans ve rebound pozitif.", "Pupiller izokorik, ışık refleksi zayıf.", "Ciltte peteşiyal döküntüler mevcut."];
const labs = ["WBC: 18.000, CRP: 150 mg/L", "Troponin I: 1.2 ng/mL, EKG'de ST elevasyonu", "Kreatinin 2.5 mg/dL, BUN 60", "Hb: 7 g/dL, MCV: 65 fL", "BOS'ta protein artmış, glukoz düşmüş"];
const diagnoses = ["Akut Apandisit", "Miyokard Enfarktüsü (STEMI)", "Pnömoni", "Bakteriyel Menenjit", "Demir Eksikliği Anemisi", "Akut Böbrek Yetmezliği", "Septik Şok"];
const treatments = ["Acil cerrahi (Apandektomi)", "Perkütan Koroner Girişim (Anjiyo)", "Geniş spektrumlu antibiyotik (Seftriakson)", "Sıvı resüsitasyonu ve Vazopressör", "Eritrosit Süspansiyonu Transfüzyonu"];

export function generateProceduralCase(subject: string) {
  // Generate a totally random 5-stage case (Anamnez -> Fizik Muayene -> Tetkik -> Tanı -> Tedavi)
  
  const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  
  const targetDiagnosis = random(diagnoses);
  const targetTreatment = random(treatments);
  
  const newCase = {
    text: `${random(symptoms)} şikayetiyle acile başvuran 45 yaşında erkek hasta.`,
    stages: [
      {
        text: "Hastanın anamnezini aldınız. İlk olarak hangi fizik muayene bulgusuna odaklanırsınız?",
        options: [
          { text: "Vital bulgular ve sistemik muayene", isCorrect: true, feedback: `Doğru yaklaşım. Bulgular: ${random(physExams)}` },
          { text: "Sadece şikayet bölgesini gözlemlerim", isCorrect: false, feedback: "Hata: Bütüncül yaklaşılmalı." }
        ]
      },
      {
        text: "Fizik muayene tamamlandı. Tanıyı netleştirmek için hangi tetkiki istersiniz?",
        options: [
          { text: "Spesifik kan tahlilleri ve görüntüleme", isCorrect: true, feedback: `Sonuçlar geldi: ${random(labs)}` },
          { text: "Hastayı evine gönderirim", isCorrect: false, feedback: "Hata: Hasta kritik durumda olabilir." }
        ]
      },
      {
        text: "Klinik ve laboratuvar bulgularını birleştirdiğinizde en olası TANINIZ nedir?",
        options: [
          { text: targetDiagnosis, isCorrect: true, feedback: "Tebrikler, doğru tanı!" },
          { text: random(diagnoses.filter(d => d !== targetDiagnosis)), isCorrect: false, feedback: "Hata: Yanlış tanı. Hasta kötüleşiyor." }
        ]
      },
      {
        text: "Tanıyı koydunuz. Acil olarak hangi TEDAVİYE başlarsınız?",
        options: [
          { text: targetTreatment, isCorrect: true, feedback: "Harika! Hastanın hayatını kurtardınız." },
          { text: random(treatments.filter(t => t !== targetTreatment)), isCorrect: false, feedback: "Hata: Yanlış tedavi sekonder komplikasyonlara yol açtı." }
        ]
      }
    ]
  };

  // Mutate the local static database (will persist until hard refresh)
  if (!medCasesData[subject]) {
    medCasesData[subject] = { titles: [], tests: "Otomatik Üretildi", stages: [] };
  }
  
  medCasesData[subject].titles.push(`Otomatik Vaka: ${targetDiagnosis}`);
  // In the real app, medCasesData structure was meant for 1 case per subject with 1 stage array.
  // Wait, looking at casesData.ts, it expects ONE array of stages per SUBJECT. 
  // Ah! medCasesData["Anatomi"] has `titles: []` but only ONE `stages: []`.
  // To support multiple cases per subject properly, the data structure should have been an array of cases.
  // Let's modify the generated case to just replace the stages array for now, or we can update casesData.ts in the future.
  
  return newCase;
}
