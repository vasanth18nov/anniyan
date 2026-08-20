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
  {
    name: "Text Editor", cat: "text", desc: "Distraction-free online text editor with autosave.", href: "/tools/text-editor/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
  },
  {
    name: "Word Counter", cat: "text", desc: "Count words, characters and reading time instantly.", href: "/tools/word-counter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 11h16M4 16h11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><rect x="16" y="14.5" width="5" height="5" rx="1.3" fill="currentColor"/><path d="M17.3 15.8v2.4M18.7 15.8v2.4M20.1 15.8v2.4" stroke="#0d0f16" stroke-width="0.9" stroke-linecap="round"/></svg>'
  },
  {
    name: "Case Converter", cat: "text", desc: "Switch between upper, lower, title and sentence case.", href: "/tools/case-converter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><text x="3" y="17" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="currentColor">A</text><text x="13" y="20" font-family="Arial, sans-serif" font-size="10" fill="currentColor" opacity="0.65">a</text></svg>'
  },
  {
    name: "Markdown Previewer", cat: "text", desc: "Write Markdown and preview rendered output live.", href: "/tools/markdown-previewer/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="8" height="16" rx="1.3" stroke="currentColor" stroke-width="1.3"/><rect x="13" y="4" width="8" height="16" rx="1.3" stroke="currentColor" stroke-width="1.3"/><path d="M5.5 8h4M5.5 11h4M5.5 14h3" stroke="currentColor" stroke-width="1" opacity="0.6"/><path d="M15.5 8h4M15.5 11h3M15.5 14h4" stroke="currentColor" stroke-width="1" opacity="0.9"/></svg>'
  },
  {
    name: "Code Formatter", cat: "developer", desc: "Auto-format JS, CSS, HTML and JSON snippets.", href: "/tools/code-formatter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M8 7 4 12l4 5M16 7l4 5-4 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 6v12" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.4" stroke-dasharray="1 2.4"/></svg>'
  },
  {
    name: "Base64 Encoder", cat: "developer", desc: "Encode or decode Base64 strings and files.", href: "/tools/base64-encoder/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="8" width="6" height="8" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M11 12h2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M12 9.5 14.5 12 12 14.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 9h5M16 12h5M16 15h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
  },
  {
    name: "Regex Tester", cat: "developer", desc: "Test regular expressions against sample text.", href: "/tools/regex-tester/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="m15 15 4.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M7.5 10.5h1.2M10.3 10.5h1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="13.1" cy="10.5" r="0.7" fill="currentColor"/></svg>'
  },
  {
    name: "URL Encoder/Decoder", cat: "developer", desc: "Encode or decode URL-safe strings.", href: "/tools/url-encoder-decoder/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M11 6.5H9A3.5 3.5 0 0 0 5.5 10v0A3.5 3.5 0 0 0 9 13.5h1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M13 17.5h2a3.5 3.5 0 0 0 3.5-3.5v0A3.5 3.5 0 0 0 15 10.5h-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M9 15 15 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
  },
  {
    name: "JSON Formatter", cat: "data", desc: "Beautify, validate and minify JSON documents.", href: "/tools/json-formatter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 4c-2 0-2.5 1-2.5 2.5v3c0 1-.5 1.5-1.5 1.5.9 0 1.5.5 1.5 1.5v3c0 1.5.5 2.5 2.5 2.5M15 4c2 0 2.5 1 2.5 2.5v3c0 1 .5 1.5 1.5 1.5-.9 0-1.5.5-1.5 1.5v3c0 1.5-.5 2.5-2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    name: "XML to CSV", cat: "data", desc: "Convert structured XML data into CSV format.", href: "/tools/xml-to-csv/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 5 3.5 8l2.5 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 5l2.5 3-2.5 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><rect x="4" y="17" width="16" height="4" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M9.3 17v4M14.7 17v4" stroke="currentColor" stroke-width="0.9"/></svg>'
  },
  {
    name: "CSV to JSON", cat: "data", desc: "Transform CSV rows into structured JSON objects.", href: "/tools/csv-to-json/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="4" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M9.3 3v4M14.7 3v4" stroke="currentColor" stroke-width="0.9"/><path d="M12 9v3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M9 15c-1.5 0-2 .8-2 2v1c0 .8-.4 1-1 1 .6 0 1 .2 1 1v1c0 1.2.5 2 2 2M15 15c1.5 0 2 .8 2 2v1c0 .8.4 1 1 1-.6 0-1 .2-1 1v1c0 1.2-.5 2-2 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    name: "CSV Converter", cat: "data", desc: "Convert between CSV, TSV and JSON formats.", href: "/tools/csv-converter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="7" height="9" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="14" y="11" width="7" height="9" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 8h3M13.5 6.5 15.5 8l-2 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 16h-3M10.5 17.5 8.5 16l2-1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    name: "Image Compressor", cat: "image", desc: "Reduce image file size while preserving quality.", href: "/tools/image-compressor/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="13" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="8.5" cy="9" r="1.4" stroke="currentColor" stroke-width="1.1"/><path d="M4.5 15.5 9 11l3 3 3.5-4 4 5.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/><path d="M2 20l3-3M22 20l-3-3M2 4l3 3M22 4l-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
  },
  {
    name: "PDF Merger", cat: "image", desc: "Combine multiple PDF files into a single document.", href: "/tools/pdf-merger/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="8" height="11" rx="1.2" stroke="currentColor" stroke-width="1.3"/><rect x="4.5" y="8" width="8" height="11" rx="1.2" stroke="currentColor" stroke-width="1.3" opacity="0.6"/><path d="M16 10h2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M17 7.5 20 10l-3 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><rect x="16.5" y="13" width="6" height="8" rx="1.2" fill="currentColor" opacity="0.9"/></svg>'
  },
  {
    name: "Image to PDF", cat: "image", desc: "Convert JPG or PNG images into a PDF file.", href: "/tools/image-to-pdf/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="8" height="8" rx="1.2" stroke="currentColor" stroke-width="1.3"/><circle cx="5.3" cy="7.5" r="1" stroke="currentColor" stroke-width="1"/><path d="M3.5 11.5 6 9l2.5 2.5 1.5-1.7 1.5 2" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" fill="none"/><path d="M14 9h2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M15 6.5 18 9l-3 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><rect x="14.5" y="12" width="7" height="9" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M17 15.5h3M17 18h2" stroke="currentColor" stroke-width="1" opacity="0.7"/></svg>'
  },
  {
    name: "PDF Splitter", cat: "image", desc: "Extract a page range from a PDF into a new file.", href: "/tools/pdf-splitter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="14" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M7 10h10" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.5 1.8"/><path d="M9 20l-3-3M15 20l3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
  },
  {
    name: "Unit Converter", cat: "productivity", desc: "Convert between length, weight, and volume units.", href: "/tools/unit-converter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 9h13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M14 6l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 15H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M10 12l-3 3 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    name: "Timezone Converter", cat: "productivity", desc: "Compare times across multiple timezones.", href: "/tools/timezone-converter/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.3"/><path d="M12 7.5v4.8l3.2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 12h17M12 3.5c2.2 2.2 2.2 15 0 17M12 3.5c-2.2 2.2-2.2 15 0 17" stroke="currentColor" stroke-width="0.8" opacity="0.4"/></svg>'
  },
  {
    name: "To-Do List", cat: "productivity", desc: "A simple browser-based checklist for daily tasks.", href: "/tools/todo-list/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="m7.5 9 1.3 1.3L11.5 7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 9h4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="7" y="13.5" width="2" height="2" rx="0.4" stroke="currentColor" stroke-width="1.1"/><path d="M13.5 14.5h4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/></svg>'
  },
  {
    name: "QR Generator", cat: "generators", desc: "Create scannable QR codes from text or links.", href: "/tools/qr-generator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="6" y="6" width="1.5" height="1.5" fill="currentColor"/><rect x="16.5" y="6" width="1.5" height="1.5" fill="currentColor"/><rect x="6" y="16.5" width="1.5" height="1.5" fill="currentColor"/><rect x="14" y="14" width="2.5" height="2.5" fill="currentColor"/><rect x="17.5" y="17.5" width="2.5" height="2.5" fill="currentColor"/></svg>'
  },
  {
    name: "UUID Generator", cat: "generators", desc: "Generate unique v4 UUIDs for development use.", href: "/tools/uuid-generator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5a8.5 8.5 0 0 0-8.5 8.5c0 2 .5 3.8 1.5 5.3M12 3.5a8.5 8.5 0 0 1 8.5 8.5c0 3-1 5.5-2.7 7.3M12 7a5 5 0 0 0-5 5c0 3 1 5 2.3 6.5M12 7a5 5 0 0 1 5 5c0 1.6-.4 3-1 4.2M12 10.5a1.5 1.5 0 0 0-1.5 1.5c0 2.5.8 4.5 2 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/></svg>'
  },
  {
    name: "Password Generator", cat: "generators", desc: "Create strong, random passwords instantly.", href: "/tools/password-generator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="5.5" y="10.5" width="13" height="9.5" rx="1.6" stroke="currentColor" stroke-width="1.3"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/><path d="M12 16.3v1.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'
  },
  {
    name: "Lorem Ipsum Generator", cat: "generators", desc: "Generate placeholder text for design mockups.", href: "/tools/lorem-ipsum-generator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.3"/><circle cx="8.3" cy="8.3" r="1.1" fill="currentColor"/><circle cx="15.7" cy="8.3" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="8.3" cy="15.7" r="1.1" fill="currentColor"/><circle cx="15.7" cy="15.7" r="1.1" fill="currentColor"/></svg>'
  },
  {
    name: "Percentage Calculator", cat: "calculators", desc: "Quickly calculate percentages and differences.", href: "/tools/percentage-calculator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="7.5" cy="7.5" r="2.3" stroke="currentColor" stroke-width="1.3"/><circle cx="16.5" cy="16.5" r="2.3" stroke="currentColor" stroke-width="1.3"/><path d="M17 6 6 18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
  },
  {
    name: "Age Calculator", cat: "calculators", desc: "Calculate exact age from a given date of birth.", href: "/tools/age-calculator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4 9.5h16M8 3v3.5M16 3v3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="9" y="12.5" width="4" height="4" rx="0.8" fill="currentColor"/></svg>'
  },
  {
    name: "Loan EMI Calculator", cat: "calculators", desc: "Estimate monthly EMI for loans and financing.", href: "/tools/loan-emi-calculator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M9 6.3v5.4M7.3 11c0 .8.7 1.3 1.7 1.3s1.7-.5 1.7-1.2c0-.8-.7-1.1-1.7-1.4-1-.3-1.7-.6-1.7-1.4 0-.7.7-1.2 1.7-1.2s1.7.5 1.7 1.3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><rect x="13" y="13" width="8" height="8" rx="1.3" stroke="currentColor" stroke-width="1.2"/><path d="M15 15.5h4M15 17.5h4M15 19.5h2.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round"/></svg>'
  },
  {
    name: "BMI Calculator", cat: "calculators", desc: "Calculate body mass index from height and weight.", href: "/tools/bmi-calculator/",
    icon: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="6" r="2.3" stroke="currentColor" stroke-width="1.3"/><path d="M8.5 20v-5.5a3.5 3.5 0 0 1 7 0V20" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5 20h14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
  }
];

var GAMES = [
  {
    title: "Rummy", desc: "Indian Rummy — 13 cards, flexible groups.", href: "/games/#rummy",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="4.5" y="6.5" width="9" height="13" rx="1.3" transform="rotate(-9 9 13)" stroke="currentColor" stroke-width="1.3"/><rect x="10" y="4.5" width="9" height="13" rx="1.3" stroke="currentColor" stroke-width="1.3"/><path d="M14.5 8.8 16 10.6 14.5 12.4 13 10.6Z" fill="currentColor"/></svg>'
  },
  {
    title: "Chess", desc: "Hard AI, move counter, points & captured pieces.", href: "/games/#chess",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><circle cx="12" cy="7" r="2.3" stroke="currentColor" stroke-width="1.3"/><path d="M9 13.5c0-1.5 1.3-2.7 3-2.7s3 1.2 3 2.7c0 1-.6 1.9-1.5 2.4l1.3 4.6H9.2l1.3-4.6c-.9-.5-1.5-1.4-1.5-2.4Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M7.5 20.5h9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
  },
  {
    title: "Ping Pong", desc: "Classic paddle game with mouse, keyboard or touch.", href: "/games/#pong",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><circle cx="17.5" cy="6" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 18.5c-1.2-3 1-7.5 5-8.8 2.8-.9 5 .6 5.4 2.8.4 2.3-1.5 4.6-4.3 5.5-3.2 1-5-.2-6.1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>'
  },
  {
    title: "Sudoku", desc: "Classic 9×9 puzzle with 3 difficulty levels, notes & hints.", href: "/games/#sudoku",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="4" y="4" width="16" height="16" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16" stroke="currentColor" stroke-width="1" stroke-opacity="0.55"/><circle cx="6.7" cy="6.7" r="0.9" fill="currentColor"/><circle cx="17.3" cy="17.3" r="0.9" fill="currentColor"/><circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" opacity="0.5"/></svg>'
  },
  {
    title: "Word Search", desc: "5 themes, 130+ words — drag to find them all.", href: "/games/#wordpuzzle",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="3.5" y="3.5" width="12" height="12" rx="1.3" stroke="currentColor" stroke-width="1.3"/><path d="M3.5 8h12M3.5 12.3h12M8 3.5v12M12.3 3.5v12" stroke="currentColor" stroke-width="0.7" stroke-opacity="0.5"/><circle cx="15.5" cy="15.5" r="4" stroke="currentColor" stroke-width="1.4"/><path d="m18.5 18.5 2.3 2.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
  },
  {
    title: "Snake", desc: "Classic grid snake with 3 speeds and wraparound edges.", href: "/games/#snake",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M5 19c3 0 3-3 0-3s-3-3 0-3 3-3 0-3 0-3 3-3c2 0 3.2 1.2 3.2 2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="17.2" cy="6.6" r="1.1" fill="currentColor"/></svg>'
  },
  {
    title: "Pac-Bot", desc: "Robo-maze chomper — dodge ghosts, hunt power cores.", href: "/games/#pacman",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M12 12 21 8a9 9 0 1 0 0 8Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="18.3" cy="5.7" r="1" fill="currentColor"/></svg>'
  },
  {
    title: "Robo Jump", desc: "Side-scrolling platformer — stomp bots, grab coins, reach the flag.", href: "/games/#platformer",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="6.5" y="6" width="10" height="8.5" rx="2" stroke="currentColor" stroke-width="1.3"/><circle cx="9.7" cy="9.8" r="1" fill="currentColor"/><circle cx="13.3" cy="9.8" r="1" fill="currentColor"/><path d="M11.5 3v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="11.5" cy="2.5" r="0.9" fill="currentColor"/><path d="M8.5 20l2.8-5.5L14 20" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    title: "Snakes & Ladders", desc: "Paramapadham for up to 4 players — climb to 100, dodge the snakes.", href: "/games/#ladders",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M8 3v18M16 3v18M8 7.5h8M8 12h8M8 16.5h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
  },
  {
    title: "Carrom", desc: "Flick physics, 3 levels — pocket your coins & the queen.", href: "/games/#carrom",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.3"/><circle cx="9" cy="10.5" r="1.7" fill="currentColor"/><circle cx="14.5" cy="13.5" r="1.7" stroke="currentColor" stroke-width="1.1"/><circle cx="12" cy="8" r="1.2" stroke="currentColor" stroke-width="1"/></svg>'
  },
  {
    title: "Kovai Quiz", desc: "50 questions on Coimbatore — food, temples, hills and more.", href: "/games/#trivia",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M4 5h16v11H9.5l-4 4V5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.7 9c0-1.2 1.1-2 2.4-2s2.4.8 2.4 1.8c0 1-1 1.5-1.9 2-.5.3-.6.6-.6 1.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/><circle cx="12" cy="14" r="0.9" fill="currentColor"/></svg>'
  },
  {
    title: "2048", desc: "Slide & merge the tiles — 3 board sizes, undo, best score.", href: "/games/#g2048",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="3.5" y="3.5" width="8" height="8" rx="1.3" stroke="currentColor" stroke-width="1.3"/><rect x="12.5" y="3.5" width="8" height="8" rx="1.3" stroke="currentColor" stroke-width="1.3"/><rect x="3.5" y="12.5" width="8" height="8" rx="1.3" stroke="currentColor" stroke-width="1.3"/><rect x="12.5" y="12.5" width="8" height="8" rx="1.3" fill="currentColor"/></svg>'
  },
  {
    title: "Dots & Boxes", desc: "Pass and play or vs CPU — close a box, go again.", href: "/games/#dots",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><circle cx="5" cy="5" r="1.1" fill="currentColor"/><circle cx="12" cy="5" r="1.1" fill="currentColor"/><circle cx="19" cy="5" r="1.1" fill="currentColor"/><circle cx="5" cy="12" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="19" cy="12" r="1.1" fill="currentColor"/><circle cx="5" cy="19" r="1.1" fill="currentColor"/><circle cx="12" cy="19" r="1.1" fill="currentColor"/><circle cx="19" cy="19" r="1.1" fill="currentColor"/><path d="M5 5h7M5 5v7M12 5v7M5 12h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
  },
  {
    title: "Brick Breaker", desc: "Smash every brick across 5 levels — mouse, keyboard or touch.", href: "/games/#brick",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="3.5" y="4" width="6" height="2.6" rx="0.6" fill="currentColor"/><rect x="10.5" y="4" width="6" height="2.6" rx="0.6" fill="currentColor"/><rect x="17.5" y="4" width="3" height="2.6" rx="0.6" fill="currentColor" opacity="0.5"/><circle cx="12" cy="13" r="1.3" fill="currentColor"/><rect x="8" y="18.5" width="8" height="2" rx="1" fill="currentColor"/></svg>'
  },
  {
    title: "Tetris", desc: "7-bag piece shuffle & ghost drop — clear lines, level up, go fast.", href: "/games/#tetris",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="4" y="4" width="5" height="5" fill="currentColor"/><rect x="4" y="9" width="5" height="5" fill="currentColor"/><rect x="4" y="14" width="5" height="5" fill="currentColor"/><rect x="9" y="14" width="5" height="5" fill="currentColor"/></svg>'
  },
  {
    title: "Bazooka Man", desc: "Physics puzzle, 10 levels — aim, fire, chain the barrels.", href: "/games/bazooka-man/",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="2.5" y="10.2" width="12" height="4.6" rx="1.6" transform="rotate(-18 8.5 12.5)" stroke="currentColor" stroke-width="1.3"/><path d="M16.5 7.5 18 9M19.7 5l1.8.5-.5 1.8M17 10l2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    title: "Mahjong", desc: "Classic tile-matching solitaire — 80 tiles, hints & shuffle.", href: "/games/#mahjong",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="4" y="3.5" width="16" height="17" rx="2.3" stroke="currentColor" stroke-width="1.3"/><path d="M12 8v3M9.5 12.5h5M10 15.5l2-2.3 2 2.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    title: "One Line", desc: "Trace 30 shapes in one stroke — no lifting, no repeats.", href: "/games/#oneline",
    icon: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M12 4v9M12 4l5 9M7 13h10M6 13l-1.5 6h15L18 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  }
];
