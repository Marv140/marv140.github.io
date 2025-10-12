# Marv140 Portfolio - Modern React Application

Kompletně předělaná modern React aplikace s TypeScript, Tailwind CSS a Framer Motion.

## Co je nového?

### ✅ Hotovo
- **React 18** s TypeScript a plným type safety
- **React Router** pro navigaci mezi stránkami
- **Framer Motion** pro plynulé animace
- **Tailwind CSS** pro moderní styling
- **Vite** pro bleskurychlý development
- **Dark Mode** s plnou podporou
- **Responzivní design** pro všechna zařízení

### 🎮 Plně funkční aplikace
- **TicTacToe 15x15** - kompletně přepsáno v React s animacemi
- **Home Page** - moderní portfolio s projekty

### 📦 Placeholder stránky (připravené na rozvoj)
- Excel Comparator
- Image to WEBP Converter
- Work Hours Tracker
- Motol Projects
- MHD Guesser
- Code Guesser

Tyto stránky mají připravený layout a lze je kdykoliv rozšířit o plnou funkčnost.

## Jak spustit

### 1. Instalace závislostí
```bash
npm install
```

### 2. Spuštění dev serveru
```bash
npm run dev
```
Server poběží na `http://localhost:5173`

### 3. Build pro produkci
```bash
npm run build
```

### 4. Preview produkčního buildu
```bash
npm run preview
```

## Struktura projektu

```
marv140.github.io/
├── src/
│   ├── pages/               # React stránky
│   │   ├── Home.tsx         # Hlavní portfolio
│   │   ├── TicTacToe.tsx    # Piškvorky (plně funkční)
│   │   ├── ExcelComp.tsx    # Placeholder
│   │   ├── ImageConverter.tsx
│   │   ├── WorkHours.tsx
│   │   ├── MotolProjects.tsx
│   │   ├── MHDGuesser.tsx
│   │   └── CodeGuesser.tsx
│   ├── components/          # React komponenty
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectCard.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── projects.tsx     # Data projektů
│   ├── types.tsx            # TypeScript typy
│   ├── App.tsx              # Hlavní app s routingem
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind import
├── index.html               # HTML template pro React
├── vite.config.ts           # Vite konfigurace
├── tailwind.config.js       # Tailwind konfigurace
├── tsconfig.json            # TypeScript konfigurace
└── package.json             # Dependencies

Původní HTML soubory zůstávají zachovány:
├── tictactoe.html
├── excel-comp.html
├── img-to-webp.html
├── work-hours.html
├── motol-projects.html
├── mhd-guesser.html
└── code-guesser.html
```

## Co dál?

### Rozšíření placeholder stránek
Každá placeholder stránka má připravený layout. Pro přidání funkčnosti:
1. Otevři soubor v `src/pages/`
2. Přidej state management pomocí `useState`
3. Implementuj logiku (můžeš použít kód z původních HTML souborů)
4. Přidej komponenty dle potřeby

### Příklad - WorkHours
```typescript
// V src/pages/WorkHours.tsx
const [hours, setHours] = useState<WorkEntry[]>([]);
// ... přidej logiku
```

## Technologie

- **React 18.2** - UI framework
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool
- **React Router 6.21** - Routing
- **Tailwind CSS 3.4** - Styling
- **Framer Motion 10.18** - Animace
- **Lucide React 0.303** - Ikony

## Features

### Navigace
- React Router zajišťuje plynulou navigaci
- Každá stránka má zpětný odkaz na homepage
- Dark mode funkční napříč celou aplikací

### Animace
- Framer Motion pro plynulé přechody
- Hover efekty na kartách
- Scroll animace
- Page transitions

### Styling
- Tailwind CSS utility classes
- Responzivní design
- Dark mode s přepínačem
- Gradienty a glassmorphism efekty

## Poznámky

- Původní HTML soubory jsou zachovány pro zpětnou kompatibilitu
- Všechny nové stránky jsou v React/TSX
- Portfolio karty nyní odkazují na React routy
- TicTacToe je plně funkční v React s animacemi

## License

MIT © Marv140
