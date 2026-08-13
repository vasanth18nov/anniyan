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

  /* ---------- Tools preview (full catalog lives at /tools/) ---------- */
  var FEATURED_TOOL_NAMES = ["Text Editor", "Word Counter", "Code Formatter", "JSON Formatter", "Image Compressor", "Unit Converter", "QR Generator", "BMI Calculator"];
  var toolsGrid = document.getElementById("toolsGrid");
  if (toolsGrid && typeof TOOLS !== "undefined") {
    TOOLS.filter(function (t) { return FEATURED_TOOL_NAMES.indexOf(t.name) !== -1; }).forEach(function (tool) {
      var card = document.createElement("a");
      card.className = "card tool-card";
      card.href = tool.href;
      card.innerHTML =
        '<span class="tool-icon">' + tool.icon + "</span>" +
        '<span class="tool-tag">' + CAT_LABEL[tool.cat] + "</span>" +
        "<h4>" + tool.name + "</h4>" +
        "<p>" + tool.desc + "</p>" +
        '<span class="tool-link">Open Tool &rarr;</span>';
      toolsGrid.appendChild(card);
    });
  }

  /* ---------- Games preview (full arcade lives at /games/) ---------- */
  var GAME_ART_VARIANTS = 8;
  var gamesGrid = document.getElementById("gamesGrid");
  if (gamesGrid && typeof GAMES !== "undefined") {
    GAMES.slice(0, 8).forEach(function (game, index) {
      var art = (index % GAME_ART_VARIANTS) + 1;
      var card = document.createElement("article");
      card.className = "card game-card";
      card.dataset.art = String(art);
      card.innerHTML =
        '<div class="game-thumb" aria-hidden="true">' +
          '<span class="game-thumb-badge">' + game.icon + "</span>" +
          '<span class="game-thumb-label">' + game.title + "</span>" +
        "</div>" +
        '<div class="game-body">' +
          "<h3>" + game.title + "</h3>" +
          "<p>" + game.desc + "</p>" +
          '<a class="btn btn-outline btn-sm" href="' + game.href + '">Play Now</a>' +
        "</div>";
      gamesGrid.appendChild(card);
    });
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
