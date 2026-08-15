// DOM Elements
const viewDashboard = document.getElementById('view-dashboard');
const viewSimulation = document.getElementById('view-simulation');
const caseList = document.getElementById('case-list');
const dashboardTitle = document.getElementById('dashboard-title');
const dynamicSidebar = document.getElementById('dynamic-sidebar');

// Sidebar Elements
const navAll = document.getElementById('nav-all');
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

// State
let currentCase = null;
let currentStage = null;
let currentFilterYear = 'all';
let currentFilterDept = 'all';

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
    
    // "Tüm Dersler" for this year
    html += `<div class="nav-item-sub" data-year="${year}" data-dept="all">Tüm ${year}. Sınıf Vakaları</div>`;

    // Departments for this year
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

  html += `</div>`; // end accordion-body
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
      // Toggle this body
      const year = header.getAttribute('data-year');
      const body = document.getElementById(`nested-body-${year}`);
      
      // Close others (optional, for accordion feel)
      document.querySelectorAll('.nested-body').forEach(b => {
        if(b !== body) b.classList.add('hidden-acc');
      });
      document.querySelectorAll('.nested-header').forEach(h => {
        if(h !== header) h.classList.remove('expanded');
      });

      body.classList.toggle('hidden-acc');
      header.classList.toggle('expanded');
    });
  });

  const subItems = document.querySelectorAll('.nav-item-sub');
  subItems.forEach(item => {
    item.addEventListener('click', () => {
      // Clear active from all
      document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
      navAll.classList.remove('active');
      
      // Set active
      item.classList.add('active');
      
      currentFilterYear = item.getAttribute('data-year');
      currentFilterDept = item.getAttribute('data-dept');
      
      if (currentFilterDept === 'all') {
        dashboardTitle.innerText = `${currentFilterYear}. Sınıf Vakaları`;
      } else {
        dashboardTitle.innerText = `${currentFilterDept} (${currentFilterYear}. Sınıf)`;
      }

      goBackToDashboard(); // goes to dashboard and renders
    });
  });

  // All Cases Listener
  navAll.addEventListener('click', () => {
    document.querySelectorAll('.nav-item-sub').forEach(i => i.classList.remove('active'));
    navAll.classList.add('active');
    currentFilterYear = 'all';
    currentFilterDept = 'all';
    dashboardTitle.innerText = "Tüm Vakalar";
    goBackToDashboard();
  });
}


// Initialize Dashboard
function renderDashboard() {
  caseList.innerHTML = '';
  
  let filteredCases = medCases;
  if (currentFilterYear !== 'all') {
    filteredCases = filteredCases.filter(c => c.year === parseInt(currentFilterYear));
  }
  if (currentFilterDept !== 'all') {
    filteredCases = filteredCases.filter(c => c.department === currentFilterDept);
  }

  if (filteredCases.length === 0) {
    caseList.innerHTML = '<p style="color: #94a3b8; font-style: italic;">Bu seçim için henüz vaka bulunmuyor.</p>';
    return;
  }
  
  // Sort descending by ID so newest is first
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

// Generate Case Logic
btnGenerate.addEventListener('click', () => {
  if (typeof generateRandomCase === 'function') {
    // Pass current filters so we generate a relevant case if we are browsing a specific category
    let targetYear = currentFilterYear === 'all' ? (Math.floor(Math.random() * 6) + 1) : parseInt(currentFilterYear);
    
    let possibleDepts = deptsByYear[targetYear];
    let targetDept = currentFilterDept === 'all' ? possibleDepts[Math.floor(Math.random() * possibleDepts.length)] : currentFilterDept;

    const newCase = generateRandomCase(targetYear, targetDept);
    medCases.push(newCase);
    
    renderDashboard();
  }
});


// Start Case
function startCase(caseId) {
  currentCase = medCases.find(c => c.id === caseId);
  if (!currentCase) return;

  currentStage = currentCase.stages[0]; // Start with first stage
  
  // Switch Views
  viewDashboard.classList.add('hidden');
  viewSimulation.classList.remove('hidden');
  
  // Render Case Header & Profile
  simDepartment.innerText = `${currentCase.department} (${currentCase.year}. Sınıf)`;
  simTitle.innerText = currentCase.title;
  patName.innerText = currentCase.patient.name;
  patAge.innerText = currentCase.patient.age;
  patGender.innerText = currentCase.patient.gender;
  
  renderStage();
}

// Render Current Stage
function renderStage() {
  simText.innerText = currentStage.text;
  simOptions.innerHTML = '';
  hideFeedback();
  
  currentStage.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.innerText = opt.text;
    btn.onclick = () => handleOptionClick(opt, btn);
    simOptions.appendChild(btn);
  });
}

// Handle Option Click
function handleOptionClick(option, buttonElement) {
  const buttons = simOptions.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = 'not-allowed';
    btn.style.opacity = '0.7';
  });

  if (option.isCorrect) {
    buttonElement.classList.add('correct');
    showFeedback(true, option.feedback, option.nextStage);
  } else {
    buttonElement.classList.add('incorrect');
    showFeedback(false, option.feedback, null);
    
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

// Show Feedback
function showFeedback(isCorrect, feedbackStr, nextStageId) {
  simFeedback.className = 'feedback-box show';
  
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

// Hide Feedback
function hideFeedback() {
  simFeedback.className = 'feedback-box';
  btnNextStage.classList.add('hidden');
  btnFinishCase.classList.add('hidden');
}

// Go Back to Dashboard
function goBackToDashboard() {
  viewSimulation.classList.add('hidden');
  viewDashboard.classList.remove('hidden');
  currentCase = null;
  currentStage = null;
  renderDashboard();
}

// Event Listeners
btnBack.onclick = goBackToDashboard;

// Run Init
buildSidebar();
renderDashboard();
