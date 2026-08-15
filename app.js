// DOM Elements
const viewDashboard = document.getElementById('view-dashboard');
const viewSimulation = document.getElementById('view-simulation');
const viewLeaderboard = document.getElementById('view-leaderboard');
const caseList = document.getElementById('case-list');
const dashboardTitle = document.getElementById('dashboard-title');
const dynamicSidebar = document.getElementById('dynamic-sidebar');
const leaderboardBody = document.getElementById('leaderboard-body');

// Sidebar Elements
const navAll = document.getElementById('nav-all');
const navLeaderboard = document.getElementById('nav-leaderboard');
const btnGenerate = document.getElementById('btn-generate');

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

  // All Cases Listener
  navAll.addEventListener('click', () => {
    document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
    navLeaderboard.classList.remove('active');
    navAll.classList.add('active');
    currentFilterYear = 'all';
    currentFilterDept = 'all';
    dashboardTitle.innerText = "Tüm Vakalarım";
    hideFAB();
    goBackToDashboard();
  });

  // Leaderboard Listener
  navLeaderboard.addEventListener('click', () => {
    document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
    navAll.classList.remove('active');
    navLeaderboard.classList.add('active');
    hideFAB();
    showLeaderboard();
  });
}

// FAB Logic
function showFAB(year) {
  let fab = document.getElementById('fab-button');
  if (!fab) {
    fab = document.createElement('button');
    fab.id = 'fab-button';
    fab.className = 'fab-button';
    document.body.appendChild(fab);
  }
  fab.innerHTML = `<span>📁</span> Tüm ${year}. Sınıf Vakaları`;
  fab.onclick = () => {
    document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
    navAll.classList.remove('active');
    navLeaderboard.classList.remove('active');
    currentFilterYear = year;
    currentFilterDept = 'all';
    dashboardTitle.innerText = `${year}. Sınıf Vakaları`;
    goBackToDashboard();
  };
  fab.style.display = 'flex';
}

function hideFAB() {
  const fab = document.getElementById('fab-button');
  if (fab) fab.style.display = 'none';
}


// Initialize Dashboard
function renderDashboard() {
  if (!currentUser) return;

  caseList.innerHTML = '';
  
  // Show cases ONLY from currentUser's solvedCases
  let filteredCases = currentUser.solvedCases;
  
  if (currentFilterYear !== 'all') {
    filteredCases = filteredCases.filter(c => c.year === parseInt(currentFilterYear));
  }
  if (currentFilterDept !== 'all') {
    filteredCases = filteredCases.filter(c => c.department === currentFilterDept);
  }

  if (filteredCases.length === 0) {
    const msg = document.createElement('p');
    msg.style.cssText = "color: #94a3b8; font-style: italic; width: 100%;";
    msg.innerText = "Bu seçim için henüz çözdüğünüz/ürettiğiniz vaka bulunmuyor. Sol alttaki 'Yeni Vaka Üret' butonuyla başlayabilirsiniz.";
    caseList.appendChild(msg);
    return;
  }
  
  const sortedCases = [...filteredCases].sort((a,b) => b.id - a.id);

  sortedCases.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <h3>${c.title}</h3>
        <div class="patient-info-sm">
          <span>${c.patient.name}</span>
          <span>${c.patient.age} Yaş</span>
          <span>${c.patient.gender}</span>
        </div>
        <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">${c.description}</p>
      </div>
      <div>
        <span class="badge">${c.department} - ${c.year}. Sınıf</span>
      </div>
    `;
    card.onclick = () => startCase(c.id);
    caseList.appendChild(card);
  });
}

function showLeaderboard() {
  viewDashboard.classList.add('hidden');
  viewSimulation.classList.add('hidden');
  viewLeaderboard.classList.remove('hidden');

  leaderboardBody.innerHTML = '';
  const leaders = getLeaderboard();
  
  leaders.forEach((u, i) => {
    const tr = document.createElement('tr');
    if (u.email === currentUser.email) {
      tr.style.background = '#e0f2fe';
      tr.style.fontWeight = 'bold';
    }
    tr.innerHTML = `
      <td>#${i + 1}</td>
      <td>${u.nickname}</td>
      <td>${u.solvedCases ? u.solvedCases.length : 0}</td>
      <td style="color: #0ea5e9;">${u.points}</td>
    `;
    leaderboardBody.appendChild(tr);
  });
}

// Generate Case Logic
btnGenerate.addEventListener('click', () => {
  if (typeof generateRandomCase === 'function') {
    let targetYear = currentFilterYear === 'all' ? (Math.floor(Math.random() * 6) + 1) : parseInt(currentFilterYear);
    let possibleDepts = deptsByYear[targetYear];
    let targetDept = currentFilterDept === 'all' ? possibleDepts[Math.floor(Math.random() * possibleDepts.length)] : currentFilterDept;

    const newCase = generateRandomCase(targetYear, targetDept);
    
    // Auto-save to user's profile and run immediately
    recordSolvedCase(newCase);
    
    // Jump straight into the new case
    startCase(newCase.id);
  }
});


// Start Case
function startCase(caseId) {
  // Find from user's solved cases (or medCases as fallback, but users only see what they generated/solved)
  currentCase = currentUser.solvedCases.find(c => c.id === caseId);
  if (!currentCase) return;

  pointsEarnedInCase = 0; // reset
  currentStage = currentCase.stages[0];
  
  viewDashboard.classList.add('hidden');
  viewLeaderboard.classList.add('hidden');
  viewSimulation.classList.remove('hidden');
  
  simDepartment.innerText = `${currentCase.department} (${currentCase.year}. Sınıf)`;
  simTitle.innerText = currentCase.title;
  patName.innerText = currentCase.patient.name;
  patAge.innerText = currentCase.patient.age;
  patGender.innerText = currentCase.patient.gender;
  
  renderStage();
}

function renderStage() {
  simText.innerText = currentStage.text;
  simOptions.innerHTML = '';
  hideFeedback();
  
  currentStage.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.innerText = opt.text;
    btn.onclick = () => handleOptionClick(opt, btn);
    simOptions.appendChild(btn);
  });
}

function handleOptionClick(option, buttonElement) {
  const buttons = simOptions.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
    btn.style.opacity = '0.7';
  });

  if (option.isCorrect) {
    buttonElement.classList.add('correct');
    pointsEarnedInCase += 10;
    awardPoints(10); // Give 10 pts
    showFeedback(true, option.feedback, option.nextStage, 10);
  } else {
    buttonElement.classList.add('incorrect');
    awardPoints(-5); // Penalty
    pointsEarnedInCase -= 5;
    showFeedback(false, option.feedback, null, -5);
    
    setTimeout(() => {
      buttons.forEach(btn => {
        if (!btn.classList.contains('incorrect')) {
          btn.disabled = false;
          btn.style.cursor = 'pointer';
          btn.style.opacity = '1';
        }
      });
    }, 1500);
  }
}

function showFeedback(isCorrect, feedbackStr, nextStageId, ptsChanged) {
  simFeedback.className = 'feedback-box show';
  
  feedbackPoints.classList.remove('hidden');
  if (ptsChanged > 0) {
    feedbackPoints.innerText = `+${ptsChanged} Puan`;
    feedbackPoints.style.color = '#15803d'; // Green text
  } else {
    feedbackPoints.innerText = `${ptsChanged} Puan`;
    feedbackPoints.style.color = '#991b1b'; // Red text
  }

  if (isCorrect) {
    simFeedback.classList.add('correct-feedback');
    feedbackTitle.innerText = 'Doğru Seçim';
    
    if (nextStageId !== null) {
      btnNextStage.classList.remove('hidden');
      btnFinishCase.classList.add('hidden');
      btnNextStage.onclick = () => {
        currentStage = currentCase.stages.find(s => s.stageId === nextStageId);
        renderStage();
      };
    } else {
      btnNextStage.classList.add('hidden');
      btnFinishCase.classList.remove('hidden');
      btnFinishCase.onclick = () => goBackToDashboard();
    }
  } else {
    simFeedback.classList.add('incorrect-feedback');
    feedbackTitle.innerText = 'Yanlış Seçim';
    btnNextStage.classList.add('hidden');
    btnFinishCase.classList.add('hidden');
  }
  
  feedbackText.innerText = feedbackStr;
}

function hideFeedback() {
  simFeedback.className = 'feedback-box';
  btnNextStage.classList.add('hidden');
  btnFinishCase.classList.add('hidden');
  feedbackPoints.classList.add('hidden');
}

function goBackToDashboard() {
  viewSimulation.classList.add('hidden');
  viewLeaderboard.classList.add('hidden');
  viewDashboard.classList.remove('hidden');
  currentCase = null;
  currentStage = null;
  renderDashboard();
}

btnBack.onclick = goBackToDashboard;

// Run Init
buildSidebar();
