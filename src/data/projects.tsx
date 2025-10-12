import type { Project } from '../types';

export const projects: Project[] = [
  {
    title: "Excel Comparator",
    description: "Porovnejte dva Excel soubory a najděte rozdíly mezi nimi. Praktický nástroj pro práci s tabulkami.",
    url: "/excel-comp",
    icon: "📊",
    tags: ["Utility", "Excel"],
    gradient: "from-green-400 to-emerald-600"
  },
  {
    title: "JPG/PNG to WEBP",
    description: "Převádějte obrázky do moderního WEBP formátu. Rychlé, jednoduché a efektivní.",
    url: "/img-to-webp",
    icon: "🖼️",
    tags: ["Converter", "Images"],
    gradient: "from-blue-400 to-cyan-600"
  },
  {
    title: "Work Hours",
    description: "Jednoduše sledujte své pracovní hodiny. Přehledné a intuitivní rozhraní.",
    url: "/work-hours",
    icon: "⏰",
    tags: ["Productivity", "Time"],
    gradient: "from-purple-400 to-pink-600"
  },
  {
    title: "Motol Projects",
    description: "Školní projekt zaměřený na prezentaci a správu projektů.",
    url: "/motol-projects",
    icon: "🏫",
    tags: ["School", "Projects"],
    gradient: "from-orange-400 to-red-600"
  },
  {
    title: "Tic Tac Toe",
    description: "Klasická hra piškvorky. Zahrajte si proti počítači nebo kamarádovi.",
    url: "/tictactoe",
    icon: "🎮",
    tags: ["Game", "Fun"],
    gradient: "from-indigo-400 to-purple-600"
  },
  {
    title: "MHD Guesser",
    description: "Hádejte zastávky pražské MHD. Zábavná hra pro znalce Prahy.",
    url: "/mhd-guesser",
    icon: "🚊",
    tags: ["Game", "Prague"],
    gradient: "from-yellow-400 to-orange-600"
  },
  {
    title: "Code Guesser",
    description: "Hádejte kód a otestujte své logické myšlení. Inspirováno hrou Mastermind.",
    url: "/code-guesser",
    icon: "🔐",
    tags: ["Game", "Logic"],
    gradient: "from-teal-400 to-green-600"
  }
];
