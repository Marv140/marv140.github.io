// Global variables
let zaznamy = [];
let limitHodin = 0;
let aktualniFiltr = null;
let graf = null;

// Load data from localStorage
function nactiData() {
  const ulozeneZaznamy = localStorage.getItem("workHours");
  const ulozenyLimit = localStorage.getItem("workHoursLimit");
  const ulozenyFiltr = localStorage.getItem("workHoursFilter");

  if (ulozeneZaznamy) {
    zaznamy = JSON.parse(ulozeneZaznamy);
  }
  if (ulozenyLimit) {
    limitHodin = parseFloat(ulozenyLimit);
    document.getElementById("limit").value = limitHodin;
  }
  if (ulozenyFiltr) {
    aktualniFiltr = ulozenyFiltr;
    document.getElementById("filtrMesic").value = aktualniFiltr;
  }

  aktualizovatZobrazeni();
}

// Save data to localStorage
function ulozitData() {
  localStorage.setItem("workHours", JSON.stringify(zaznamy));
  localStorage.setItem("workHoursLimit", limitHodin.toString());
  if (aktualniFiltr) {
    localStorage.setItem("workHoursFilter", aktualniFiltr);
  }
}

// Load data from cloud (Firestore)
async function nactiDataZCloudu() {
  if (!currentUser) {
    console.log('Uživatel není přihlášený - nečtu z cloudu');
    return;
  }
  
  console.log('Načítám data z cloudu pro uživatele:', currentUser.uid);
  
  try {
    // Načti pracovní data
    const doc = await db.collection('workHours').doc(currentUser.uid).get();
    if (doc.exists) {
      const data = doc.data();
      console.log('Načtená data z cloudu:', data);
      
      zaznamy = data.zaznamy || [];
      limitHodin = data.limitHodin || 0;
      aktualniFiltr = data.aktualniFiltr || null;
      
      // Update UI
      document.getElementById("limit").value = limitHodin;
      if (aktualniFiltr) {
        document.getElementById("filtrMesic").value = aktualniFiltr;
      }
      
      console.log('Data úspěšně načtena z cloudu');
    } else {
      console.log('Dokument neexistuje - začínám s prázdnými daty');
      zaznamy = [];
      limitHodin = 0;
      aktualniFiltr = null;
    }
    
    // PŘIDEJ: Načti nastavení uživatele (sazba, DPH)
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      if (userData.hodinovaSazba !== undefined) {
        hodinovaSazba = userData.hodinovaSazba;
        document.getElementById('hodinovaSazba').value = hodinovaSazba;
      }
      
      if (userData.danovaSazba !== undefined) {
        danovaSazba = userData.danovaSazba;
        document.getElementById('danovaSazba').value = danovaSazba;
      }
      
      console.log(`Nastavení načteno: ${hodinovaSazba} Kč/h, ${danovaSazba}% daň`);
    }
    
    aktualizovatZobrazeni();
    
  } catch (error) {
    console.error('Chyba při načítání dat z cloudu:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Fallback na local storage
    console.log('Fallback na lokální úložiště');
    nactiData(); 
    
    // Načti sazbu z localStorage jako fallback
    const savedSazba = localStorage.getItem('hodinovaSazba');
    const savedDan = localStorage.getItem('danovaSazba');
    
    if (savedSazba) {
      hodinovaSazba = parseFloat(savedSazba);
      document.getElementById('hodinovaSazba').value = hodinovaSazba;
    }
    
    if (savedDan) {
      danovaSazba = parseFloat(savedDan);
      document.getElementById('danovaSazba').value = danovaSazba;
    }
    
    updateVydelekDisplay();
  }
};

// Save data to cloud (Firestore)
async function ulozitDataDoCloudu() {
  if (!currentUser) {
    console.log('Uživatel není přihlášený - neukládám do cloudu');
    return;
  }
  
  console.log('Ukládám data do cloudu pro uživatele:', currentUser.uid);
  console.log('Data k uložení:', {
    pocetZaznamu: zaznamy.length,
    limitHodin: limitHodin,
    aktualniFiltr: aktualniFiltr
  });
  
  try {
    await db.collection('workHours').doc(currentUser.uid).set({
      zaznamy: zaznamy,
      limitHodin: limitHodin,
      aktualniFiltr: aktualniFiltr,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      userEmail: currentUser.email // Pro debugging
    });
    console.log('Data úspěšně uložena do cloudu!');
  } catch (error) {
    console.error('Chyba při ukládání dat do cloudu:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      zobrazitNotifikaci('Nemáte oprávnění k ukládání dat, zkontrolujte Firestore pravidla', 'error', 5000);
    } else {
      zobrazitNotifikaci('Chyba při ukládání do cloudu: ' + error.message, 'error', 5000);
    }
  }
}

// Universal save function (saves to both local and cloud)
function universalSave() {
  ulozitData(); // Always save locally as backup
  if (currentUser) {
    ulozitDataDoCloudu(); // Save to cloud if logged in
  }
}

// Format hours in HH:MM format
function formatHHMM(hodin) {
  const h = Math.floor(hodin);
  const m = Math.round((hodin - h) * 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

// Get ISO week number
function getISOWeek(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

// Helper function to convert Date to local datetime-local format
function dateToLocalString(date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().slice(0, 16);
}

// Helper function to create Date from local datetime-local string
function localStringToDate(localString) {
  // Přidáme sekundy pokud nejsou uvedené
  const fullString = localString.length === 16 ? localString + ':00' : localString;
  // Vytvoříme datum bez UTC konverze
  return new Date(fullString);
}

// Add new record - updated to handle timezone correctly
function pridatZaznam() {
  const od = document.getElementById("od").value;
  const doValue = document.getElementById("do").value;

  if (!od || !doValue) {
    zobrazitNotifikaci("Vyplňte prosím oba časy", 'warning');
    return;
  }

  const odDate = localStringToDate(od);
  const doDate = localStringToDate(doValue);

  if (doDate <= odDate) {
    zobrazitNotifikaci('Čas "Do" musí být později než čas "Od"', 'error');
    return;
  }

  const hodin = (doDate - odDate) / (1000 * 60 * 60);

  zaznamy.push({
    od: odDate.toLocaleString('cs-CZ'),
    do: doDate.toLocaleString('cs-CZ'),
    odRaw: od,
    doRaw: doValue,
    hodin: hodin
  });

  // Seřaď záznamy podle odRaw (od nejstaršího po nejnovější)
  zaznamy.sort((a, b) => new Date(a.odRaw) - new Date(b.odRaw));

  universalSave();
  aktualizovatZobrazeni();

  document.getElementById("od").value = "";
  document.getElementById("do").value = "";
  
  zobrazitNotifikaci(`Záznam přidán: ${formatHHMM(hodin)} hodin`, 'success');
}

// Update display
function aktualizovatZobrazeni() {
  const seznam = document.getElementById("seznam");
  seznam.innerHTML = "";
  const data = filtrujZaznamy();

  let celkem = 0;
  const poDnech = {};
  const poTydnech = {};

  data.forEach((z) => {
    celkem += z.hodin;
    
    // Pokud odRaw obsahuje UTC čas (starší záznamy), převedeme na lokální
    let den;
    if (z.odRaw.includes('Z') || z.odRaw.includes('+')) {
      // UTC formát - převedeme na lokální
      const localDate = new Date(z.odRaw);
      den = dateToLocalString(localDate).split("T")[0];
    } else {
      // Lokální formát
      den = z.odRaw.split("T")[0];
    }

    const d = new Date(z.odRaw);
    const tyden = `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2, "0")}`;
    poDnech[den] = (poDnech[den] || 0) + z.hodin;
    poTydnech[tyden] = (poTydnech[tyden] || 0) + z.hodin;

    const i = zaznamy.indexOf(z);
    
    // Create card element
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-300 dark:border-gray-500 shadow-sm hover:shadow-md transition-all duration-200";
    
    // Format dates and times - ensure we use local time
    let odDate, doDate;
    if (z.odRaw.includes('Z') || z.odRaw.includes('+')) {
      // UTC formát - převedeme na lokální
      odDate = new Date(z.odRaw);
      doDate = new Date(z.doRaw);
    } else {
      // Lokální formát
      odDate = localStringToDate(z.odRaw);
      doDate = localStringToDate(z.doRaw);
    }
    
    const formatovanyDatum = odDate.toLocaleDateString('cs-CZ', { 
      weekday: 'short',
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const odCas = odDate.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'});
    const doCas = doDate.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'});
    
    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <div class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded border">
              ${formatovanyDatum}
            </div>
          </div>
          <div class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
            ${odCas} - ${doCas}
          </div>
          <div class="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            Délka: ${formatHHMM(z.hodin)}
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="zobrazitZaznamEditPopup(${i})" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
            Upravit
          </button>
          <button onclick="zobrazitZaznamDeletePopup(${i})" 
                  class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md">
            Smazat
          </button>
        </div>
      </div>
    `;
    
    seznam.appendChild(card);
  });

  // Show empty state if no records
  if (data.length === 0) {
    const emptyCard = document.createElement("div");
    emptyCard.className = "bg-white dark:bg-gray-600 p-8 rounded-lg border border-gray-300 dark:border-gray-500 text-center";
    emptyCard.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h4 class="text-lg font-medium mb-1">Žádné záznamy</h4>
        <p class="text-sm">Přidejte první záznam práce pomocí formuláře výše</p>
      </div>
    `;
    seznam.appendChild(emptyCard);
  }

  document.getElementById("celkem").textContent = formatHHMM(celkem);
  document.getElementById("zbyva").textContent = formatHHMM(Math.max(0, limitHodin - celkem));
  document.getElementById("celkem").className = limitHodin && celkem > limitHodin ? "over-limit text-lg text-red-600 dark:text-red-400" : "text-lg text-indigo-600 dark:text-indigo-400";

  const dnu = Object.keys(poDnech).length;
  document.getElementById("prumerDennich").textContent = formatHHMM(dnu ? celkem / dnu : 0);

  document.getElementById("tydenniSoucty").textContent = Object.entries(poTydnech)
    .map(([tyden, hod]) => `${tyden}: ${formatHHMM(hod)}`)
    .join(", ");

  vykresliGraf(poDnech);
}

// Filter records by month
function filtrujZaznamy() {
  if (!aktualniFiltr) return zaznamy;
  
  return zaznamy.filter(z => {
    const den = z.odRaw.split("T")[0];
    const rokMesic = den.substring(0, 7);
    return rokMesic === aktualniFiltr;
  });
}

// Set hour limit
async function nastavitLimit() {
  const novyLimit = parseFloat(document.getElementById("limit").value);
  if (isNaN(novyLimit) || novyLimit < 0) {
    zobrazitNotifikaci("Zadejte platný limit hodin", 'warning');
    return;
  }
  
  limitHodin = novyLimit;
  
  // Ukládání do cloudu
  if (currentUser) {
    try {
      await db.collection('users').doc(currentUser.uid).update({
        limit: limitHodin
      });
      console.log('Limit uložen do cloudu');
    } catch (error) {
      console.error('Chyba při ukládání limitu:', error);
    }
  }
  
  universalSave();
  aktualizovatZobrazeni(); // Toto už zavolá updateVydelekDisplay
  zobrazitNotifikaci(`Limit nastaven na ${formatHHMM(limitHodin)} hodin`, 'success');
};

// Apply month filter
function aplikovatFiltr() {
  aktualniFiltr = document.getElementById("filtrMesic").value;
  if (!aktualniFiltr) {
    zobrazitNotifikaci("Vyberte měsíc pro filtrování", 'warning');
    return;
  }
  universalSave();
  aktualizovatZobrazeni();
  zobrazitNotifikaci(`Filtr aplikován pro ${aktualniFiltr}`, 'info');
}

// Clear filter
function zrusitFiltr() {
  aktualniFiltr = null;
  document.getElementById("filtrMesic").value = "";
  universalSave();
  aktualizovatZobrazeni();
  zobrazitNotifikaci("Filtr zrušen", 'info');
}

// Export records to TXT file

function exportovat() {
  if (zaznamy.length === 0) {
    zobrazitNotifikaci("Žádné záznamy k exportu", 'warning');
    return;
  }

  const data = filtrujZaznamy();
  const celkemHodin = data.reduce((s, z) => s + z.hodin, 0);
  
  let obsah = "Evidence pracovních hodin\n";
  obsah += "========================\n\n";
  
  // Přidej informace o výdělku na začátek
  if (hodinovaSazba > 0) {
    const hruby = celkemHodin * hodinovaSazba;
    const cisty = hruby * (1 - danovaSazba / 100);
    obsah += `VÝDĚLEK:\n`;
    obsah += `Hodinová Sazba: ${hodinovaSazba} Kč/hod\n`;
    obsah += `Daňová Sazba: ${danovaSazba}%\n`;
    obsah += `Hrubý výdělek: ${Math.round(hruby)} Kč\n`;
    obsah += `Čistý výdělek: ${Math.round(cisty)} Kč\n\n`;
  }
  
  obsah += "Záznamy:\n\n";

  data.forEach((z, index) => {
    const odFormatted = z.odRaw.slice(0, 16);
    const doFormatted = z.doRaw.slice(0, 16);
    obsah += `${index + 1}. ${odFormatted} | ${doFormatted}\n`;
  });

  obsah += `\nCELKEM: ${celkemHodin.toFixed(4)}\n`;
  obsah += `CELKEM (formátováno): ${formatHHMM(celkemHodin)}\n`;
  
  if (limitHodin > 0) {
    obsah += `LIMIT: ${formatHHMM(limitHodin)}\n`;
    const zbyvajici = Math.max(0, limitHodin - celkemHodin);
    obsah += `ZBÝVÁ: ${formatHHMM(zbyvajici)}\n`;
  }
  
  if (aktualniFiltr) {
    obsah += `\nFILTR: ${aktualniFiltr}\n`;
  }
  
  const exportTime = new Date();
  obsah += `\nExportováno: ${exportTime.toLocaleString('cs-CZ')} (${Intl.DateTimeFormat().resolvedOptions().timeZone})\n`;
  obsah += `© 2025 Marv140 - Software accessible at https://marv140.github.io/\n`;

  const blob = new Blob([obsah], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  const today = new Date();
  const dateString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  a.download = `pracovni_hodiny_${dateString}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  zobrazitNotifikaci(`Export dokončen: ${data.length} záznamů (${formatHHMM(celkemHodin)})`, 'success', 4000);
  console.log(`Export dokončen: ${data.length} záznamů, ${formatHHMM(celkemHodin)} hodin`);
};

// Import from TXT - supports multiple formats with correct timezone handling
function importovat(input) {
  const file = input.files[0];
  if (!file) {
    const textElement = document.getElementById('fileInputText');
    if (textElement) {
      textElement.textContent = 'Vyberte soubor...';
    }
    return;
  }

  const textElement = document.getElementById('fileInputText');
  if (textElement) {
    textElement.textContent = `Zpracovávám: ${file.name}`;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const obsah = e.target.result;
    const radky = obsah.split('\n');
    
    const importovaneZaznamy = [];
    
    radky.forEach(radek => {
      radek = radek.trim();
      if (!radek) return;
      
      // Nový formát: "1. 2025-06-30T08:05 | 2025-06-30T15:15"
      const novyFormat = radek.match(/^\d+\.\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})\s*\|\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
      
      // Starý formát: "30.6.2025, 08:05:00 - 30.6.2025, 15:15:00"
      const staryFormat = radek.match(/(\d{1,2}\.\d{1,2}\.\d{4},?\s+\d{1,2}:\d{2}:\d{2})\s*-\s*(\d{1,2}\.\d{1,2}\.\d{4},?\s+\d{1,2}:\d{2}:\d{2})/);
      
      try {
        let odDate, doDate, odRaw, doRaw;
        
        if (novyFormat) {
          // Nový formát - lokální datetime
          const odStr = novyFormat[1];
          const doStr = novyFormat[2];
          
          // Vytvoříme Date objekty z lokálních stringů
          odDate = localStringToDate(odStr);
          doDate = localStringToDate(doStr);
          
          // Raw hodnoty pro datetime-local inputy
          odRaw = odStr;
          doRaw = doStr;
          
          console.log(`Parsování nového formátu: ${odStr} -> ${doStr}`);
          
        } else if (staryFormat) {
          // Starý formát - český datum
          const odStr = staryFormat[1].replace(',', '');
          const doStr = staryFormat[2].replace(',', '');
          
          // Konverze z formátu "30.6.2025 08:05:00" na lokální datetime
          const odParts = odStr.split(' ');
          const odDatum = odParts[0].split('.').reverse().join('-');
          const odCas = odParts[1].slice(0, 5); // Vezmeme jen HH:MM
          
          const doParts = doStr.split(' ');
          const doDatum = doParts[0].split('.').reverse().join('-');
          const doCas = doParts[1].slice(0, 5); // Vezmeme jen HH:MM
          
          const odLocal = `${odDatum}T${odCas}`;
          const doLocal = `${doDatum}T${doCas}`;
          
          odDate = localStringToDate(odLocal);
          doDate = localStringToDate(doLocal);
          
          // Raw hodnoty pro datetime-local inputy
          odRaw = odLocal;
          doRaw = doLocal;
          
          console.log(`Parsování starého formátu: ${odStr} -> ${doStr}`);
        }
        
        if (odDate && doDate && !isNaN(odDate) && !isNaN(doDate) && doDate > odDate) {
          const hodin = (doDate - odDate) / (1000 * 60 * 60);
          
          const zaznam = {
            od: odDate.toLocaleString('cs-CZ'),
            do: doDate.toLocaleString('cs-CZ'),
            odRaw: odRaw,
            doRaw: doRaw,
            hodin: hodin
          };
          
          importovaneZaznamy.push(zaznam);
          console.log(`Úspěšně importován záznam: ${zaznam.od} - ${zaznam.do} (${formatHHMM(hodin)})`);
        }
        
      } catch (err) {
        console.error('Chyba při parsování řádku:', radek, err);
      }
    });

    // Reset file input and text regardless of success or failure
    input.value = '';
    if (textElement) {
      textElement.textContent = 'Vyberte soubor...';
    }

    if (importovaneZaznamy.length === 0) {
      zobrazitNotifikaci("V souboru nebyly nalezeny žádné platné záznamy", 'error', 5000);
      return;
    }

    // Seřazení záznamů podle data (porovnáváme raw hodnoty)
    importovaneZaznamy.sort((a, b) => new Date(a.odRaw).getTime() - new Date(b.odRaw).getTime());

    const mode = document.querySelector('input[name="importMode"]:checked').value;
    if (mode === "nahradit") {
      zaznamy = importovaneZaznamy;
    } else {
      zaznamy = zaznamy.concat(importovaneZaznamy);
      // Seřazení všech záznamů po sloučení
      zaznamy.sort((a, b) => new Date(a.odRaw).getTime() - new Date(b.odRaw).getTime());
    }

    universalSave();
    aktualizovatZobrazeni();
    
    const celkemHodin = importovaneZaznamy.reduce((sum, z) => sum + z.hodin, 0);
    zobrazitNotifikaci(`Importováno ${importovaneZaznamy.length} záznamů (${formatHHMM(celkemHodin)})`, 'success', 4000);
    
    console.log(`Import dokončen: ${importovaneZaznamy.length} záznamů, celkem ${formatHHMM(celkemHodin)} hodin`);
  };
  
  reader.onerror = function() {
    input.value = '';
    if (textElement) {
      textElement.textContent = 'Vyberte soubor...';
    }
    zobrazitNotifikaci('Chyba při čtení souboru, zkuste to znovu', 'error');
  };
  
  reader.readAsText(file, 'utf-8');
}

// Show edit popup
function zobrazitZaznamEditPopup(index) {
  const zaznam = zaznamy[index];
  if (!zaznam) return;

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  overlay.id = "editPopup";

  const popup = document.createElement("div");
  popup.className = "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4";
  
  popup.innerHTML = `
    <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Upravit záznam</h3>
    <div class="space-y-4">
      <div>
        <label class="block font-semibold mb-2 text-gray-800 dark:text-gray-200">Od:</label>
        <input type="datetime-local" 
               id="editOd" 
               value="${zaznam.odRaw}"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"/>
      </div>
      <div>
        <label class="block font-semibold mb-2 text-gray-800 dark:text-gray-200">Do:</label>
        <input type="datetime-local" 
               id="editDo" 
               value="${zaznam.doRaw}"
               class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"/>
      </div>
      <div class="flex gap-3 pt-4">
        <button onclick="ulozitZaznamUpravy(${index})" 
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded transition">
          Uložit
        </button>
        <button onclick="zavritZaznamEditPopup()" 
                class="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition">
          Zrušit
        </button>
      </div>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      zavritZaznamEditPopup();
    }
  });
}

function ulozitZaznamUpravy(index) {
  const odInput = document.getElementById("editOd");
  const doInput = document.getElementById("editDo");
  
  const od = odInput.value;
  const doValue = doInput.value;
  
  if (!od || !doValue) {
    zobrazitNotifikaci("Vyplňte prosím oba časy", 'warning');
    return;
  }
  
  const odDate = localStringToDate(od);
  const doDate = localStringToDate(doValue);
  
  if (doDate <= odDate) {
    zobrazitNotifikaci('Čas "Do" musí být později než čas "Od"', 'error');
    return;
  }
  
  const hodin = (doDate - odDate) / (1000 * 60 * 60);
  
  zaznamy[index] = {
    od: odDate.toLocaleString('cs-CZ'),
    do: doDate.toLocaleString('cs-CZ'),
    odRaw: od,
    doRaw: doValue,
    hodin: hodin
  };
  
  universalSave();
  aktualizovatZobrazeni();
  zavritZaznamEditPopup();

  zobrazitNotifikaci(`Záznam upraven: ${formatHHMM(hodin)} hodin`, 'success');
}

function zavritZaznamEditPopup() {
  const popup = document.getElementById("editPopup");
  if (popup) {
    popup.remove();
  }
}

function zobrazitZaznamDeletePopup(index) {
  const zaznam = zaznamy[index];
  if (!zaznam) return;

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  overlay.id = "deletePopup";

  const popup = document.createElement("div");
  popup.className = "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4";
  
  const odDate = new Date(zaznam.odRaw);
  const doDate = new Date(zaznam.doRaw);
  const formatovanyDatum = odDate.toLocaleDateString('cs-CZ', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const odCas = odDate.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'});
  const doCas = doDate.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'});
  
  popup.innerHTML = `
    <div class="text-center">
      <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
        <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Smazat záznam?</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Opravdu chcete smazat záznam z ${formatovanyDatum}<br>
        <strong>${odCas} - ${doCas}</strong> (${formatHHMM(zaznam.hodin)})?
      </p>
      <div class="flex gap-3">
        <button onclick="potvrditSmazani(${index})" 
                class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition">
          Ano, smazat
        </button>
        <button onclick="zavritDeletePopup()" 
                class="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition">
          Zrušit
        </button>
      </div>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      zavritZaznamDeletePopup();
    }
  });
}

function potvrditSmazani(index) {
  zaznamy.splice(index, 1);
  universalSave();
  aktualizovatZobrazeni();
  zavritZaznamDeletePopup();
}

function zavritZaznamDeletePopup() {
  const popup = document.getElementById("deletePopup");
  if (popup) {
    popup.remove();
  }
}

function vykresliGraf(poDnech) {
  const ctx = document.getElementById("grafHodin").getContext("2d");
  
  if (graf) {
    graf.destroy();
  }

  const labels = Object.keys(poDnech).sort();
  const data = labels.map(den => poDnech[den]);

  graf = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Hodiny",
        data: data,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatHHMM(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Hodiny: ${formatHHMM(context.parsed.y)}`;
            }
          }
        }
      }
    }
  });
}

function exportGraf() {
  if (!graf) {
    zobrazitNotifikaci("Graf není k dispozici", 'warning');
    return;
  }

  const url = graf.toBase64Image();
  const a = document.createElement("a");
  a.href = url;
  a.download = "graf_hodin.png";
  a.click();
  
  zobrazitNotifikaci("Graf byl exportován jako obrázek", 'success');
}

// Test Firebase connection
async function testFirebaseConnection() {
  if (!currentUser) {
    console.log('Musíte se nejdříve přihlásit');
    zobrazitNotifikaci("Musíte se nejdříve přihlásit pro test Firebase připojení", "warning");
    return;
  }
  
  console.log('Testuji připojení k Firestore...');
  console.log('Uživatel:', currentUser.uid);
  console.log('Email:', currentUser.email);
  
  try {
    // Test writing to test collection
    await db.collection('test').doc('testDoc').set({
      message: 'Test successful',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userId: currentUser.uid,
      userEmail: currentUser.email
    });
    console.log('Test úspěšný! Firestore funguje.');
    
    // Test writing to workHours collection
    await db.collection('workHours').doc(currentUser.uid).set({
      testData: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('Test workHours kolekce úspěšný!');
    
    zobrazitNotifikaci('Firebase test úspěšný! Všechno funguje správně', 'success', 5000);
    
  } catch (error) {
    console.error('Test neúspěšný:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      zobrazitNotifikaci('Chyba oprávnění: Zkontrolujte Firestore Security Rules v Firebase Console', 'error', 6000);
    } else if (error.code === 'unauthenticated') {
      zobrazitNotifikaci('Uživatel není přihlášený, přihlaste se prosím znovu', 'error', 5000);
    } else {
      zobrazitNotifikaci(`Chyba Firebase: ${error.message}`, 'error', 5000);
    }
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function() {
  // Load initial data (will be overridden by auth state change if user is logged in)
  nactiData();
});

// Show delete all popup
function zobrazitSmazatVsechnyZaznamyPopup() {
  if (zaznamy.length === 0) {
    zobrazitNotifikaci("Žádné záznamy ke smazání", "error");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  overlay.id = "deleteAllPopup";

  const popup = document.createElement("div");
  popup.className = "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4";
  
  const pocetZaznamu = zaznamy.length;
  const celkemHodin = zaznamy.reduce((sum, z) => sum + z.hodin, 0);
  
  popup.innerHTML = `
    <div class="text-center">
      <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
        <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Smazat všechny záznamy?</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Opravdu chcete smazat všech <strong>${pocetZaznamu}</strong> záznamů?<br>
        <span class="text-sm">Celkem ${formatHHMM(celkemHodin)} odpracovaných hodin</span>
      </p>
      <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <span class="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Varování:</strong> Tato akce je nevratná!
          </span>
        </div>
      </div>
      <div class="flex gap-3">
        <button onclick="potvrditSmazaniVsech()" 
                class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition font-medium">
          Ano, smazat vše
        </button>
        <button onclick="zavritSmazatVsechnyPopup()" 
                class="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition">
          Zrušit
        </button>
      </div>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      zavritSmazatVsechnyZaznamyPopup();
    }
  });
}

// Confirm delete all records
function potvrditSmazaniVsechZaznamu() {
  const pocetZaznamu = zaznamy.length;
  zaznamy = [];
  universalSave();
  aktualizovatZobrazeni();
  zavritSmazatVsechnyZaznamyPopup();
  
  zobrazitNotifikaci(`Úspěšně smazáno všech ${pocetZaznamu} záznamů`, 'success');
}

// Close delete all popup
function zavritSmazatVsechnyZaznamyPopup() {
  const popup = document.getElementById("deleteAllPopup");
  if (popup) {
    popup.remove();
  }
}

// Notification system
function zobrazitNotifikaci(zprava, typ = 'info', delka = 3000) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.custom-notification');
  existingNotifications.forEach(notif => notif.remove());

  const notification = document.createElement('div');
  notification.className = 'custom-notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border transition-all duration-300 max-w-sm';
  
  // Set colors based on type
  let colorClasses = '';
  let iconSvg = '';
  
  switch(typ) {
    case 'success':
      colorClasses = 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200';
      iconSvg = `
        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
      break;
    case 'error':
      colorClasses = 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200';
      iconSvg = `
        <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      break;
    case 'warning':
      colorClasses = 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
      iconSvg = `
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      `;
      break;
    default: // info
      colorClasses = 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200';
      iconSvg = `
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `;
  }
  
  notification.className += ' ' + colorClasses;
  
  notification.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        ${iconSvg}
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium">${zprava}</p>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
              class="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 10);
  
  // Auto remove after specified time
  if (delka > 0) {
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, delka);
  }
}

// Enhanced notification with progress bar
function zobrazitNotifikaci2(zprava, typ = 'info', delka = 3000) {
  const existingNotifications = document.querySelectorAll('.custom-notification');
  existingNotifications.forEach(notif => notif.remove());

  const notification = document.createElement('div');
  notification.className = 'custom-notification fixed top-4 right-4 z-50 rounded-lg shadow-xl border transition-all duration-300 max-w-sm overflow-hidden';
  
  let colorClasses = '';
  let iconSvg = '';
  let progressColor = '';
  
  switch(typ) {
    case 'success':
      colorClasses = 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200';
      progressColor = 'bg-green-500';
      iconSvg = `
        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
      break;
    case 'error':
      colorClasses = 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200';
      progressColor = 'bg-red-500';
      iconSvg = `
        <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      break;
    case 'warning':
      colorClasses = 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
      progressColor = 'bg-yellow-500';
      iconSvg = `
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      `;
      break;
    default:
      colorClasses = 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200';
      progressColor = 'bg-blue-500';
      iconSvg = `
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      `;
  }
  
  notification.className += ' ' + colorClasses;
  
  notification.innerHTML = `
    <div class="p-4">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          ${iconSvg}
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium">${zprava}</p>
        </div>
        <button onclick="this.closest('.custom-notification').remove()" 
                class="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
    ${delka > 0 ? `<div class="h-1 bg-gray-200 dark:bg-gray-700">
      <div class="h-full ${progressColor} transition-all duration-${delka} ease-linear" style="width: 100%"></div>
    </div>` : ''}
  `;
  
  document.body.appendChild(notification);
  
  // Start progress bar animation
  if (delka > 0) {
    const progressBar = notification.querySelector(`.${progressColor}`);
    setTimeout(() => {
      progressBar.style.width = '0%';
    }, 50);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, delka);
  }
}

function potvrditSmazaniVsech() {
  const pocetZaznamu = zaznamy.length;
  zaznamy = [];
  universalSave();
  aktualizovatZobrazeni();
  zavritSmazatVsechnyZaznamyPopup();
  
  zobrazitNotifikaci(`Úspěšně smazáno všech ${pocetZaznamu} záznamů`, 'success');
}

function pouzitStejneDatum() {
  const odInput = document.getElementById('od');
  const doInput = document.getElementById('do');
  
  if (!odInput.value) {
    zobrazitNotifikaci('Nejprve vyplňte pole "Od"', 'warning');
    odInput.focus(); // Přidej focus pro lepší UX
    return;
  }
  
  const odValue = odInput.value;
  const rokMesicDen = odValue.split('T')[0];
  
  if (doInput.value) {
    // Zachovej existující čas
    const existujiciCas = doInput.value.split('T')[1];
    doInput.value = rokMesicDen + 'T' + existujiciCas;
  } else {
    // Nastav čas na 00:00
    doInput.value = rokMesicDen + 'T00:00';
  }
  
  console.log('Datum zkopírováno:', rokMesicDen);
  zobrazitNotifikaci(`Datum zkopírováno: ${rokMesicDen}`, 'info');
  doInput.focus(); // Přesun focus na pole "Do"
};

let hodinovaSazba = 0;
let danovaSazba = 21;

async function nastavitSazbu() {
  const sazbaInput = document.getElementById('hodinovaSazba');
  const danInput = document.getElementById('danovaSazba');
  
  const novaSazba = parseFloat(sazbaInput.value) || 0;
  const novaDan = parseFloat(danInput.value) || 21;
  
  // Validace
  if (novaSazba < 0) {
    zobrazitNotifikaci('Hodinová sazba nemůže být záporná.', 'error');
    return;
  }
  
  if (novaDan < 0 || novaDan > 100) {
    zobrazitNotifikaci('Daňové zatížení musí být mezi 0 a 100%', 'error');
    return;
  }
  
  hodinovaSazba = novaSazba;
  danovaSazba = novaDan;
  
  // Uložení do Firebase - použij set s merge: true
  if (currentUser) {
    try {
      await db.collection('users').doc(currentUser.uid).set({
        hodinovaSazba: hodinovaSazba,
        danovaSazba: danovaSazba,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log('Sazba uložena do cloudu');
    } catch (error) {
      console.error('Chyba při ukládání sazby:', error);
      zobrazitNotifikaci('Chyba při ukládání do cloudu, data uložena lokálně', 'warning');
    }
  }
  
  // Záložní uložení do localStorage
  localStorage.setItem('hodinovaSazba', hodinovaSazba.toString());
  localStorage.setItem('danovaSazba', danovaSazba.toString());
  
  updateVydelekDisplay();
  zobrazitNotifikaci(`Sazba nastavena: ${hodinovaSazba} Kč/hod, daň ${danovaSazba}%`, 'success');
}

function updateVydelekDisplay() {
  // Počítej pouze z aktuálně zobrazených (filtrovaných) záznamů
  const data = filtrujZaznamy();
  
  const celkemMinut = data.reduce((sum, zaznam) => {
    let odDate, doDate;
    
    // Správné parsování podle formátu
    if (zaznam.odRaw.includes('Z') || zaznam.odRaw.includes('+')) {
      // UTC formát (starší záznamy)
      odDate = new Date(zaznam.odRaw);
      doDate = new Date(zaznam.doRaw);
    } else {
      // Lokální formát
      odDate = localStringToDate(zaznam.odRaw);
      doDate = localStringToDate(zaznam.doRaw);
    }
    
    return sum + (doDate - odDate) / (1000 * 60);
  }, 0);
  
  const celkemHodin = celkemMinut / 60;
  const hruby = celkemHodin * hodinovaSazba;
  const cisty = hruby * (1 - danovaSazba / 100);
  
  // Bezpečná aktualizace DOM elementů
  updateElementSafely('hrubyVydelek', `${Math.round(hruby)} Kč`);
  updateElementSafely('cistyVydelek', `${Math.round(cisty)} Kč`);
  updateElementSafely('aktualniSazba', `${hodinovaSazba} Kč/hod`);
  updateElementSafely('celkemHodinVydelek', `${celkemHodin.toFixed(1)} hod`);
  updateElementSafely('aktualniDan', `${danovaSazba}%`);

  console.log(`Výdělek: ${celkemHodin.toFixed(1)}h × ${hodinovaSazba}Kč/h = ${Math.round(hruby)}Kč hrubý, ${Math.round(cisty)}Kč čistý`);
}

function updateElementSafely(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

async function loadUserSettings() {
  if (!currentUser) return;
  
  try {
    const doc = await db.collection('users').doc(currentUser.uid).get();
    if (doc.exists) {
      const data = doc.data();
      
      // Načtení sazby a daně
      if (data.hodinovaSazba !== undefined) {
        hodinovaSazba = data.hodinovaSazba;
        updateElementSafely('hodinovaSazba', '');
        const sazbaInput = document.getElementById('hodinovaSazba');
        if (sazbaInput) sazbaInput.value = hodinovaSazba;
      }
      
      if (data.danovaSazba !== undefined) {
        danovaSazba = data.danovaSazba;
        const danInput = document.getElementById('danovaSazba');
        if (danInput) danInput.value = danovaSazba;
      }
      
      // Načtení limitu
      if (data.limit !== undefined) {
        limitHodin = data.limit;
        const limitInput = document.getElementById('limit');
        if (limitInput) limitInput.value = limitHodin;
      }
      
      console.log(`Nastavení načteno: ${hodinovaSazba} Kč/h, ${danovaSazba}% daň, ${limitHodin}h limit`);
    }
  } catch (error) {
    console.error('Cloud nedostupný, načítám z localStorage:', error);
    
    // Fallback na localStorage
    const savedSazba = localStorage.getItem('hodinovaSazba');
    const savedDan = localStorage.getItem('danovaSazba');
    
    if (savedSazba) {
      hodinovaSazba = parseFloat(savedSazba);
      const sazbaInput = document.getElementById('hodinovaSazba');
      if (sazbaInput) sazbaInput.value = hodinovaSazba;
    }
    
    if (savedDan) {
      danovaSazba = parseFloat(savedDan);
      const danInput = document.getElementById('danovaSazba');
      if (danInput) danInput.value = danovaSazba;
    }
  }
  
  // Vždy aktualizuj výdělek po načtení
  updateVydelekDisplay();
}

const originalAktualizovatZobrazeni = aktualizovatZobrazeni;
aktualizovatZobrazeni = function() {
  originalAktualizovatZobrazeni.call(this);
  // Přidej výpočet výdělku na konec
  updateVydelekDisplay();
};

// Přidej popup pro potvrzení smazání sazby
function zobrazitSmazatSazbuPopup() {
  const popup = document.createElement('div');
  popup.id = 'smazatSazbuPopup';
  popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  popup.innerHTML = `
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="text-center">
        <div class="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Smazat sazbu?</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Opravdu chcete smazat nastavenou hodinovou sazbu a daňové zatížení?<br>
          <strong>Tato akce je nevratná</strong> a smaže data jak z cloudu, tak z místního úložiště.
        </p>
        <div class="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Varování:</strong> Tato akce je nevratná!
            </span>
          </div>
        </div>
        <div class="flex gap-3">
          <button onclick="potvrditSmazaniSazby()" 
                  class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition font-medium">
            Ano, smazat sazbu
          </button>
          <button onclick="zavritSmazatSazbuPopup()" 
                  class="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition">
            Zrušit
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
  
  // Přidej event listener pro zavření při kliknutí na overlay
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      zavritSmazatSazbuPopup();
    }
  });
}

function zavritSmazatSazbuPopup() {
  const popup = document.getElementById('smazatSazbuPopup');
  if (popup) {
    popup.remove();
  }
}

async function potvrditSmazaniSazby() {
  // Reset hodnot
  hodinovaSazba = 0;
  danovaSazba = 21;
  
  // Vyčisti input fieldy
  document.getElementById('hodinovaSazba').value = '';
  document.getElementById('danovaSazba').value = 21;
  
  // Smaž z Firebase
  if (currentUser) {
    try {
      await db.collection('users').doc(currentUser.uid).update({
        hodinovaSazba: firebase.firestore.FieldValue.delete(),
        danovaSazba: firebase.firestore.FieldValue.delete(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Sazba smazána z cloudu');
    } catch (error) {
      console.error('Chyba při mazání sazby z cloudu:', error);
      zobrazitNotifikaci('Chyba při mazání z cloudu, data smazána lokálně', 'warning');
    }
  }
  
  // Smaž z localStorage
  localStorage.removeItem('hodinovaSazba');
  localStorage.removeItem('danovaSazba');
  
  updateVydelekDisplay();
  zavritSmazatSazbuPopup();
  zobrazitNotifikaci('Sazba byla smazána', 'success');
}

// Změň onclick v HTML na zobrazitSmazatSazbuPopup()
function smazatSazbu() {
  zobrazitSmazatSazbuPopup();
}

console.log('✅ Earnings module loaded successfully');