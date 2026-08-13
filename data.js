/* Shared data for the tools catalog and games list. Loaded before script.js
   on every page that needs it. Uses root-absolute hrefs so it resolves the
   same whether included from / or from /tools/. */

var CAT_LABEL = {
  text: "Text & Writing",
  developer: "Developer",
  data: "Data Conversion",
  image: "Image & PDF",
  productivity: "Productivity",
  generators: "Generators",
  calculators: "Calculators"
};

var TOOLS = [
  { name: "Text Editor", cat: "text", desc: "Distraction-free online text editor with autosave.", href: "/tools/text-editor/" },
  { name: "Word Counter", cat: "text", desc: "Count words, characters and reading time instantly.", href: "/tools/word-counter/" },
  { name: "Case Converter", cat: "text", desc: "Switch between upper, lower, title and sentence case.", href: "/tools/case-converter/" },
  { name: "Markdown Previewer", cat: "text", desc: "Write Markdown and preview rendered output live.", href: "/tools/markdown-previewer/" },
  { name: "Code Formatter", cat: "developer", desc: "Auto-format JS, CSS, HTML and JSON snippets.", href: "/tools/code-formatter/" },
  { name: "Base64 Encoder", cat: "developer", desc: "Encode or decode Base64 strings and files.", href: "/tools/base64-encoder/" },
  { name: "Regex Tester", cat: "developer", desc: "Test regular expressions against sample text.", href: "/tools/regex-tester/" },
  { name: "URL Encoder/Decoder", cat: "developer", desc: "Encode or decode URL-safe strings.", href: "/tools/url-encoder-decoder/" },
  { name: "JSON Formatter", cat: "data", desc: "Beautify, validate and minify JSON documents.", href: "/tools/json-formatter/" },
  { name: "XML to CSV", cat: "data", desc: "Convert structured XML data into CSV format.", href: "/tools/xml-to-csv/" },
  { name: "CSV to JSON", cat: "data", desc: "Transform CSV rows into structured JSON objects.", href: "/tools/csv-to-json/" },
  { name: "CSV Converter", cat: "data", desc: "Convert between CSV, TSV and JSON formats.", href: "/tools/csv-converter/" },
  { name: "Image Compressor", cat: "image", desc: "Reduce image file size while preserving quality.", href: "/tools/image-compressor/" },
  { name: "PDF Merger", cat: "image", desc: "Combine multiple PDF files into a single document.", href: "/tools/pdf-merger/" },
  { name: "Image to PDF", cat: "image", desc: "Convert JPG or PNG images into a PDF file.", href: "/tools/image-to-pdf/" },
  { name: "PDF Splitter", cat: "image", desc: "Extract a page range from a PDF into a new file.", href: "/tools/pdf-splitter/" },
  { name: "Unit Converter", cat: "productivity", desc: "Convert between length, weight, and volume units.", href: "/tools/unit-converter/" },
  { name: "Timezone Converter", cat: "productivity", desc: "Compare times across multiple timezones.", href: "/tools/timezone-converter/" },
  { name: "To-Do List", cat: "productivity", desc: "A simple browser-based checklist for daily tasks.", href: "/tools/todo-list/" },
  { name: "QR Generator", cat: "generators", desc: "Create scannable QR codes from text or links.", href: "/tools/qr-generator/" },
  { name: "UUID Generator", cat: "generators", desc: "Generate unique v4 UUIDs for development use.", href: "/tools/uuid-generator/" },
  { name: "Password Generator", cat: "generators", desc: "Create strong, random passwords instantly.", href: "/tools/password-generator/" },
  { name: "Lorem Ipsum Generator", cat: "generators", desc: "Generate placeholder text for design mockups.", href: "/tools/lorem-ipsum-generator/" },
  { name: "Percentage Calculator", cat: "calculators", desc: "Quickly calculate percentages and differences.", href: "/tools/percentage-calculator/" },
  { name: "Age Calculator", cat: "calculators", desc: "Calculate exact age from a given date of birth.", href: "/tools/age-calculator/" },
  { name: "Loan EMI Calculator", cat: "calculators", desc: "Estimate monthly EMI for loans and financing.", href: "/tools/loan-emi-calculator/" },
  { name: "BMI Calculator", cat: "calculators", desc: "Calculate body mass index from height and weight.", href: "/tools/bmi-calculator/" }
];

var GAME_ICONS = {
  board: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 9h16M4 14h16M9 4v16M14 4v16" stroke="currentColor" stroke-width="1" stroke-opacity="0.6"/></svg>',
  arcade: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M8 6a5 5 0 0 0-4.9 6l1 4a2.4 2.4 0 0 0 4.4.6l.7-1.1a1.6 1.6 0 0 1 1.3-.7h3a1.6 1.6 0 0 1 1.3.7l.7 1.1a2.4 2.4 0 0 0 4.4-.6l1-4A5 5 0 0 0 16 6H8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.5 10v3M7 11.5h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="16" cy="10" r="0.9" fill="currentColor"/><circle cx="17.6" cy="11.6" r="0.9" fill="currentColor"/></svg>',
  puzzle: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M9 4h4v2.2a1.8 1.8 0 0 0 3 1.3V10h2v4h-2.2a1.8 1.8 0 0 0-1.3 3H20v4h-4v-2.2a1.8 1.8 0 0 0-3-1.3V20H9v-2.2a1.8 1.8 0 0 0-3 1.3H4v-4h2.2a1.8 1.8 0 0 0 1.3-3H4v-4h4V9a1.8 1.8 0 0 0 1-1.6V4Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  word: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>'
};

var GAMES = [
  { title: "Rummy", desc: "Indian Rummy — 13 cards, flexible groups.", kind: "board", href: "/games/#rummy" },
  { title: "Chess", desc: "Hard AI, move counter, points & captured pieces.", kind: "board", href: "/games/#chess" },
  { title: "Ping Pong", desc: "Classic paddle game with mouse, keyboard or touch.", kind: "arcade", href: "/games/#pong" },
  { title: "Sudoku", desc: "Classic 9×9 puzzle with 3 difficulty levels, notes & hints.", kind: "puzzle", href: "/games/#sudoku" },
  { title: "Word Search", desc: "5 themes, 130+ words — drag to find them all.", kind: "word", href: "/games/#wordpuzzle" },
  { title: "Darts", desc: "301, 501, 701 — tap to throw, double out to win.", kind: "target", href: "/games/#darts" },
  { title: "Snake", desc: "Classic grid snake with 3 speeds and wraparound edges.", kind: "arcade", href: "/games/#snake" },
  { title: "Pac-Bot", desc: "Robo-maze chomper — dodge ghosts, hunt power cores.", kind: "arcade", href: "/games/#pacman" },
  { title: "Robo Jump", desc: "Side-scrolling platformer — stomp bots, grab coins, reach the flag.", kind: "arcade", href: "/games/#platformer" },
  { title: "Snakes & Ladders", desc: "Paramapadham for up to 4 players — climb to 100, dodge the snakes.", kind: "board", href: "/games/#ladders" },
  { title: "Carrom", desc: "Flick physics, 3 levels — pocket your coins & the queen.", kind: "board", href: "/games/#carrom" },
  { title: "Kovai Quiz", desc: "50 questions on Coimbatore — food, temples, hills and more.", kind: "word", href: "/games/#trivia" },
  { title: "2048", desc: "Slide & merge the tiles — 3 board sizes, undo, best score.", kind: "puzzle", href: "/games/#g2048" },
  { title: "Dots & Boxes", desc: "Pass and play or vs CPU — close a box, go again.", kind: "board", href: "/games/#dots" },
  { title: "Brick Breaker", desc: "Smash every brick across 5 levels — mouse, keyboard or touch.", kind: "arcade", href: "/games/#brick" },
  { title: "Tetris", desc: "7-bag piece shuffle & ghost drop — clear lines, level up, go fast.", kind: "puzzle", href: "/games/#tetris" },
  { title: "Bazooka Man", desc: "Physics puzzle, 10 levels — aim, fire, chain the barrels.", kind: "arcade", href: "/games/bazooka-man/" }
];
