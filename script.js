(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state + scroll progress bar ---------- */
  var header = document.getElementById("siteHeader");
  var progressBar = document.getElementById("scrollProgress");
  function onScroll() {
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");

    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = pct + "%";
    }
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

  /* ---------- Scroll reveal for sections, staggered within each grid ---------- */
  /* Runs after the tools/games cards above are built, so they're included too. */
  var revealTargets = document.querySelectorAll(".card, .why-point, .section-title, .section-sub");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var groupCounters = new Map();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = el.dataset.revealDelay || "0";
            el.style.animation = "reveal-in 0.7s cubic-bezier(0.16,1,0.3,1) " + delay + "s forwards";
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      var parent = el.parentElement;
      var count = groupCounters.get(parent) || 0;
      groupCounters.set(parent, count + 1);
      el.dataset.revealDelay = String(Math.min(count, 7) * 0.06);
      io.observe(el);
    });
  }

  /* ---------- Cursor-spotlight on cards ---------- */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;
      var rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", ((e.clientX - rect.left) / rect.width) * 100 + "%");
      card.style.setProperty("--spot-y", ((e.clientY - rect.top) / rect.height) * 100 + "%");
    });
  }

  /* ---------- Hero visual parallax tilt ---------- */
  var heroVisual = document.querySelector(".hero-visual");
  var heroSection = document.querySelector(".hero");
  if (heroVisual && heroSection && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    heroSection.addEventListener("pointermove", function (e) {
      var rect = heroSection.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.transform = "rotateY(" + (relX * 10) + "deg) rotateX(" + (relY * -10) + "deg)";
    });
    heroSection.addEventListener("pointerleave", function () {
      heroVisual.style.transform = "rotateY(0deg) rotateX(0deg)";
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
