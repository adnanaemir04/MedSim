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
        showFAB(year);
      } else {
        body.classList.add('hidden-acc');
        header.classList.remove('expanded');
        hideFAB();
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
  userProfileSidebar.addEventListener('click', () => {
    document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
    navAll.classList.remove('active');
    navLeaderboard.classList.remove('active');
    showProfile();
  });
}
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
  if (currentFilterDept === 'all') {
    btnHeaderGenerate.style.display = 'none';
  } else {
    btnHeaderGenerate.style.display = 'inline-block';
    btnHeaderGenerate.innerText = `➕ Yeni ${currentFilterDept} Vakası Başlat`;
    btnHeaderGenerate.onclick = () => {
      if (typeof generateRandomCase === 'function') {
        const newCase = generateRandomCase(currentFilterYear === 'all' ? null : parseInt(currentFilterYear), currentFilterDept);
        recordSolvedCase(newCase);
        startCase(newCase.id);
      }
    };
  }
  
  // Dashboard Info Message instead of cards
  const currentDeptText = currentFilterDept === 'all' ? (currentFilterYear === 'all' ? 'Tüm hastane bölümleri' : `${currentFilterYear}. Sınıf bölümleri`) : currentFilterDept;
  caseList.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 3rem; text-align: center; border: 1px dashed #cbd5e1; grid-column: 1 / -1;">
      <h3 style="color: #334155; font-size: 1.25rem; margin-bottom: 0.5rem;">${dashboardTitle.innerText} Seçildi</h3>
      <p style="color: #64748b; font-size: 1rem;">Bu sayfada ${currentDeptText} ile ilgili vaka bilgilerine ulaşabilirsiniz. Sağ üstteki butonu kullanarak yeni bir vakaya başlayabilirsiniz.</p>
    </div>
  `;


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
  btnShowVitals.addEventListener('click', () => {
    if (!currentCase || !currentCase.clinical) return;
    
    // Append to revealed data area
    const box = document.createElement('div');
    box.style.cssText = "background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; border-left: 4px solid #ef4444;";
    box.innerHTML = `
      <h4 style="margin-bottom: 0.75rem; color: #ef4444;">Vital Bulgular</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem;">
        <div><span style="font-size:0.75rem; color:#64748b; display:block;">TANSİYON</span><span style="font-weight:bold; color:#0f172a;">${currentCase.clinical.vitals.bp}</span></div>
        <div><span style="font-size:0.75rem; color:#64748b; display:block;">NABIZ</span><span style="font-weight:bold; color:#0f172a;">${currentCase.clinical.vitals.pulse}</span></div>
        <div><span style="font-size:0.75rem; color:#64748b; display:block;">ATEŞ</span><span style="font-weight:bold; color:#0f172a;">${currentCase.clinical.vitals.temp}</span></div>
        <div><span style="font-size:0.75rem; color:#64748b; display:block;">SOLUNUM</span><span style="font-weight:bold; color:#0f172a;">${currentCase.clinical.vitals.resp}</span></div>
        <div><span style="font-size:0.75rem; color:#64748b; display:block;">SpO2</span><span style="font-weight:bold; color:#0ea5e9;">${currentCase.clinical.vitals.spo2}</span></div>
      </div>
    `;
    revealedClinicalData.appendChild(box);
    
    // Disable button
    btnShowVitals.disabled = true;
    btnShowVitals.style.opacity = '0.5';
    btnShowVitals.style.cursor = 'not-allowed';
    btnShowVitals.innerText = "✓ Vital Bulgulara Bakıldı";
  });
}

if(btnShowHistory) {
  btnShowHistory.addEventListener('click', () => {
    if (!currentCase || !currentCase.clinical) return;
    
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
    btn.onclick = () => handleOptionClick(opt, btn);
    simOptions.appendChild(btn);
  });
}

function handleOptionClick(option, btnElement) {
  // Disable all options
  const buttons = simOptions.querySelectorAll('button');
  buttons.forEach(b => {
    b.disabled = true;
    b.style.cursor = 'not-allowed';
    b.style.opacity = '0.7';
  });

  simFeedback.style.display = 'block';
  simFeedback.classList.remove('success', 'error');

  if (option.isCorrect) {
    btnElement.style.background = 'var(--success)';
    btnElement.style.color = 'white';
    btnElement.style.borderColor = 'var(--success)';
    simFeedback.classList.add('success');
    feedbackTitle.innerText = "Doğru Karar!";
    feedbackText.innerText = option.feedback;
    
    // Animate points
    feedbackPoints.innerText = "+10 Puan!";
    feedbackPoints.classList.remove('hidden');
    feedbackPoints.style.color = 'var(--success)';
    pointsEarnedInCase += 10;
    
    // Check if next stage exists
    const currentIndex = currentCase.stages.indexOf(currentStage);
    if (currentIndex < currentCase.stages.length - 1) {
      btnNextStage.classList.remove('hidden');
      btnNextStage.onclick = () => {
        currentStage = currentCase.stages[currentIndex + 1];
        if (simOptionsContainer) simOptionsContainer.style.display = 'none'; // hide momentarily
        renderStage();
      };
    } else {
      btnFinishCase.classList.remove('hidden');
    }
    
  } else {
    btnElement.style.background = 'var(--danger)';
    btnElement.style.color = 'white';
    btnElement.style.borderColor = 'var(--danger)';
    simFeedback.classList.add('error');
    feedbackTitle.innerText = "Hatalı Yaklaşım";
    feedbackText.innerText = option.feedback;
    
    feedbackPoints.innerText = "-5 Puan!";
    feedbackPoints.classList.remove('hidden');
    feedbackPoints.style.color = 'var(--danger)';
    pointsEarnedInCase -= 5;

    // Wrong answer terminates the case early
    btnFinishCase.classList.remove('hidden');
  }
}

// Start Case
function startCase(caseId) {
  currentCase = currentUser.solvedCases.find(c => c.id === caseId);
  if (!currentCase) return;

  pointsEarnedInCase = 0; // reset
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
