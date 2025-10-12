import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Download,
  Upload,
  Settings,
  Filter,
  X,
  Trash2,
  Edit,
  Save,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  LogOut,
  User,
  AlertTriangle,
  Check,
  Info,
  XCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAWf_m_ZSzHI-DpjMbbEp8LhgtZznHRFgY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "work-hours-7c4a9.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "work-hours-7c4a9",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "work-hours-7c4a9.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "590898483993",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:590898483993:web:923f5d226a432baac66b88"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface WorkRecord {
  od: string;
  do: string;
  odRaw: string;
  doRaw: string;
  hodin: number;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

const WorkHours: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [zaznamy, setZaznamy] = useState<WorkRecord[]>([]);
  const [limitHodin, setLimitHodin] = useState(0);
  const [aktualniFiltr, setAktualniFiltr] = useState<string | null>(null);
  const [hodinovaSazba, setHodinovaSazba] = useState(0);
  const [danovaSazba, setDanovaSazba] = useState(21);

  const [odInput, setOdInput] = useState('');
  const [doInput, setDoInput] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [filtrMesic, setFiltrMesic] = useState('');
  const [sazbaInput, setSazbaInput] = useState('');
  const [danInput, setDanInput] = useState('21');

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editOd, setEditOd] = useState('');
  const [editDo, setEditDo] = useState('');

  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showDeleteRate, setShowDeleteRate] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIdRef = useRef(0);
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'nahradit' | 'pridat'>('nahradit');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadDataFromCloud(currentUser);
      } else {
        loadDataFromLocal();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && user) {
      updateDisplay();
    }
  }, [zaznamy, limitHodin, aktualniFiltr, hodinovaSazba, danovaSazba, loading, user]);

  const showNotification = (message: string, type: NotificationType = 'info', duration = 3000) => {
    const id = notificationIdRef.current++;
    setNotifications(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
  };

  const loadDataFromLocal = () => {
    const saved = localStorage.getItem('workHours');
    const savedLimit = localStorage.getItem('workHoursLimit');
    const savedFilter = localStorage.getItem('workHoursFilter');
    const savedSazba = localStorage.getItem('hodinovaSazba');
    const savedDan = localStorage.getItem('danovaSazba');

    if (saved) setZaznamy(JSON.parse(saved));
    if (savedLimit) {
      setLimitHodin(parseFloat(savedLimit));
      setLimitInput(savedLimit);
    }
    if (savedFilter) {
      setAktualniFiltr(savedFilter);
      setFiltrMesic(savedFilter);
    }
    if (savedSazba) {
      setHodinovaSazba(parseFloat(savedSazba));
      setSazbaInput(savedSazba);
    }
    if (savedDan) {
      setDanovaSazba(parseFloat(savedDan));
      setDanInput(savedDan);
    }
  };

  const saveDataToLocal = () => {
    localStorage.setItem('workHours', JSON.stringify(zaznamy));
    localStorage.setItem('workHoursLimit', limitHodin.toString());
    if (aktualniFiltr) {
      localStorage.setItem('workHoursFilter', aktualniFiltr);
    }
    localStorage.setItem('hodinovaSazba', hodinovaSazba.toString());
    localStorage.setItem('danovaSazba', danovaSazba.toString());
  };

  const loadDataFromCloud = async (currentUser: FirebaseUser) => {
    if (!currentUser) return;

    try {
      const docRef = doc(db, 'workHours', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setZaznamy(data.zaznamy || []);
        setLimitHodin(data.limitHodin || 0);
        setLimitInput((data.limitHodin || 0).toString());
        setAktualniFiltr(data.aktualniFiltr || null);
        setFiltrMesic(data.aktualniFiltr || '');
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.hodinovaSazba !== undefined) {
          setHodinovaSazba(userData.hodinovaSazba);
          setSazbaInput(userData.hodinovaSazba.toString());
        }
        if (userData.danovaSazba !== undefined) {
          setDanovaSazba(userData.danovaSazba);
          setDanInput(userData.danovaSazba.toString());
        }
      }
    } catch (error) {
      console.error('Error loading from cloud:', error);
      loadDataFromLocal();
    }
  };

  const saveDataToCloud = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, 'workHours', user.uid);
      await setDoc(docRef, {
        zaznamy,
        limitHodin,
        aktualniFiltr,
        updatedAt: serverTimestamp(),
        userEmail: user.email
      });
    } catch (error) {
      console.error('Error saving to cloud:', error);
      showNotification('Chyba při ukládání do cloudu', 'error');
    }
  };

  const universalSave = () => {
    saveDataToLocal();
    if (user) {
      saveDataToCloud();
    }
  };

  const formatHHMM = (hodin: number): string => {
    const celkemMinut = Math.round(hodin * 60);
    const h = Math.floor(celkemMinut / 60);
    const m = celkemMinut % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  };

  const getISOWeek = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };

  const localStringToDate = (localString: string): Date => {
    const fullString = localString.length === 16 ? localString + ':00' : localString;
    return new Date(fullString);
  };

  const filtrujZaznamy = (): WorkRecord[] => {
    if (!aktualniFiltr) return zaznamy;
    return zaznamy.filter(z => {
      const den = z.odRaw.split('T')[0];
      const rokMesic = den.substring(0, 7);
      return rokMesic === aktualniFiltr;
    });
  };

  const pridatZaznam = () => {
    if (!odInput || !doInput) {
      showNotification('Vyplňte prosím oba časy', 'warning');
      return;
    }

    const odDate = localStringToDate(odInput);
    const doDate = localStringToDate(doInput);

    if (doDate <= odDate) {
      showNotification('Čas "Do" musí být později než čas "Od"', 'error');
      return;
    }

    const hodin = (doDate.getTime() - odDate.getTime()) / (1000 * 60 * 60);

    const newZaznamy = [...zaznamy, {
      od: odDate.toLocaleString('cs-CZ'),
      do: doDate.toLocaleString('cs-CZ'),
      odRaw: odInput,
      doRaw: doInput,
      hodin
    }];

    newZaznamy.sort((a, b) => new Date(a.odRaw).getTime() - new Date(b.odRaw).getTime());
    setZaznamy(newZaznamy);
    setOdInput('');
    setDoInput('');
    showNotification(`Záznam přidán: ${formatHHMM(hodin)} hodin`, 'success');
  };

  const updateDisplay = () => {
    // This will trigger re-render automatically
  };

  const nastavitLimit = async () => {
    const novyLimit = parseFloat(limitInput);
    if (isNaN(novyLimit) || novyLimit < 0) {
      showNotification('Zadejte platný limit hodin', 'warning');
      return;
    }

    setLimitHodin(novyLimit);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          limit: novyLimit
        }, { merge: true });
      } catch (error) {
        console.error('Error saving limit:', error);
      }
    }

    showNotification(`Limit nastaven na ${formatHHMM(novyLimit)} hodin`, 'success');
  };

  const aplikovatFiltr = () => {
    if (!filtrMesic) {
      showNotification('Vyberte měsíc pro filtrování', 'warning');
      return;
    }
    setAktualniFiltr(filtrMesic);
    showNotification(`Filtr aplikován pro ${filtrMesic}`, 'info');
  };

  const zrusitFiltr = () => {
    setAktualniFiltr(null);
    setFiltrMesic('');
    showNotification('Filtr zrušen', 'info');
  };

  const exportovat = () => {
    if (zaznamy.length === 0) {
      showNotification('Žádné záznamy k exportu', 'warning');
      return;
    }

    const data = filtrujZaznamy();
    const celkemHodin = data.reduce((s, z) => s + z.hodin, 0);

    let obsah = "Evidence pracovních hodin\n";
    obsah += "========================\n\n";

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

    const blob = new Blob([obsah], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const today = new Date();
    const dateString = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    a.download = `pracovni_hodiny_${dateString}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification(`Export dokončen: ${data.length} záznamů (${formatHHMM(celkemHodin)})`, 'success', 4000);
  };

  const importovat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const obsah = event.target?.result as string;
      const radky = obsah.split('\n');

      const importovaneZaznamy: WorkRecord[] = [];

      radky.forEach(radek => {
        radek = radek.trim();
        if (!radek) return;

        const novyFormat = radek.match(/^\d+\.\s+(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})\s*\|\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
        const staryFormat = radek.match(/(\d{1,2}\.\d{1,2}\.\d{4},?\s+\d{1,2}:\d{2}:\d{2})\s*-\s*(\d{1,2}\.\d{1,2}\.\d{4},?\s+\d{1,2}:\d{2}:\d{2})/);

        try {
          let odDate: Date, doDate: Date, odRaw: string, doRaw: string;

          if (novyFormat) {
            const odStr = novyFormat[1];
            const doStr = novyFormat[2];

            odDate = localStringToDate(odStr);
            doDate = localStringToDate(doStr);

            odRaw = odStr;
            doRaw = doStr;
          } else if (staryFormat) {
            const odStr = staryFormat[1].replace(',', '');
            const doStr = staryFormat[2].replace(',', '');

            const odParts = odStr.split(' ');
            const odDatum = odParts[0].split('.').reverse().join('-');
            const odCas = odParts[1].slice(0, 5);

            const doParts = doStr.split(' ');
            const doDatum = doParts[0].split('.').reverse().join('-');
            const doCas = doParts[1].slice(0, 5);

            const odLocal = `${odDatum}T${odCas}`;
            const doLocal = `${doDatum}T${doCas}`;

            odDate = localStringToDate(odLocal);
            doDate = localStringToDate(doLocal);

            odRaw = odLocal;
            doRaw = doLocal;
          } else {
            return;
          }

          if (odDate && doDate && !isNaN(odDate.getTime()) && !isNaN(doDate.getTime()) && doDate > odDate) {
            const hodin = (doDate.getTime() - odDate.getTime()) / (1000 * 60 * 60);

            importovaneZaznamy.push({
              od: odDate.toLocaleString('cs-CZ'),
              do: doDate.toLocaleString('cs-CZ'),
              odRaw,
              doRaw,
              hodin
            });
          }
        } catch (err) {
          console.error('Error parsing line:', radek, err);
        }
      });

      if (importovaneZaznamy.length === 0) {
        showNotification('V souboru nebyly nalezeny žádné platné záznamy', 'error', 5000);
        return;
      }

      importovaneZaznamy.sort((a, b) => new Date(a.odRaw).getTime() - new Date(b.odRaw).getTime());

      let newZaznamy: WorkRecord[];
      if (importMode === 'nahradit') {
        newZaznamy = importovaneZaznamy;
      } else {
        newZaznamy = [...zaznamy, ...importovaneZaznamy];
        newZaznamy.sort((a, b) => new Date(a.odRaw).getTime() - new Date(b.odRaw).getTime());
      }

      setZaznamy(newZaznamy);

      const celkemHodin = importovaneZaznamy.reduce((sum, z) => sum + z.hodin, 0);
      showNotification(`Importováno ${importovaneZaznamy.length} záznamů (${formatHHMM(celkemHodin)})`, 'success', 4000);
    };

    reader.onerror = () => {
      showNotification('Chyba při čtení souboru, zkuste to znovu', 'error');
    };

    reader.readAsText(file, 'utf-8');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ulozitZaznamUpravy = () => {
    if (editingIndex === null) return;

    if (!editOd || !editDo) {
      showNotification('Vyplňte prosím oba časy', 'warning');
      return;
    }

    const odDate = localStringToDate(editOd);
    const doDate = localStringToDate(editDo);

    if (doDate <= odDate) {
      showNotification('Čas "Do" musí být později než čas "Od"', 'error');
      return;
    }

    const hodin = (doDate.getTime() - odDate.getTime()) / (1000 * 60 * 60);

    const newZaznamy = [...zaznamy];
    newZaznamy[editingIndex] = {
      od: odDate.toLocaleString('cs-CZ'),
      do: doDate.toLocaleString('cs-CZ'),
      odRaw: editOd,
      doRaw: editDo,
      hodin
    };

    setZaznamy(newZaznamy);
    setEditingIndex(null);
    showNotification(`Záznam upraven: ${formatHHMM(hodin)} hodin`, 'success');
  };

  const potvrditSmazani = () => {
    if (deleteIndex === null) return;
    const newZaznamy = [...zaznamy];
    newZaznamy.splice(deleteIndex, 1);
    setZaznamy(newZaznamy);
    setDeleteIndex(null);
  };

  const potvrditSmazaniVsech = () => {
    const pocet = zaznamy.length;
    setZaznamy([]);
    setShowDeleteAll(false);
    showNotification(`Úspěšně smazáno všech ${pocet} záznamů`, 'success');
  };

  const pouzitStejneDatum = () => {
    if (!odInput) {
      showNotification('Nejprve vyplňte pole "Od"', 'warning');
      return;
    }

    const rokMesicDen = odInput.split('T')[0];

    if (doInput) {
      const existujiciCas = doInput.split('T')[1];
      setDoInput(rokMesicDen + 'T' + existujiciCas);
    } else {
      setDoInput(rokMesicDen + 'T00:00');
    }

    showNotification(`Datum zkopírováno: ${rokMesicDen}`, 'info');
  };

  const nastavitSazbu = async () => {
    const novaSazba = parseFloat(sazbaInput) || 0;
    const novaDan = parseFloat(danInput) || 21;

    if (novaSazba < 0) {
      showNotification('Hodinová sazba nemůže být záporná.', 'error');
      return;
    }

    if (novaDan < 0 || novaDan > 100) {
      showNotification('Daňové zatížení musí být mezi 0 a 100%', 'error');
      return;
    }

    setHodinovaSazba(novaSazba);
    setDanovaSazba(novaDan);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          hodinovaSazba: novaSazba,
          danovaSazba: novaDan,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error saving rate:', error);
        showNotification('Chyba při ukládání do cloudu, data uložena lokálně', 'warning');
      }
    }

    localStorage.setItem('hodinovaSazba', novaSazba.toString());
    localStorage.setItem('danovaSazba', novaDan.toString());

    showNotification(`Sazba nastavena: ${novaSazba} Kč/hod, daň ${novaDan}%`, 'success');
  };

  const potvrditSmazaniSazby = async () => {
    setHodinovaSazba(0);
    setDanovaSazba(21);
    setSazbaInput('');
    setDanInput('21');

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          hodinovaSazba: deleteField(),
          danovaSazba: deleteField(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error deleting rate:', error);
        showNotification('Chyba při mazání z cloudu, data smazána lokálně', 'warning');
      }
    }

    localStorage.removeItem('hodinovaSazba');
    localStorage.removeItem('danovaSazba');

    setShowDeleteRate(false);
    showNotification('Sazba byla smazána', 'success');
  };

  const exportGraf = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graf_hodin.png';
      a.click();
      showNotification('Graf byl exportován jako obrázek', 'success');
    } else {
      showNotification('Graf není k dispozici', 'warning');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      showNotification('Vyplňte prosím email a heslo.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setLoginEmail('');
      setLoginPassword('');
      showNotification(`Vítejte zpět, ${userCredential.user.email}!`, 'success', 3000);
    } catch (error: any) {
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
      showNotification(errorMessage, 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName || !regEmail || !regPassword) {
      showNotification('Vyplňte prosím všechna pole.', 'warning');
      return;
    }

    if (regPassword.length < 6) {
      showNotification('Heslo musí mít alespoň 6 znaků.', 'warning');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      await updateProfile(userCredential.user, { displayName: regName });

      setRegName('');
      setRegEmail('');
      setRegPassword('');
      showNotification(`Úspěšně registrováno! Vítejte, ${regName}!`, 'success', 4000);
    } catch (error: any) {
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
      showNotification(errorMessage, 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showNotification('Úspěšně odhlášeno.', 'info', 2000);
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Chyba při odhlašování.', 'error', 4000);
    }
  };

  useEffect(() => {
    if (user) {
      universalSave();
    }
  }, [zaznamy, limitHodin, aktualniFiltr]);

  const data = filtrujZaznamy();
  let celkem = 0;
  const poDnech: { [key: string]: number } = {};
  const poTydnech: { [key: string]: number } = {};

  data.forEach(z => {
    celkem += z.hodin;
    const den = z.odRaw.split('T')[0];
    const d = new Date(z.odRaw);
    const tyden = `${d.getFullYear()}-W${String(getISOWeek(d)).padStart(2, '0')}`;
    poDnech[den] = (poDnech[den] || 0) + z.hodin;
    poTydnech[tyden] = (poTydnech[tyden] || 0) + z.hodin;
  });

  const dnu = Object.keys(poDnech).length;
  const prumer = dnu ? celkem / dnu : 0;

  const celkemHodin = celkem;
  const hruby = celkemHodin * hodinovaSazba;
  const cisty = hruby * (1 - danovaSazba / 100);

  const chartLabels = Object.keys(poDnech).sort();
  const chartData = chartLabels.map(den => poDnech[den]);

  const chartConfig = {
    labels: chartLabels,
    datasets: [{
      label: 'Hodiny',
      data: chartData,
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderWidth: 2,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatHHMM(value as number);
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Hodiny: ${formatHHMM(context.parsed.y)}`;
          }
        }
      }
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch(type) {
      case 'success': return <Check className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColors = (type: NotificationType) => {
    switch(type) {
      case 'success': return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200';
      case 'error': return 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200';
      default: return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Načítám...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <AnimatePresence mode="wait">
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border max-w-sm ${getNotificationColors(notif.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{notif.message}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                  className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-4"
        >
          <h1 className="text-4xl font-bold text-center mb-2">Evidence pracovních hodin</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Přihlaste se pro pokračování</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md"
        >
          {showLogin ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Přihlášení</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="loginEmail" className="block font-medium mb-2">Email:</label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="loginPassword" className="block font-medium mb-2">Heslo:</label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition font-medium mb-4"
                >
                  Přihlásit se
                </button>
              </form>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Nemáte účet?
                <button onClick={() => setShowLogin(false)} className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
                  Zaregistrujte se
                </button>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Registrace</h2>
              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label htmlFor="regName" className="block font-medium mb-2">Jméno:</label>
                  <input
                    type="text"
                    id="regName"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="regEmail" className="block font-medium mb-2">Email:</label>
                  <input
                    type="email"
                    id="regEmail"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="regPassword" className="block font-medium mb-2">Heslo:</label>
                  <input
                    type="password"
                    id="regPassword"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition font-medium mb-4"
                >
                  Zaregistrovat se
                </button>
              </form>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Už máte účet?
                <button onClick={() => setShowLogin(true)} className="text-indigo-600 hover:text-indigo-700 font-medium ml-1">
                  Přihlaste se
                </button>
              </p>
            </div>
          )}
        </motion.div>

        <footer className="text-center py-6 text-gray-500 mt-8">
          &copy; 2025 Marv140. All rights reserved. Cloud provided by <a href="https://firebase.google.com/" className="text-indigo-600 hover:text-indigo-700">Firebase</a>.
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {notifications.map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border max-w-sm ${getNotificationColors(notif.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notif.message}</p>
              </div>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {editingIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setEditingIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold mb-4">Upravit záznam</h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold mb-2">Od:</label>
                  <input
                    type="datetime-local"
                    value={editOd}
                    onChange={(e) => setEditOd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Do:</label>
                  <input
                    type="datetime-local"
                    value={editDo}
                    onChange={(e) => setEditDo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={ulozitZaznamUpravy}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded transition"
                  >
                    Uložit
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setDeleteIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smazat záznam?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Opravdu chcete smazat tento záznam?<br />
                  <strong>{formatHHMM(zaznamy[deleteIndex].hodin)}</strong>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={potvrditSmazani}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
                  >
                    Ano, smazat
                  </button>
                  <button
                    onClick={() => setDeleteIndex(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setShowDeleteAll(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smazat všechny záznamy?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Opravdu chcete smazat všech <strong>{zaznamy.length}</strong> záznamů?<br />
                  <span className="text-sm">Celkem {formatHHMM(celkem)} odpracovaných hodin</span>
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Varování:</strong> Tato akce je nevratná!
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={potvrditSmazaniVsech}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition font-medium"
                  >
                    Ano, smazat vše
                  </button>
                  <button
                    onClick={() => setShowDeleteAll(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteRate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.target === e.currentTarget && setShowDeleteRate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smazat sazbu?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Opravdu chcete smazat nastavenou hodinovou sazbu a daňové zatížení?<br />
                  <strong>Tato akce je nevratná</strong> a smaže data jak z cloudu, tak z místního úložiště.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Varování:</strong> Tato akce je nevratná!
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={potvrditSmazaniSazby}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition font-medium"
                  >
                    Ano, smazat sazbu
                  </button>
                  <button
                    onClick={() => setShowDeleteRate(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mb-4 flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <ArrowLeft className="w-8 h-8" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold">Evidence pracovních hodin</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cloudové úložiště</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition text-sm flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Odhlásit se
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-4xl"
        >
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[12rem]">
                <label htmlFor="od" className="block font-semibold mb-2">Od:</label>
                <input
                  type="datetime-local"
                  id="od"
                  value={odInput}
                  onChange={(e) => setOdInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 h-10"
                />
              </div>
              <div className="flex-1 min-w-[12rem]">
                <label htmlFor="do" className="block font-semibold mb-2">Do:</label>
                <input
                  type="datetime-local"
                  id="do"
                  value={doInput}
                  onChange={(e) => setDoInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 h-10"
                />
              </div>
              <button
                onClick={pouzitStejneDatum}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded transition h-10 whitespace-nowrap flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Stejné datum
              </button>
              <button
                onClick={pridatZaznam}
                className="bg-green-600 hover:bg-green-700 text-white px-4 rounded transition h-10 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Přidat
              </button>
              <button
                onClick={exportovat}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded transition h-10 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportovat TXT
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="block font-semibold mb-2">Importovat ze souboru:</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[12rem]">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt"
                  onChange={importovat}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 h-10 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="importMode"
                    value="nahradit"
                    checked={importMode === 'nahradit'}
                    onChange={(e) => setImportMode(e.target.value as 'nahradit' | 'pridat')}
                    className="text-indigo-600"
                  />
                  <span>Nahradit záznamy</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="importMode"
                    value="pridat"
                    checked={importMode === 'pridat'}
                    onChange={(e) => setImportMode(e.target.value as 'nahradit' | 'pridat')}
                    className="text-indigo-600"
                  />
                  <span>Přidat ke stávajícím</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[12rem]">
                <label htmlFor="limit" className="block font-semibold mb-2">Limit hodin:</label>
                <input
                  type="number"
                  id="limit"
                  step="0.01"
                  placeholder="např. 40"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 h-10"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Zadejte jedno číslo v hodinách (např. 40 pro 40 hodin)</p>
              </div>
              <button
                onClick={nastavitLimit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded transition h-10 self-start mt-8 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Nastavit
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[12rem]">
                <label htmlFor="filtrMesic" className="block font-semibold mb-2">Filtrovat měsíc:</label>
                <input
                  type="month"
                  id="filtrMesic"
                  value={filtrMesic}
                  onChange={(e) => setFiltrMesic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 h-10"
                />
              </div>
              <button
                onClick={aplikovatFiltr}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded transition h-10 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtrovat
              </button>
              <button
                onClick={zrusitFiltr}
                className="bg-red-600 hover:bg-red-700 text-white px-4 rounded transition h-10 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Zrušit filtr
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Statistiky</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-600 p-3 rounded"
              >
                <div className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Celkem hodin:
                </div>
                <div className={`text-lg ${limitHodin && celkem > limitHodin ? 'text-red-600 dark:text-red-400 font-bold' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {formatHHMM(celkem)}
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-600 p-3 rounded"
              >
                <div className="font-semibold">Zbývá do limitu:</div>
                <div className="text-lg text-indigo-600 dark:text-indigo-400">{formatHHMM(Math.max(0, limitHodin - celkem))}</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-600 p-3 rounded"
              >
                <div className="font-semibold">Průměr za den:</div>
                <div className="text-lg text-indigo-600 dark:text-indigo-400">{formatHHMM(prumer)}</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-600 p-3 rounded"
              >
                <div className="font-semibold">Týdenní součty:</div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">
                  {Object.entries(poTydnech).map(([tyden, hod]) => `${tyden}: ${formatHHMM(hod)}`).join(', ')}
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Záznamy
              </h3>
              <button
                onClick={() => setShowDeleteAll(true)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Smazat vše
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto p-2">
              <AnimatePresence>
                {data.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-600 p-8 rounded-lg border border-gray-300 dark:border-gray-500 text-center"
                  >
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <h4 className="text-lg font-medium mb-1">Žádné záznamy</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Přidejte první záznam práce pomocí formuláře výše</p>
                  </motion.div>
                ) : (
                  data.map((z, i) => {
                    const odDate = localStringToDate(z.odRaw);
                    const doDate = localStringToDate(z.doRaw);
                    const formatovanyDatum = odDate.toLocaleDateString('cs-CZ', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                    const odCas = odDate.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'});
                    const doCas = doDate.toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'});

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.02 }}
                        className="bg-white dark:bg-gray-600 p-4 rounded-lg border border-gray-300 dark:border-gray-500 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded border">
                                {formatovanyDatum}
                              </div>
                            </div>
                            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                              {odCas} - {doCas}
                            </div>
                            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                              Délka: {formatHHMM(z.hodin)}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingIndex(zaznamy.indexOf(z));
                                setEditOd(z.odRaw);
                                setEditDo(z.doRaw);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Upravit
                            </button>
                            <button
                              onClick={() => setDeleteIndex(zaznamy.indexOf(z))}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Smazat
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Výdělek
            </h3>

            <div className="mb-4 p-4 bg-white dark:bg-gray-600 rounded-lg">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[12rem]">
                  <label htmlFor="hodinovaSazba" className="block font-semibold mb-2">Hodinová sazba (Kč):</label>
                  <input
                    type="number"
                    id="hodinovaSazba"
                    step="0.01"
                    placeholder="např. 300"
                    value={sazbaInput}
                    onChange={(e) => setSazbaInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 h-10"
                  />
                </div>
                <div className="flex-1 min-w-[12rem]">
                  <label htmlFor="danovaSazba" className="block font-semibold mb-2">Daňová sazba (%):</label>
                  <input
                    type="number"
                    id="danovaSazba"
                    step="0.1"
                    placeholder="např. 21"
                    value={danInput}
                    onChange={(e) => setDanInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 h-10"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={nastavitSazbu}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 rounded transition h-10 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Nastavit
                  </button>
                  <button
                    onClick={() => setShowDeleteRate(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 rounded transition h-10 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Smazat
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Sazba se uloží do cloudu a bude použita pro výpočet výdělku</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-600 p-4 rounded-lg"
              >
                <div className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Hrubý výdělek:</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(hruby)} Kč</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {hodinovaSazba} Kč/hod × {celkemHodin.toFixed(1)} hod
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-600 p-4 rounded-lg"
              >
                <div className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Čistý výdělek:</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round(cisty)} Kč</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Po odečtení {danovaSazba}% daně
                </div>
              </motion.div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Graf hodin
            </h3>
            <div className="bg-white dark:bg-gray-600 p-4 rounded mb-4" style={{ height: '300px' }}>
              <Line ref={chartRef} data={chartConfig} options={chartOptions} />
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={exportGraf}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportovat graf
              </button>
            </div>
          </div>

        </motion.div>
      </div>

      <footer className="text-center py-6 text-gray-500">
        &copy; 2025 Marv140. All rights reserved. Cloud provided by <a href="https://firebase.google.com/" className="text-indigo-600 hover:text-indigo-700">Firebase</a>.
      </footer>
    </div>
  );
};

export default WorkHours;
