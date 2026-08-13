(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Background particles ---------- */
  var particlesEl = document.getElementById("particles");
  if (particlesEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var count = window.innerWidth < 700 ? 18 : 36;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = 14 + Math.random() * 16 + "s";
      p.style.animationDelay = Math.random() * -20 + "s";
      p.style.opacity = String(0.2 + Math.random() * 0.4);
      particlesEl.appendChild(p);
    }
  }

  /* ---------- Scroll reveal for sections ---------- */
  var revealTargets = document.querySelectorAll(".card, .why-point, .section-title, .section-sub");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.animation = "reveal-in 0.7s cubic-bezier(0.16,1,0.3,1) forwards";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      io.observe(el);
    });
  }

  /* ---------- Tools data ---------- */
  var TOOLS = [
    { name: "Text Editor", cat: "text", desc: "Distraction-free online text editor with autosave." },
    { name: "Word Counter", cat: "text", desc: "Count words, characters and reading time instantly." },
    { name: "Case Converter", cat: "text", desc: "Switch between upper, lower, title and sentence case." },
    { name: "Markdown Previewer", cat: "text", desc: "Write Markdown and preview rendered output live." },
    { name: "Code Formatter", cat: "developer", desc: "Auto-format JS, CSS, HTML and JSON snippets." },
    { name: "Base64 Encoder", cat: "developer", desc: "Encode or decode Base64 strings and files." },
    { name: "Regex Tester", cat: "developer", desc: "Test regular expressions against sample text." },
    { name: "URL Encoder/Decoder", cat: "developer", desc: "Encode or decode URL-safe strings." },
    { name: "JSON Formatter", cat: "data", desc: "Beautify, validate and minify JSON documents." },
    { name: "XML to CSV", cat: "data", desc: "Convert structured XML data into CSV format." },
    { name: "CSV to JSON", cat: "data", desc: "Transform CSV rows into structured JSON objects." },
    { name: "CSV Converter", cat: "data", desc: "Convert CSV files to and from common data formats." },
    { name: "Image Compressor", cat: "image", desc: "Reduce image file size while preserving quality." },
    { name: "PDF Merger", cat: "image", desc: "Combine multiple PDF files into a single document." },
    { name: "Image to PDF", cat: "image", desc: "Convert JPG or PNG images into a PDF file." },
    { name: "PDF Splitter", cat: "image", desc: "Split a PDF into separate single-page files." },
    { name: "Unit Converter", cat: "productivity", desc: "Convert between length, weight, and volume units." },
    { name: "Timezone Converter", cat: "productivity", desc: "Compare times across multiple timezones." },
    { name: "To-Do List", cat: "productivity", desc: "A simple browser-based checklist for daily tasks." },
    { name: "QR Generator", cat: "generators", desc: "Create scannable QR codes from text or links." },
    { name: "UUID Generator", cat: "generators", desc: "Generate unique v4 UUIDs for development use." },
    { name: "Password Generator", cat: "generators", desc: "Create strong, random passwords instantly." },
    { name: "Lorem Ipsum Generator", cat: "generators", desc: "Generate placeholder text for design mockups." },
    { name: "Percentage Calculator", cat: "calculators", desc: "Quickly calculate percentages and differences." },
    { name: "Age Calculator", cat: "calculators", desc: "Calculate exact age from a given date of birth." },
    { name: "Loan EMI Calculator", cat: "calculators", desc: "Estimate monthly EMI for loans and financing." },
    { name: "BMI Calculator", cat: "calculators", desc: "Calculate body mass index from height and weight." }
  ];

  var CAT_LABEL = {
    text: "Text & Writing",
    developer: "Developer",
    data: "Data Conversion",
    image: "Image & PDF",
    productivity: "Productivity",
    generators: "Generators",
    calculators: "Calculators"
  };

  var toolsGrid = document.getElementById("toolsGrid");
  var toolsEmpty = document.getElementById("toolsEmpty");
  var toolSearch = document.getElementById("toolSearch");
  var toolFilters = document.getElementById("toolFilters");
  var toolsToggle = document.getElementById("toolsToggle");
  var toolsMoreWrap = document.getElementById("toolsMoreWrap");
  var activeFilter = "all";
  var toolsExpanded = false;
  var TOOLS_INITIAL_COUNT = 8;

  function renderTools() {
    var query = (toolSearch.value || "").trim().toLowerCase();
    var filtered = TOOLS.filter(function (tool) {
      var matchesCat = activeFilter === "all" || tool.cat === activeFilter;
      var matchesQuery =
        !query ||
        tool.name.toLowerCase().indexOf(query) !== -1 ||
        tool.desc.toLowerCase().indexOf(query) !== -1;
      return matchesCat && matchesQuery;
    });

    var isBrowsingAll = activeFilter === "all" && !query;
    var visible = isBrowsingAll && !toolsExpanded ? filtered.slice(0, TOOLS_INITIAL_COUNT) : filtered;

    toolsGrid.innerHTML = "";
    visible.forEach(function (tool) {
      var card = document.createElement("article");
      card.className = "card tool-card";
      card.innerHTML =
        '<span class="tool-tag">' + CAT_LABEL[tool.cat] + "</span>" +
        "<h4>" + tool.name + "</h4>" +
        "<p>" + tool.desc + "</p>" +
        '<span class="tool-link">Open Tool &rarr;</span>';
      toolsGrid.appendChild(card);
    });

    toolsEmpty.hidden = filtered.length !== 0;
    toolsMoreWrap.hidden = !isBrowsingAll || filtered.length <= TOOLS_INITIAL_COUNT;
    toolsToggle.textContent = toolsExpanded ? "Show Fewer Tools" : "Show More Tools (" + (filtered.length - TOOLS_INITIAL_COUNT) + " more)";
  }

  if (toolsGrid) {
    toolSearch.addEventListener("input", function () {
      toolsExpanded = false;
      renderTools();
    });
    toolFilters.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;
      toolFilters.querySelectorAll(".filter-chip").forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");
      activeFilter = chip.dataset.filter;
      toolsExpanded = false;
      renderTools();
    });
    toolsToggle.addEventListener("click", function () {
      toolsExpanded = !toolsExpanded;
      renderTools();
      if (!toolsExpanded) {
        document.getElementById("tools").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    renderTools();
  }

  /* ---------- Games data (published on thudinest.com) ---------- */
  var GAME_ICONS = {
    board: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M4 9h16M4 14h16M9 4v16M14 4v16" stroke="currentColor" stroke-width="1" stroke-opacity="0.6"/></svg>',
    arcade: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M8 6a5 5 0 0 0-4.9 6l1 4a2.4 2.4 0 0 0 4.4.6l.7-1.1a1.6 1.6 0 0 1 1.3-.7h3a1.6 1.6 0 0 1 1.3.7l.7 1.1a2.4 2.4 0 0 0 4.4-.6l1-4A5 5 0 0 0 16 6H8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.5 10v3M7 11.5h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="16" cy="10" r="0.9" fill="currentColor"/><circle cx="17.6" cy="11.6" r="0.9" fill="currentColor"/></svg>',
    puzzle: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M9 4h4v2.2a1.8 1.8 0 0 0 3 1.3V10h2v4h-2.2a1.8 1.8 0 0 0-1.3 3H20v4h-4v-2.2a1.8 1.8 0 0 0-3-1.3V20H9v-2.2a1.8 1.8 0 0 0-3 1.3H4v-4h2.2a1.8 1.8 0 0 0 1.3-3H4v-4h4V9a1.8 1.8 0 0 0 1-1.6V4Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    word: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" class="game-thumb-icon"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>'
  };

  var GAMES = [
    { title: "Rummy", desc: "Indian Rummy — 13 cards, flexible groups.", kind: "board" },
    { title: "Chess", desc: "Hard AI, move counter, points & captured pieces.", kind: "board" },
    { title: "Ping Pong", desc: "Classic paddle game with mouse, keyboard or touch.", kind: "arcade" },
    { title: "Sudoku", desc: "Classic 9×9 puzzle with 3 difficulty levels, notes & hints.", kind: "puzzle" },
    { title: "Word Search", desc: "5 themes, 130+ words — drag to find them all.", kind: "word" },
    { title: "Darts", desc: "301, 501, 701 — tap to throw, double out to win.", kind: "target" },
    { title: "Snake", desc: "Classic grid snake with 3 speeds and wraparound edges.", kind: "arcade" },
    { title: "Pac-Bot", desc: "Robo-maze chomper — dodge ghosts, hunt power cores.", kind: "arcade" },
    { title: "Robo Jump", desc: "Side-scrolling platformer — stomp bots, grab coins, reach the flag.", kind: "arcade" },
    { title: "Snakes & Ladders", desc: "Paramapadham for up to 4 players — climb to 100, dodge the snakes.", kind: "board" },
    { title: "Carrom", desc: "Flick physics, 3 levels — pocket your coins & the queen.", kind: "board" },
    { title: "Kovai Quiz", desc: "50 questions on Coimbatore — food, temples, hills and more.", kind: "word" },
    { title: "2048", desc: "Slide & merge the tiles — 3 board sizes, undo, best score.", kind: "puzzle" },
    { title: "Dots & Boxes", desc: "Pass and play or vs CPU — close a box, go again.", kind: "board" },
    { title: "Brick Breaker", desc: "Smash every brick across 5 levels — mouse, keyboard or touch.", kind: "arcade" },
    { title: "Tetris", desc: "7-bag piece shuffle & ghost drop — clear lines, level up, go fast.", kind: "puzzle" },
    { title: "Bazooka Man", desc: "Physics puzzle, 10 levels — aim, fire, chain the barrels.", kind: "arcade" }
  ];
  var GAME_ART_VARIANTS = 6;

  var gamesGrid = document.getElementById("gamesGrid");
  var gamesToggle = document.getElementById("gamesToggle");
  var gamesMoreWrap = document.getElementById("gamesMoreWrap");
  var gamesExpanded = false;
  var GAMES_INITIAL_COUNT = 6;

  function renderGames() {
    var visible = gamesExpanded ? GAMES : GAMES.slice(0, GAMES_INITIAL_COUNT);
    gamesGrid.innerHTML = "";
    visible.forEach(function (game, index) {
      var art = (index % GAME_ART_VARIANTS) + 1;
      var card = document.createElement("article");
      card.className = "card game-card";
      card.dataset.art = String(art);
      card.innerHTML =
        '<div class="game-thumb" aria-hidden="true">' +
          GAME_ICONS[game.kind] +
          '<span class="game-thumb-label">' + game.title + "</span>" +
        "</div>" +
        '<div class="game-body">' +
          "<h3>" + game.title + "</h3>" +
          "<p>" + game.desc + "</p>" +
          '<a class="btn btn-outline btn-sm" href="https://thudinest.com" target="_blank" rel="noopener noreferrer">Play Now</a>' +
        "</div>";
      gamesGrid.appendChild(card);
    });

    if (gamesToggle) {
      gamesToggle.hidden = GAMES.length <= GAMES_INITIAL_COUNT;
      gamesToggle.textContent = gamesExpanded ? "Show Fewer Games" : "Show All Games (" + GAMES.length + ")";
    }
  }

  if (gamesGrid) {
    gamesToggle.addEventListener("click", function () {
      gamesExpanded = !gamesExpanded;
      renderGames();
      if (!gamesExpanded) {
        document.getElementById("games").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    renderGames();
  }

  /* ---------- Enquiry form (no backend wired up) ---------- */
  var form = document.getElementById("enquiryForm");
  var formStatus = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var name = form.elements["name"].value.trim();
      var email = form.elements["email"].value.trim();
      var company = form.elements["company"].value.trim();
      var type = form.elements["projectType"].value;
      var budget = form.elements["budget"].value;
      var message = form.elements["message"].value.trim();

      var subject = encodeURIComponent("Project Enquiry: " + type);
      var body = encodeURIComponent(
        "Name: " + name +
        "\nEmail: " + email +
        "\nCompany: " + (company || "-") +
        "\nProject Type: " + type +
        "\nBudget Range: " + budget +
        "\n\nMessage:\n" + message
      );

      window.location.href = "mailto:vasanth18nov@gmail.com?subject=" + subject + "&body=" + body;
      formStatus.textContent = "Opening your email client to send this enquiry...";
    });
  }
})();
