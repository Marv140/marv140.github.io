// Firebase konfigurace - nahraď svou konfigurací z Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAWf_m_ZSzHI-DpjMbbEp8LhgtZznHRFgY",
  authDomain: "work-hours-7c4a9.firebaseapp.com",
  projectId: "work-hours-7c4a9",
  storageBucket: "work-hours-7c4a9.firebasestorage.app",
  messagingSenderId: "590898483993",
  appId: "1:590898483993:web:923f5d226a432baac66b88"
};

// Kontrola, zda Firebase není už inicializovaný
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Global user variable
let currentUser = null;

// Initialize Firebase Auth
firebase.auth().onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? user.email : 'No user');
  currentUser = user;
  
  if (user) {
    // User is logged in - show main app
    showMainApp(user);
    // Load user's data from cloud if work-hours.js is loaded
    if (typeof nactiDataZCloudu === 'function') {
      nactiDataZCloudu();
    }
  } else {
    // User is not logged in - show auth screen
    showAuthScreen();
  }
});

function showMainApp(user) {
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  
  // Update user info in header
  updateUserInfoDisplay();
  
  console.log('Zobrazuji hlavní aplikaci pro uživatele:', user.email);
}

function showAuthScreen() {
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  
  console.log('Zobrazuji přihlašovací obrazovku');
}

function showLoading() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mainApp').classList.add('hidden');
  document.getElementById('loadingScreen').classList.remove('hidden');
}

// Login function
async function prihlasit(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    zobrazitNotifikaci('Vyplňte prosím email a heslo.', 'warning');
    return;
  }
  
  showLoading();
  
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log('Uživatel úspěšně přihlášen:', userCredential.user.email);
    
    // Clear login form
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    
    zobrazitNotifikaci(`Vítejte zpět, ${userCredential.user.email}!`, 'success', 3000);
    
  } catch (error) {
    console.error('Chyba při přihlašování:', error);
    showAuthScreen();
    
    let errorMessage = 'Chyba při přihlašování.';
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'Uživatel s tímto emailem neexistuje.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Nesprávné heslo.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Neplatný formát emailu.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Příliš mnoho pokusů. Zkuste to později.';
        break;
    }
    
    zobrazitNotifikaci(errorMessage, 'error', 5000);
  }
}

// Registration function
async function registrovat(event) {
  event.preventDefault();
  
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  
  if (!name || !email || !password) {
    zobrazitNotifikaci('Vyplňte prosím všechna pole.', 'warning');
    return;
  }
  
  if (password.length < 6) {
    zobrazitNotifikaci('Heslo musí mít alespoň 6 znaků.', 'warning');
    return;
  }
  
  showLoading();
  
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    
    // Update user profile with name
    await userCredential.user.updateProfile({
      displayName: name
    });
    
    console.log('Uživatel úspěšně registrován:', userCredential.user.email);
    
    // Clear registration form
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    
    zobrazitNotifikaci(`Úspěšně registrováno! Vítejte, ${name}!`, 'success', 4000);
    
  } catch (error) {
    console.error('Chyba při registraci:', error);
    showAuthScreen();
    
    let errorMessage = 'Chyba při registraci.';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email je již registrován.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Neplatný formát emailu.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Heslo je příliš slabé.';
        break;
    }
    
    zobrazitNotifikaci(errorMessage, 'error', 5000);
  }
}

// Logout function
async function odhlasit() {
  try {
    await firebase.auth().signOut();
    console.log('Uživatel odhlášen');
    zobrazitNotifikaci('Úspěšně odhlášeno.', 'info', 2000);
  } catch (error) {
    console.error('Chyba při odhlašování:', error);
    zobrazitNotifikaci('Chyba při odhlašování.', 'error', 4000);
  }
}

// Toggle between login and registration forms
function zobrazitRegistraci() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registrationForm').classList.remove('hidden');
}

function zobrazitPrihlaseni() {
  document.getElementById('registrationForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
}