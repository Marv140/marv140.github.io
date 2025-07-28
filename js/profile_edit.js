// Profile edit popup functionality

function zobrazitUpravaProfiluPopup() {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  overlay.id = "profileEditPopup";

  const popup = document.createElement("div");
  popup.className = "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4";
  
  const user = firebase.auth().currentUser;
  const displayName = user?.displayName || '';

  popup.innerHTML = `
    <h3 class="text-xl font-bold mb-6 text-gray-800 dark:text-gray-200">Upravit profil</h3>
    
    <div class="space-y-4">
      <div>
        <label for="editDisplayName" class="block font-semibold mb-2 text-gray-800 dark:text-gray-200">Přezdívka:</label>
        <input type="text" 
               id="editDisplayName" 
               value="${displayName}"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"/>
      </div>
      
      <div>
        <label for="editCurrentPassword" class="block font-semibold mb-2 text-gray-800 dark:text-gray-200">Současné heslo:</label>
        <input type="password" 
               id="editCurrentPassword" 
               placeholder="Pro změnu hesla vyplňte"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"/>
      </div>
      
      <div>
        <label for="editNewPassword" class="block font-semibold mb-2 text-gray-800 dark:text-gray-200">Nové heslo:</label>
        <input type="password" 
               id="editNewPassword" 
               placeholder="Minimálně 6 znaků"
               minlength="6"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"/>
      </div>
      
      <div>
        <label for="editConfirmPassword" class="block font-semibold mb-2 text-gray-800 dark:text-gray-200">Potvrdit nové heslo:</label>
        <input type="password" 
               id="editConfirmPassword" 
               placeholder="Zopakujte nové heslo"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"/>
      </div>
    </div>
    
    <div class="flex gap-3 mt-6">
      <button onclick="ulozitZmenyProfilu()" 
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition font-medium">
        Uložit změny
      </button>
      <button onclick="zavritUpravaProfiluPopup()" 
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition font-medium">
        Zrušit
      </button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      zavritUpravaProfiluPopup();
    }
  });

  // Handle Enter key in form
  const inputs = popup.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        ulozitZmenyProfilu();
      }
    });
  });
}

function zavritUpravaProfiluPopup() {
  const popup = document.getElementById("profileEditPopup");
  if (popup) {
    popup.remove();
  }
}

async function ulozitZmenyProfilu() {
  const displayName = document.getElementById('editDisplayName').value.trim();
  const currentPassword = document.getElementById('editCurrentPassword').value;
  const newPassword = document.getElementById('editNewPassword').value;
  const confirmPassword = document.getElementById('editConfirmPassword').value;
  
  const user = firebase.auth().currentUser;
  if (!user) {
    // Use custom notification if available, otherwise fallback to alert
    if (typeof zobrazitNotifikaci === 'function') {
      zobrazitNotifikaci('Uživatel není přihlášen.', 'error');
    } else {
      alert('Uživatel není přihlášen.');
    }
    return;
  }

  try {
    let changes = [];

    // Update display name if changed
    if (displayName && displayName !== (user.displayName || '')) {
      await user.updateProfile({
        displayName: displayName
      });
      changes.push('přezdívka');
    }

    // Change password if provided
    if (currentPassword && newPassword) {
      if (newPassword !== confirmPassword) {
        if (typeof zobrazitNotifikaci === 'function') {
          zobrazitNotifikaci('Nová hesla se neshodují.', 'error');
        } else {
          alert('Nová hesla se neshodují.');
        }
        return;
      }

      if (newPassword.length < 6) {
        if (typeof zobrazitNotifikaci === 'function') {
          zobrazitNotifikaci('Nové heslo musí mít alespoň 6 znaků.', 'warning');
        } else {
          alert('Nové heslo musí mít alespoň 6 znaků.');
        }
        return;
      }

      // Re-authenticate user
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      changes.push('heslo');
    }

    if (changes.length > 0) {
      const message = `Úspěšně změněno: ${changes.join(', ')}`;
      
      if (typeof zobrazitNotifikaci === 'function') {
        zobrazitNotifikaci(message, 'success');
      } else {
        alert(message);
      }
      
      // Update the display if function exists
      if (typeof updateUserInfoDisplay === 'function') {
        updateUserInfoDisplay();
      }
    } else {
      if (typeof zobrazitNotifikaci === 'function') {
        zobrazitNotifikaci('Žádné změny nebyly provedeny.', 'info');
      } else {
        alert('Žádné změny nebyly provedeny.');
      }
    }

    zavritUpravaProfiluPopup();

  } catch (error) {
    console.error('Chyba při úpravě profilu:', error);
    
    let errorMessage = 'Chyba při úpravě profilu.';
    switch (error.code) {
      case 'auth/wrong-password':
        errorMessage = 'Nesprávné současné heslo.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Nové heslo je příliš slabé.';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Pro změnu hesla se musíte znovu přihlásit.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Příliš mnoho pokusů. Zkuste to později.';
        break;
    }
    
    if (typeof zobrazitNotifikaci === 'function') {
      zobrazitNotifikaci(errorMessage, 'error');
    } else {
      alert(errorMessage);
    }
  }
}

// Utility function for updating user info display
function updateUserInfoDisplay() {
  const user = firebase.auth().currentUser;
  if (user) {
    const displayName = user.displayName || 'Uživatel';
    const userInfoElement = document.getElementById('userInfoLoggedIn');
    if (userInfoElement) {
      userInfoElement.textContent = `Přihlášen jako: ${displayName}`;
    }
  }
}