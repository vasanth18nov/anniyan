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
  var activeFilter = "all";

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

    toolsGrid.innerHTML = "";
    filtered.forEach(function (tool) {
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
  }

  if (toolsGrid) {
    toolSearch.addEventListener("input", renderTools);
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
      renderTools();
    });
    renderTools();
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
