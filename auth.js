// User Management (Local Storage Auth)

let currentUser = null;
let usersData = JSON.parse(localStorage.getItem('medSimUsers')) || {};

// Elements
const viewAuth = document.getElementById('view-auth');
const appLayout = document.getElementById('app-layout');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authNickname = document.getElementById('auth-nickname');
const authPassword = document.getElementById('auth-password');
const groupNickname = document.getElementById('group-nickname');
const authError = document.getElementById('auth-error');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const btnAuthSubmit = document.getElementById('btn-auth-submit');
const sidebarUsername = document.getElementById('sidebar-username');
const sidebarPoints = document.getElementById('sidebar-points');
const btnLogout = document.getElementById('btn-logout');

let isLoginMode = true;

// Tab Switcher
tabLogin.addEventListener('click', () => {
  isLoginMode = true;
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  groupNickname.style.display = 'none';
  btnAuthSubmit.innerText = 'Giriş Yap';
  authError.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
  isLoginMode = false;
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  groupNickname.style.display = 'block';
  btnAuthSubmit.innerText = 'Kayıt Ol';
  authError.classList.add('hidden');
});

// Form Submit
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = authEmail.value.trim().toLowerCase();
  const password = authPassword.value.trim();
  const nickname = authNickname.value.trim();
  
  if (!email || !password) {
    showError('E-posta ve şifre zorunludur.');
    return;
  }

  if (isLoginMode) {
    login(email, password);
  } else {
    if (!nickname) {
      showError('Liderlik tablosu için bir Nickname belirlemelisiniz.');
      return;
    }
    register(email, nickname, password);
  }
});

function showError(msg) {
  authError.innerText = msg;
  authError.classList.remove('hidden');
}

function isNicknameTaken(nickname) {
  return Object.values(usersData).some(u => u.nickname.toLowerCase() === nickname.toLowerCase());
}

function register(email, nickname, password) {
  if (usersData[email]) {
    showError('Bu e-posta adresi zaten kullanımda.');
    return;
  }
  
  if (isNicknameTaken(nickname)) {
    showError('Bu nickname (kullanıcı adı) zaten alınmış. Lütfen başka bir tane seçin.');
    return;
  }
  
  // Seed with example cases for new users
  const sampleCase1 = typeof generateRandomCase === 'function' ? generateRandomCase(4, "Dahiliye") : null;
  const sampleCase2 = typeof generateRandomCase === 'function' ? generateRandomCase(1, "Anatomi") : null;
  const initialCases = [];
  if (sampleCase1) initialCases.push(sampleCase1);
  if (sampleCase2) initialCases.push(sampleCase2);

  usersData[email] = {
    email: email,
    nickname: nickname,
    password: password, // WARNING: Plaintext for simulation only!
    points: 20, // Start with some bonus points
    solvedCases: initialCases
  };
  
  saveUsers();
  login(email, password);
}

function login(email, password) {
  const user = usersData[email];
  if (!user || user.password !== password) {
    showError('Hatalı e-posta veya şifre.');
    return;
  }
  
  // Success
  currentUser = user;
  localStorage.setItem('medSimSession', email);
  
  // Transition to App
  viewAuth.classList.add('hidden');
  appLayout.classList.remove('hidden');
  updateSidebarProfile();
  
  // App initialization depends on auth, call it here if ready
  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('medSimSession');
  viewAuth.classList.remove('hidden');
  appLayout.classList.add('hidden');
  authForm.reset();
}

function saveUsers() {
  localStorage.setItem('medSimUsers', JSON.stringify(usersData));
}

function updateSidebarProfile() {
  if (!currentUser) return;
  const avatarToUse = currentUser.avatar ? currentUser.avatar : "👨‍⚕️";
  sidebarUsername.innerText = `${avatarToUse} ${currentUser.nickname}`;
  sidebarPoints.innerText = `${currentUser.points} Puan`;
}

// Points and Progression API
function awardPoints(points) {
  if (!currentUser) return;
  currentUser.points += points;
  saveUsers();
  updateSidebarProfile();
}

function addNewCase(caseObj) {
  if (!currentUser) return;
  // If not already in list, add it
  const alreadyExists = currentUser.solvedCases.find(c => c.id === caseObj.id);
  if (!alreadyExists) {
    caseObj.isSolved = false; // Mark it as unsolved initially
    currentUser.solvedCases.push(caseObj);
    
    // Save to local storage
    const users = JSON.parse(localStorage.getItem('medsim_users')) || [];
    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem('medsim_users', JSON.stringify(users));
    }
  }
}

function finishAndScoreCase(caseId, earnedPoints) {
  if (!currentUser) return;
  const c = currentUser.solvedCases.find(c => c.id === caseId);
  if (c) {
    c.isSolved = true;
    currentUser.points += earnedPoints;
    
    // Save to local storage
    const users = JSON.parse(localStorage.getItem('medsim_users')) || [];
    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem('medsim_users', JSON.stringify(users));
    }
  }
}

// Leaderboard Logic
function getLeaderboard() {
  const usersArray = Object.values(usersData);
  return usersArray.sort((a, b) => b.points - a.points);
}

// Session Check on Load
window.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('medSimSession');
  if (session && usersData[session]) {
    // Auto Login
    currentUser = usersData[session];
    viewAuth.classList.add('hidden');
    appLayout.classList.remove('hidden');
    updateSidebarProfile();
  } else {
    // Show Auth
    viewAuth.classList.remove('hidden');
    appLayout.classList.add('hidden');
  }
});

if (btnLogout) {
  btnLogout.addEventListener('click', logout);
}
