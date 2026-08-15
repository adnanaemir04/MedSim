// DOM Elements
const viewDashboard = document.getElementById('view-dashboard');
const viewSimulation = document.getElementById('view-simulation');
const viewLeaderboard = document.getElementById('view-leaderboard');
const caseList = document.getElementById('case-list');
const dashboardTitle = document.getElementById('dashboard-title');
const dynamicSidebar = document.getElementById('dynamic-sidebar');
const leaderboardBody = document.getElementById('leaderboard-body');
const viewProfile = document.getElementById('view-profile');

// Profile DOM Elements
const profileNickname = document.getElementById('profile-nickname');
const profileEmail = document.getElementById('profile-email');
const profilePoints = document.getElementById('profile-points');
const profileCasesCount = document.getElementById('profile-cases-count');
const profileRank = document.getElementById('profile-rank');
const profileAvatarDisplay = document.getElementById('profile-avatar-display');
const avatarOptions = document.querySelectorAll('.avatar-option');
const btnLogoutProfile = document.getElementById('btn-logout-profile');
const btnResetAccount = document.getElementById('btn-reset-account');
const btnReportError = document.getElementById('btn-report-error');

// Clinical UI Elements
const btnShowVitals = document.getElementById('btn-show-vitals');
const btnShowHistory = document.getElementById('btn-show-history');
const revealedClinicalData = document.getElementById('revealed-clinical-data');

// Sidebar Elements
const navAll = document.getElementById('nav-all');
const navLeaderboard = document.getElementById('nav-leaderboard');

// Simulation DOM Elements
const simDepartment = document.getElementById('sim-department');
const simTitle = document.getElementById('sim-title');
const patName = document.getElementById('pat-name');
const patAge = document.getElementById('pat-age');
const patGender = document.getElementById('pat-gender');
const simText = document.getElementById('sim-text');
const simOptions = document.getElementById('sim-options');
const simFeedback = document.getElementById('sim-feedback');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackText = document.getElementById('feedback-text');
const btnNextStage = document.getElementById('btn-next-stage');
const btnFinishCase = document.getElementById('btn-finish-case');
const btnBack = document.getElementById('btn-back');
const feedbackPoints = document.getElementById('feedback-points');

// State
let currentCase = null;
let currentStage = null;
let currentFilterYear = 'all';
let currentFilterDept = 'all';
let pointsEarnedInCase = 0; // track points in current case

// Build Dynamic Sidebar
function buildSidebar() {
  const classIcons = {1: '🔬', 2: '🧬', 3: '🩺', 4: '🏥', 5: '💊', 6: '🚑'};
  
  let html = `
    <div class="accordion-header" id="acc-classes-header">
      <div class="acc-title-wrap">
        <span class="icon">📚</span> Sınıflar
      </div>
      <span class="caret">▼</span>
    </div>
    <div class="accordion-body hidden-acc" id="acc-classes-body">
  `;

  for (let year = 1; year <= 6; year++) {
    html += `
      <div class="nested-accordion">
        <div class="nested-header" data-year="${year}">
          <div class="acc-title-wrap">
            <span class="icon">${classIcons[year]}</span> ${year}. Sınıf
          </div>
          <span class="caret">▼</span>
        </div>
        <div class="nested-body hidden-acc" id="nested-body-${year}">
    `;
    
    if (deptsByYear[year]) {
      deptsByYear[year].forEach(dept => {
        html += `<div class="nav-item-sub" data-year="${year}" data-dept="${dept}">${dept}</div>`;
      });
    }

    html += `
        </div>
      </div>
    `;
  }

  html += `</div>`;
  dynamicSidebar.innerHTML = html;

  // Add Listeners
  const mainHeader = document.getElementById('acc-classes-header');
  const mainBody = document.getElementById('acc-classes-body');
  
  mainHeader.addEventListener('click', () => {
    mainBody.classList.toggle('hidden-acc');
    mainHeader.classList.toggle('expanded');
  });

  const nestedHeaders = document.querySelectorAll('.nested-header');
  nestedHeaders.forEach(header => {
    header.addEventListener('click', (e) => {
      const year = header.getAttribute('data-year');
      const body = document.getElementById(`nested-body-${year}`);
      
      document.querySelectorAll('.nested-body').forEach(b => {
        if(b !== body) b.classList.add('hidden-acc');
      });
      document.querySelectorAll('.nested-header').forEach(h => {
        if(h !== header) h.classList.remove('expanded');
      });

      const isOpening = !body.classList.contains('hidden-acc');
      if (!isOpening) {
        body.classList.remove('hidden-acc');
        header.classList.add('expanded');
      } else {
        body.classList.add('hidden-acc');
        header.classList.remove('expanded');
      }
    });
  });

  const subItems = document.querySelectorAll('.nav-item-sub');
  subItems.forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
      navAll.classList.remove('active');
      navLeaderboard.classList.remove('active');
      
      item.classList.add('active');
      
      currentFilterYear = item.getAttribute('data-year');
      currentFilterDept = item.getAttribute('data-dept');
      dashboardTitle.innerText = `${currentFilterDept} (${currentFilterYear}. Sınıf)`;

      goBackToDashboard();
    });
  });
}

// Navigation Event Listeners
if (navAll) {
  navAll.addEventListener('click', () => {
    document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
    navAll.classList.add('active');
    navLeaderboard.classList.remove('active');
    const navProfile = document.getElementById('nav-profile');
    if (navProfile) navProfile.classList.remove('active');
    
    currentFilterYear = 'all';
    currentFilterDept = 'all';
    dashboardTitle.innerText = 'Tüm Vakalarım';
    goBackToDashboard();
  });
}

if (navLeaderboard) {
  navLeaderboard.addEventListener('click', () => {
    document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
    navAll.classList.remove('active');
    navLeaderboard.classList.add('active');
    const navProfile = document.getElementById('nav-profile');
    if (navProfile) navProfile.classList.remove('active');
    
    showLeaderboard();
  });
}

const userProfileSidebar = document.querySelector('.user-profile-sidebar');
if (userProfileSidebar) {
  userProfileSidebar.addEventListener('click', showProfileView);
}

const fabArchiveBtn = document.getElementById('fab-archive-btn');
if (fabArchiveBtn) {
  fabArchiveBtn.addEventListener('click', showProfileView);
}

function showProfileView() {
  document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
  navAll.classList.remove('active');
  navLeaderboard.classList.remove('active');
  showProfile();
}

// Initialize Dashboard
function renderDashboard() {
  if (!currentUser) return;
  
  viewSimulation.classList.add('hidden');
  viewLeaderboard.classList.add('hidden');
  viewProfile.classList.add('hidden');
  viewDashboard.classList.remove('hidden');

  const caseList = document.getElementById('case-list');
  const btnHeaderGenerate = document.getElementById('btn-header-generate');
  
  if(!caseList) return;
  caseList.innerHTML = '';

  let filteredCases = currentUser.solvedCases || [];
  
  if (currentFilterYear !== 'all') {
    filteredCases = filteredCases.filter(c => c.year === parseInt(currentFilterYear));
  }
  if (currentFilterDept !== 'all') {
    filteredCases = filteredCases.filter(c => c.department === currentFilterDept);
  }

  // Dashboard Header Title
  if (currentFilterDept === 'all') {
    dashboardTitle.innerText = "Hastane Girişi (Tüm Departmanlar)";
  } else {
    dashboardTitle.innerText = `${currentFilterDept} (${currentFilterYear}. Sınıf)`;
  }

  // Header Generate Button Logic
  btnHeaderGenerate.style.display = 'inline-block';
  btnHeaderGenerate.style.width = 'auto';
  
  if (currentFilterDept === 'all') {
    btnHeaderGenerate.innerText = `➕ Yeni Rastgele Vaka Başlat`;
    btnHeaderGenerate.onclick = () => {
      if (typeof generateRandomCase === 'function') {
        let targetYear = (Math.floor(Math.random() * 6) + 1);
        let possibleDepts = deptsByYear[targetYear];
        let targetDept = possibleDepts[Math.floor(Math.random() * possibleDepts.length)];
        const newCase = generateRandomCase(targetYear, targetDept);
        addNewCase(newCase);
        renderDashboard(); // Re-render to show new case
      }
    };
  } else {
    btnHeaderGenerate.innerText = `➕ Yeni ${currentFilterDept} Vakası Başlat`;
    btnHeaderGenerate.onclick = () => {
      if (typeof generateRandomCase === 'function') {
        const newCase = generateRandomCase(currentFilterYear === 'all' ? null : parseInt(currentFilterYear), currentFilterDept);
        addNewCase(newCase);
        renderDashboard(); // Re-render to show new case
      }
    };
  }
  
  // Render Dashboard Cases
  if (filteredCases.length === 0) {
    caseList.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 3rem; text-align: center; border: 1px dashed #cbd5e1; grid-column: 1 / -1;">
        <h3 style="color: #334155; font-size: 1.25rem; margin-bottom: 0.5rem;">${dashboardTitle.innerText} Seçildi</h3>
        <p style="color: #64748b; font-size: 1rem;">Bu sayfada ${currentFilterDept === 'all' ? 'Tüm hastane bölümleri' : currentFilterDept} ile ilgili vaka bilgilerine ulaşabilirsiniz. Sağ üstteki butonu kullanarak yeni bir vakaya başlayabilirsiniz.</p>
      </div>
    `;
  } else {
    filteredCases.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card';
      const isSolved = c.isSolved;
      
      card.innerHTML = `
        <div>
          <h3>${c.title}</h3>
          <p style="margin-bottom: 0.5rem; font-size: 0.85rem;"><span class="badge">${c.department}</span> ${c.year}. Sınıf</p>
          ${isSolved ? '<p style="color: var(--success); font-weight: 600; font-size: 0.8rem;">✓ Çözüldü</p>' : '<p style="color: var(--primary); font-weight: 600; font-size: 0.8rem;">⌛ Devam Ediyor</p>'}
        </div>
        <div style="margin-top: 1rem;">
          <button class="btn-primary" style="width: 100%;" onclick="startCase('${c.id}')">${isSolved ? 'Tekrar İncele' : 'Vakaya Başla'}</button>
        </div>
      `;
      caseList.appendChild(card);
    });
  }


  // Build Profile Archive Grid
  const archiveGrid = document.getElementById('archive-grid');
  if (archiveGrid) {
    archiveGrid.innerHTML = '';
    const solvedCases = currentUser.solvedCases || [];
    if (solvedCases.length === 0) {
      archiveGrid.innerHTML = `<p style="color:#64748b; text-align:center; padding:2rem;">Henüz çözülmüş vakanız bulunmamaktadır.</p>`;
    } else {
      solvedCases.forEach(c => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.background = '#f8fafc';
        card.style.border = '1px solid #e2e8f0';
        card.innerHTML = `
          <div>
            <h3 style="color:#0f172a; margin-bottom:0.25rem; font-size:1.1rem;">${c.title}</h3>
            <p style="color:#64748b; font-size:0.8rem; margin-bottom:0.5rem;">
              <span class="badge" style="background:#e0f2fe; color:#0284c7;">${c.department}</span> ${c.year}. Sınıf
            </p>
          </div>
          <div style="margin-top:auto; padding-top:1rem; border-top:1px solid #e2e8f0;">
            <button class="btn-primary" style="width:100%; font-size:0.85rem; background:white; color:var(--primary); border:1px solid var(--primary);" onclick="startCase('${c.id}')">Dosyayı Tekrar İncele</button>
          </div>
        `;
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';
        archiveGrid.appendChild(card);
      });
    }
  }
}

function showLeaderboard() {
  viewDashboard.classList.add('hidden');
  viewSimulation.classList.add('hidden');
  viewProfile.classList.add('hidden');
  viewLeaderboard.classList.remove('hidden');

  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) return;
  leaderboardBody.innerHTML = '';
  
  const leaders = getLeaderboard();
  
  leaders.forEach((u, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row';
    if (u.email === currentUser.email) {
      row.classList.add('is-me');
    }

    let rankBadge = `#${i + 1}`;
    let rankClass = 'lb-rank';
    if (i === 0) { rankBadge = '🥇'; rankClass += ' gold'; }
    else if (i === 1) { rankBadge = '🥈'; rankClass += ' silver'; }
    else if (i === 2) { rankBadge = '🥉'; rankClass += ' bronze'; }

    const solvedCount = u.solvedCases ? u.solvedCases.length : 0;
    const avatar = u.avatar || '👨‍⚕️';
    const isMeTag = (u.email === currentUser.email) ? `<span style="background:var(--primary); color:white; font-size:0.7rem; padding:0.15rem 0.5rem; border-radius:50px; font-weight:normal;">Siz</span>` : '';

    row.innerHTML = `
      <div class="${rankClass}">${rankBadge}</div>
      <div class="lb-user-info">
        <div class="lb-avatar">${avatar}</div>
        <div>
          <div class="lb-name">${u.nickname} ${isMeTag}</div>
          <div class="lb-cases">Çözülen Vaka: <strong>${solvedCount}</strong></div>
        </div>
      </div>
      <div class="lb-score">${u.points} Puan</div>
    `;
    
    leaderboardBody.appendChild(row);
  });
}

function showProfile() {
  if (!currentUser) return;
  viewDashboard.classList.add('hidden');
  viewSimulation.classList.add('hidden');
  viewLeaderboard.classList.add('hidden');
  viewProfile.classList.remove('hidden');

  profileNickname.innerText = currentUser.nickname;
  profileEmail.innerText = currentUser.email;
  profilePoints.innerText = currentUser.points;
  profileCasesCount.innerText = currentUser.solvedCases ? currentUser.solvedCases.length : 0;
  
  if (currentUser.avatar) {
    profileAvatarDisplay.innerText = currentUser.avatar;
  } else {
    profileAvatarDisplay.innerText = "👨‍⚕️";
  }

  const leaders = getLeaderboard();
  const rankIndex = leaders.findIndex(u => u.email === currentUser.email);
  profileRank.innerText = rankIndex !== -1 ? `#${rankIndex + 1}` : '-';

  // Highlight active avatar in grid
  avatarOptions.forEach(opt => {
    opt.classList.remove('active');
    if (opt.getAttribute('data-avatar') === (currentUser.avatar || "👨‍⚕️")) {
      opt.classList.add('active');
    }
  });
}

// Avatar Logic
avatarOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    if (!currentUser) return;
    const selectedAvatar = opt.getAttribute('data-avatar');
    currentUser.avatar = selectedAvatar;
    saveUsers(); // Save to local storage
    showProfile(); // Re-render
    updateSidebarProfile(); // Update sidebar if you have an avatar there
  });
});

// Profile Actions
if (btnLogoutProfile) {
  btnLogoutProfile.addEventListener('click', logout);
}

if (btnResetAccount) {
  btnResetAccount.addEventListener('click', () => {
    if (confirm("Tüm ilerlemeniz silinecektir. Devam etmek istiyor musunuz?")) {
      currentUser.points = 0;
      currentUser.solvedCases = [];
      saveUsers();
      alert("Hesabınız sıfırlandı!");
      goBackToDashboard();
    }
  });
}

if (btnReportError) {
  btnReportError.addEventListener('click', () => {
    prompt("Lütfen vaka ile ilgili tespit ettiğiniz hatayı kısaca açıklayın (Bu rapor sisteme iletilecektir):");
    alert("Teşekkürler, hata raporunuz incelenmek üzere tarafımıza iletildi.");
  });
}


if(btnShowVitals) {
  btnShowVitals.onclick = () => {
    if (currentCase && currentCase.clinical && currentCase.clinical.vitals) {
      if (typeof playAudio === 'function') playAudio('monitor');
      
      // DYNAMIC SCORING
      if (typeof actionsTakenThisCase !== 'undefined') {
        if (!actionsTakenThisCase.includes('vitals')) {
          actionsTakenThisCase.push('vitals');
          const p = (actionsTakenThisCase.length === 1) ? 10 : 5;
          pointsEarnedInCase += p;
          showToast(`+${p} Puan (Vital Bulgular)`);
        }
      }

      const v = currentCase.clinical.vitals;
      const box = document.createElement('div');
      box.style.cssText = "background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b;";
      box.innerHTML = `
        <h4 style="margin-bottom: 0.5rem; color: #f59e0b;">Vital Bulgular</h4>
        <ul style="list-style: none; color: #475569; font-size: 0.95rem;">
          <li>🩸 Tansiyon: ${v.bp}</li>
          <li>💓 Nabız: ${v.hr} / dk</li>
          <li>🌡️ Ateş: ${v.temp} °C</li>
          <li>🫁 Solunum: ${v.rr} / dk</li>
          <li>💨 SpO2: ${v.spo2}</li>
        </ul>
      `;
      revealedClinicalData.appendChild(box);
      btnShowVitals.disabled = true;
      btnShowVitals.style.opacity = '0.5';
      btnShowVitals.style.cursor = 'not-allowed';
      btnShowVitals.innerText = `✓ Vital Bulgular İncelendi`;
    }
  };
}

if(btnShowHistory) {
  btnShowHistory.addEventListener('click', () => {
    if (!currentCase || !currentCase.clinical) return;
    
    // DYNAMIC SCORING
    if (typeof actionsTakenThisCase !== 'undefined') {
      if (!actionsTakenThisCase.includes('history')) {
        actionsTakenThisCase.push('history');
        const p = (actionsTakenThisCase.length === 1) ? 10 : 5;
        pointsEarnedInCase += p;
        showToast(`+${p} Puan (Özgeçmiş)`);
      }
    }
    
    const box = document.createElement('div');
    box.style.cssText = "background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid var(--primary);";
    box.innerHTML = `
      <h4 style="margin-bottom: 0.5rem; color: var(--primary);">Tıbbi Özgeçmiş</h4>
      <p style="color: #475569; margin:0; line-height: 1.5;">${currentCase.clinical.history}</p>
    `;
    revealedClinicalData.appendChild(box);
    
    btnShowHistory.disabled = true;
    btnShowHistory.style.opacity = '0.5';
    btnShowHistory.style.cursor = 'not-allowed';
    btnShowHistory.innerText = "✓ Özgeçmiş Sorgulandı";
  });
}

// Current Stage UI Elements
const simTimeline = document.getElementById('sim-timeline');
const simOptionsContainer = document.getElementById('sim-options-container');

function renderStage() {
  if (!currentStage) return;

  simFeedback.classList.remove('success', 'error');
  simFeedback.style.display = 'none';
  btnNextStage.classList.add('hidden');
  btnFinishCase.classList.add('hidden');
  feedbackPoints.classList.add('hidden');
  
  // Show options container
  if (simOptionsContainer) simOptionsContainer.style.display = 'block';

  // Append new stage text to timeline
  const stageBlock = document.createElement('div');
  stageBlock.style.cssText = "padding: 1rem; background: #f8fafc; border-radius: 8px; border-left: 4px solid #cbd5e1;";
  
  const stageNum = currentCase.stages.indexOf(currentStage) + 1;
  stageBlock.innerHTML = `<h5 style="color: #64748b; font-size: 0.8rem; margin-bottom: 0.5rem; text-transform: uppercase;">Aşama ${stageNum}</h5><p style="color: #334155; line-height: 1.6; margin: 0;">${currentStage.text}</p>`;
  
  if (simTimeline) {
    simTimeline.appendChild(stageBlock);
    // Scroll to bottom of timeline
    setTimeout(() => {
      stageBlock.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  }

  simOptions.innerHTML = '';

  currentStage.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.innerText = opt.text;
    const currentStageIndex = currentCase.stages.indexOf(currentStage);
    btn.onclick = () => {
            if (btn.disabled) return;
            
            if (opt.isCorrect) {
              btn.classList.add('btn-correct');
              btn.innerHTML += ' <span>✓</span>';
              if(typeof playAudio === 'function') playAudio('success'); // Play success sound
              pointsEarnedInCase += 15;
              showToast('+15 Puan (Doğru Karar)');
              
              if (currentStageIndex === currentCase.stages.length - 1) {
                // Finale
                const msg = document.createElement('div');
                msg.className = 'timeline-stage pulse-green';
                msg.style.cssText = "background: #dcfce7; color: #166534; margin-top: 1.5rem;";
                msg.innerHTML = `<h4>Tebrikler!</h4><p>Vakayı başarıyla tamamladınız ve hastayı iyileştirdiniz.</p>`;
                simTimeline.appendChild(msg);
                btnNextStage.classList.add('hidden');
                
                // Finish button
                btnFinishCase.classList.remove('hidden');
                btnFinishCase.onclick = () => {
                  finishAndScoreCase(currentCase.id, pointsEarnedInCase);
                  goBackToDashboard();
                };
              } else {
                btnNextStage.classList.remove('hidden');
              }
              
            } else {
              btn.classList.add('btn-wrong');
              btn.innerHTML += ' <span>✗</span>';
              if(typeof playAudio === 'function') playAudio('error'); // Play error sound
              pointsEarnedInCase -= 10;
              showToast('-10 Puan (Hatalı Karar)');
              
              const msg = document.createElement('div');
              msg.className = 'timeline-stage pulse-red';
              msg.style.cssText = "background: #fef2f2; color: #991b1b; margin-top: 1.5rem;";
              msg.innerHTML = `<h4>Hatalı Karar</h4><p>${opt.explanation || 'Bu seçenek hasta için uygun değildi.'}</p>`;
              simTimeline.appendChild(msg);

              // Early termination due to wrong answer
              btnFinishCase.classList.remove('hidden');
              btnFinishCase.onclick = () => {
                  finishAndScoreCase(currentCase.id, pointsEarnedInCase);
                  goBackToDashboard();
              };
            }
            
            // Disable other choices
            Array.from(simOptions.children).forEach(b => { b.disabled = true; });
          };
    simOptions.appendChild(btn);
  });
}

// UI Toast helper for dynamic points
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = "position: fixed; top: 20px; right: 20px; background: var(--success); color: white; padding: 1rem 1.5rem; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.1); z-index: 9999; animation: fadeInSlideUp 0.3s ease forwards;";
  if (msg.includes('-')) t.style.background = 'var(--danger)';
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

// Variables for Dynamic Scoring
let actionsTakenThisCase = [];

// Start Case
function startCase(caseId) {
  currentCase = currentUser.solvedCases.find(c => c.id === caseId);
  if (!currentCase) return;

  // Reset Scoring
  pointsEarnedInCase = 0;
  actionsTakenThisCase = [];
  currentStage = currentCase.stages[0];
  
  viewDashboard.classList.add('hidden');
  viewLeaderboard.classList.add('hidden');
  viewProfile.classList.add('hidden');
  viewSimulation.classList.remove('hidden');
  
  simDepartment.innerText = `${currentCase.department} (${currentCase.year}. Sınıf)`;
  simTitle.innerText = currentCase.title;
  patName.innerText = currentCase.patient.name;
  patAge.innerText = currentCase.patient.age;
  patGender.innerText = currentCase.patient.gender;

  const patBlood = document.getElementById('pat-blood');
  const patJob = document.getElementById('pat-job');
  const patHeight = document.getElementById('pat-height');
  const patWeight = document.getElementById('pat-weight');

  if (patBlood) patBlood.innerText = currentCase.patient.bloodType || "-";
  if (patJob) patJob.innerText = currentCase.patient.occupation || "-";
  if (patHeight) patHeight.innerText = currentCase.patient.height || "-";
  if (patWeight) patWeight.innerText = currentCase.patient.weight || "-";

  // Reset revealed data and buttons
  revealedClinicalData.innerHTML = '';
  if (simTimeline) simTimeline.innerHTML = '';
  if (simOptionsContainer) simOptionsContainer.style.display = 'block';
  
  if(btnShowVitals) {
    btnShowVitals.disabled = false;
    btnShowVitals.style.opacity = '1';
    btnShowVitals.style.cursor = 'pointer';
    btnShowVitals.innerText = "🩺 Vital Bulgulara Bak";
  }
  if(btnShowHistory) {
    btnShowHistory.disabled = false;
    btnShowHistory.style.opacity = '1';
    btnShowHistory.style.cursor = 'pointer';
    btnShowHistory.innerText = "📋 Özgeçmiş Sorgula";
  }
  
  // Dynamically add Lab Tests Button if exists
  const actionButtonsContainer = document.querySelector('.action-buttons');
  if (actionButtonsContainer) {
    // Remove old dynamic lab button if exists
    const oldLabBtn = document.getElementById('btn-show-labs');
    if (oldLabBtn) oldLabBtn.remove();
    
    if (currentCase.clinical && currentCase.clinical.labTests) {
      const labBtn = document.createElement('button');
      labBtn.className = 'btn-action-side';
      labBtn.id = 'btn-show-labs';
      labBtn.innerText = currentCase.clinical.labTests.name;
      
      labBtn.onclick = () => {
        const box = document.createElement('div');
        box.style.cssText = "background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #10b981;";
        box.innerHTML = `
          <h4 style="margin-bottom: 0.5rem; color: #10b981;">Tahlil ve Görüntüleme Sonuçları</h4>
          <p style="color: #475569; margin:0; line-height: 1.5;">${currentCase.clinical.labTests.result}</p>
        `;
        revealedClinicalData.appendChild(box);

        labBtn.disabled = true;
        labBtn.style.opacity = '0.5';
        labBtn.style.cursor = 'not-allowed';
        labBtn.innerText = `✓ Sonuçlar İncelendi`;
      };
      
      actionButtonsContainer.appendChild(labBtn);
    }
  }

  renderStage();
}



function goBackToDashboard() {
  viewSimulation.classList.add('hidden');
  viewLeaderboard.classList.add('hidden');
  viewProfile.classList.add('hidden');
  viewDashboard.classList.remove('hidden');
  currentCase = null;
  currentStage = null;
  renderDashboard();
}

btnBack.onclick = goBackToDashboard;


// Run Init
buildSidebar();
renderDashboard();

/* -------------------------------------------
 * SETTINGS & DARK MODE LOGIC
 * ------------------------------------------- */
const settingDarkMode = document.getElementById('setting-dark-mode');
const settingSound = document.getElementById('setting-sound');

// Load settings from localStorage
const isDarkMode = localStorage.getItem('medsim_darkmode') === 'true';
let soundEnabled = localStorage.getItem('medsim_sound') !== 'false'; // default true

if (isDarkMode) {
  document.body.classList.add('dark-mode');
  if (settingDarkMode) settingDarkMode.checked = true;
}

if (settingSound) {
  settingSound.checked = soundEnabled;
}

if (settingDarkMode) {
  settingDarkMode.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('medsim_darkmode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('medsim_darkmode', 'false');
    }
  });
}

if (settingSound) {
  settingSound.addEventListener('change', (e) => {
    soundEnabled = e.target.checked;
    localStorage.setItem('medsim_sound', soundEnabled);
  });
}


/* -------------------------------------------
 * WEB AUDIO API SYNTHESIZER
 * ------------------------------------------- */
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playAudio(type) {
  if (!soundEnabled) return;
  initAudio();
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  
  switch(type) {
    case 'click':
      // Short, subtle click
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
      break;
      
    case 'success':
      // Cheerful chime
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, now); // A4
      oscillator.frequency.setValueAtTime(554.37, now + 0.1); // C#5
      oscillator.frequency.setValueAtTime(659.25, now + 0.2); // E5
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      oscillator.start(now);
      oscillator.stop(now + 0.5);
      break;
      
    case 'error':
      // Low buzz
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, now);
      oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;
      
    case 'monitor':
      // Hospital EKG beep
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      break;
  }
}

// Bind click sounds globally
document.addEventListener('click', (e) => {
  // Only play click sound on interactive elements if they don't trigger specific sounds
  if (e.target.tagName === 'BUTTON' || e.target.closest('.nav-item') || e.target.closest('.nav-item-sub')) {
    if (!e.target.closest('#btn-show-vitals') && !e.target.closest('#btn-show-history')) {
      playAudio('click');
    }
  }
});
