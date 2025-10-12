# Marv140 Portfolio - Kompletní React Aplikace

Všechny stránky byly **úspěšně převedeny** na moderní React s TypeScript!

## ✅ Hotovo - Všechny aplikace v React

### 🎨 Hlavní Portfolio
- **Home Page** - Moderní portfolio s animacemi
- Framer Motion přechody
- Dark mode
- Responzivní design

### 🎮 Plně funkční aplikace (100% TSX)

1. **TicTacToe 15x15** 
   - Kompletní hra piškvorky
   - Detekce výhry (5 v řadě)
   - Počítání skóre
   - Animace

2. **Work Hours Tracker**
   - Firebase autentizace
   - Firestore databáze
   - Chart.js grafy
   - Export/Import TXT
   - Výpočet výdělku

3. **Excel Comparator**
   - Porovnání Excel souborů
   - Export rozdílů
   - XLSX parsing

4. **Image to WEBP Converter**
   - Konverze JPG/PNG na WEBP
   - Canvas API
   - Okamžitý download

5. **MHD Guesser**
   - Hra na hádání měst podle MHD
   - 100+ obrázků tramvají a autobusů
   - Gamifikace

6. **Code Guesser**
   - Hádání programovacích jazyků
   - 15+ různých jazyků
   - Mastermind-style logika

7. **Motol Projects**
   - Přehled školních projektů
   - Moderní grid layout
   - Zoom efekty

## 🚀 Jak spustit

### 1. Instalace
```bash
npm install
```

### 2. Development
```bash
npm run dev
```
Server běží na `http://localhost:5173`

### 3. Build
```bash
npm run build
```

### 4. Preview produkce
```bash
npm run preview
```

## 📦 Technologie

### Core
- **React 18.2** - UI framework
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Bleskurychlý build
- **React Router 6.21** - SPA routing

### Styling & Animace
- **Tailwind CSS 3.4** - Utility-first CSS
- **Framer Motion 10.18** - Animace
- **Lucide React 0.303** - Ikony

### Speciální knihovny
- **Firebase 10.7** - Auth & Firestore
- **Chart.js 4.4** + **react-chartjs-2 5.2** - Grafy
- **XLSX 0.18** - Excel parsing

## 📁 Struktura

```
src/
├── pages/              # Všechny stránky jako TSX
│   ├── Home.tsx
│   ├── TicTacToe.tsx
│   ├── WorkHours.tsx
│   ├── ExcelComp.tsx
│   ├── ImageConverter.tsx
│   ├── MHDGuesser.tsx
│   ├── CodeGuesser.tsx
│   └── MotolProjects.tsx
├── components/         # Sdílené komponenty
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── Projects.tsx
│   ├── ProjectCard.tsx
│   └── Footer.tsx
├── data/              # Data soubory
│   ├── projects.tsx
│   └── mhd_images.ts
├── types.tsx          # TypeScript typy
├── App.tsx            # Routing
├── main.tsx           # Entry point
└── index.css          # Tailwind import
```

## 🎯 Features

### Navigace
- ✅ React Router SPA navigace
- ✅ Zpětné odkazy na homepage
- ✅ Dark mode napříč všemi stránkami

### Animace
- ✅ Framer Motion na všech stránkách
- ✅ Hover efekty
- ✅ Page transitions
- ✅ Scroll animace

### Styling
- ✅ Tailwind CSS utility classes
- ✅ Responzivní design (mobile-first)
- ✅ Dark mode s localStorage
- ✅ Gradienty a glassmorphism

## 🔥 Co je nového oproti HTML verzím

### Performance
- **Single Page Application** - Žádné reloady stránek
- **Code splitting** - Lazy loading komponent
- **Optimalizované bundle** - Menší velikost

### Developer Experience
- **TypeScript** - Plná typová bezpečnost
- **Hot Module Replacement** - Okamžité změny během vývoje
- **Component reuse** - Sdílené komponenty (Navbar, Footer)

### User Experience  
- **Plynulé přechody** - Framer Motion animace
- **Rychlejší navigace** - SPA routing
- **Konzistentní design** - Jednotný look napříč aplikací

## 📝 Poznámky

### Firebase Configuration
Pro Work Hours je potřeba nastavit Firebase:
1. Vytvořte projekt na [Firebase Console](https://console.firebase.google.com/)
2. Přidejte konfiguraci do WorkHours.tsx
3. Nastavte Firestore pravidla

### Původní HTML soubory
Původní HTML soubory zůstávají zachovány v root složce pro zpětnou kompatibilitu:
- `tictactoe.html`
- `work-hours.html`
- `excel-comp.html`
- `img-to-webp.html`
- `mhd-guesser.html`
- `code-guesser.html`
- `motol-projects.html`

## 🎨 Customizace

### Přidání nového projektu
Edituj `src/data/projects.tsx`:
```typescript
{
  title: "Nový projekt",
  description: "Popis",
  url: "/nova-stranka",
  icon: "🎨",
  tags: ["Tag1", "Tag2"],
  gradient: "from-blue-400 to-purple-600"
}
```

### Změna barev
Upravte `tailwind.config.js` nebo použijte Tailwind utility classes přímo v komponentách.

## 🚢 Deploy

### GitHub Pages
```bash
npm run build
# Deploy obsah dist/ složky
```

### Vercel / Netlify
Připojte GitHub repo a build se spustí automaticky!

## 📄 License

MIT © 2025 Marv140

---

**Status:** ✅ Všechny stránky převedeny na React TSX  
**Poslední update:** 2025-10-12  
**Verze:** 2.0.0 - Kompletní React rewrite
