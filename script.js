(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // html.motion is set by the inline script in <head>; every scroll animation keys off it.
  var motion = root.classList.contains("motion") && !prefersReducedMotion && "IntersectionObserver" in window;
  if (!motion) root.classList.remove("motion");

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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

  /* ---------- Hero rotating word ---------- */
  var HERO_CYCLE_WORDS = ["custom websites", "web apps", "business automation", "AI-integrated systems"];
  var heroCycle = document.getElementById("heroCycle");
  if (heroCycle && !prefersReducedMotion) {
    var heroCycleIndex = 0;
    setInterval(function () {
      heroCycleIndex = (heroCycleIndex + 1) % HERO_CYCLE_WORDS.length;
      heroCycle.style.opacity = "0";
      heroCycle.style.transform = "translateY(8px)";
      setTimeout(function () {
        heroCycle.textContent = HERO_CYCLE_WORDS[heroCycleIndex];
        heroCycle.style.opacity = "1";
        heroCycle.style.transform = "translateY(0)";
      }, 300);
    }, 2600);
  }

  /* Once the hero intro animation finishes, drop it so its `forwards` fill
     stops overriding the pointer tilt on the hero visual. */
  document.querySelectorAll(".hero .reveal").forEach(function (el) {
    el.addEventListener("animationend", function (e) {
      if (e.target === el && e.animationName === "reveal-in") el.classList.remove("reveal");
    });
  });

  /* ---------- Count-up numbers (real, verifiable catalog counts) ---------- */
  var countEls = document.querySelectorAll(".count-up");
  if (countEls.length) {
    var runCount = function (el) {
      var target = parseInt(el.dataset.countTo, 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = String(target);
        return;
      }
      var start = null;
      var duration = 1100;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var countIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCount(entry.target);
              countIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach(function (el) { countIO.observe(el); });
    } else {
      countEls.forEach(runCount);
    }
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

  /* =====================================================================
     Scroll motion setup (only with html.motion)
     ===================================================================== */

  /* Split text into word spans, keeping inline elements such as .grad-text.
     wrap(word, index, parentEl) returns the node to insert for each word. */
  function splitWords(el, wrap) {
    var index = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else frag.appendChild(wrap(part, index++, node));
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
    return index;
  }

  var brandText = null;
  var brandWords = [];
  var marquee = null;

  if (motion) {
    /* Section titles: each word rises out of a mask */
    document.querySelectorAll(".section-title").forEach(function (title) {
      title.classList.add("is-split");
      splitWords(title, function (word, i) {
        var outer = document.createElement("span");
        outer.className = "split-w";
        var inner = document.createElement("span");
        inner.className = "split-wi";
        inner.style.setProperty("--wi", i);
        inner.textContent = word;
        outer.appendChild(inner);
        return outer;
      });
    });

    /* Reveal styles per element group, staggered within each parent */
    var REVEALS = [
      [".section .section-eyebrow, .process .section-eyebrow", "left"],
      [".section-sub", "up"],
      [".section-head-row > .btn", "right"],
      [".service-card", "flip"],
      [".tool-card", "zoom"],
      [".game-card", "zoom"],
      [".why-point", "right"],
      [".about-avatar-wrap", "zoom"],
      [".about-copy > p:not(.section-eyebrow)", "up"],
      [".contact-links, .contact-cta", "up"],
      [".contact-form", "right"],
      [".footer-inner > *", "up"]
    ];
    var groupCounters = new Map();
    REVEALS.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (el) {
        if (el.hasAttribute("data-reveal")) return;
        el.setAttribute("data-reveal", pair[1]);
        var parent = el.parentElement;
        var n = groupCounters.get(parent) || 0;
        groupCounters.set(parent, n + 1);
        el.style.setProperty("--rd", Math.min(n, 7) * 0.08 + "s");
      });
    });

    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal], .is-split").forEach(function (el) { revealIO.observe(el); });

    /* Brand statement: one span per word, lit by scroll position */
    brandText = document.querySelector(".brand-statement-text");
    if (brandText) {
      brandText.classList.remove("reveal");
      splitWords(brandText, function (word, i, parent) {
        var span = document.createElement("span");
        span.className = "bw";
        // background-clip:text doesn't carry through to faded children, so
        // gradient words get their own gradient.
        if (parent.classList && parent.classList.contains("grad-text")) span.classList.add("grad-text");
        span.textContent = word;
        brandWords.push(span);
        return span;
      });
      brandText.querySelectorAll(".grad-text:not(.bw)").forEach(function (g) { g.classList.remove("grad-text"); });
    }

    /* Trust strip -> scroll-reactive marquee (original set + 3 hidden copies) */
    var trustStrip = document.querySelector(".trust-strip");
    var trustTrack = trustStrip && trustStrip.querySelector(".trust-grid");
    if (trustTrack) {
      var originals = Array.prototype.slice.call(trustTrack.children);
      trustStrip.classList.add("is-marquee");
      for (var c = 0; c < 3; c++) {
        originals.forEach(function (item) {
          var clone = item.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          trustTrack.appendChild(clone);
        });
      }
      marquee = { el: trustTrack, x: 0, setWidth: 0, dir: -1, visible: true };
      new IntersectionObserver(function (e) { marquee.visible = e[0].isIntersecting; }).observe(trustStrip);
    }
  }

  /* ---------- Smooth wheel scrolling (desktop only) ---------- */
  var lenis = null;
  if (motion && finePointer && typeof window.Lenis === "function") {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
  }

  var HEADER_OFFSET = 80;
  function scrollToTarget(target) {
    if (lenis) {
      lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -HEADER_OFFSET, duration: 1.4 });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: prefersReducedMotion ? "auto" : "smooth" });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }
  if (lenis) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute("href");
      var target = hash === "#top" || hash === "#" ? 0 : document.getElementById(hash.slice(1));
      if (target === null) return;
      e.preventDefault();
      scrollToTarget(target);
      if (history.pushState) history.pushState(null, "", hash);
    });
  }

  var backToTop = document.getElementById("backToTop");
  if (backToTop) backToTop.addEventListener("click", function () { scrollToTarget(0); });

  /* ---------- Scrollspy: spine dots + header links ---------- */
  var spineNodes = document.querySelectorAll(".scroll-spine-node");
  if (spineNodes.length && "IntersectionObserver" in window) {
    var spineIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var sel = '[href="#' + entry.target.id + '"]';
          document.querySelectorAll(".scroll-spine-node" + sel + ", .main-nav a" + sel).forEach(function (node) {
            node.classList.toggle("is-active", entry.isIntersecting);
          });
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    spineNodes.forEach(function (node) {
      var target = document.getElementById(node.getAttribute("href").slice(1));
      if (target) spineIO.observe(target);
    });
  }

  /* =====================================================================
     One rAF loop drives everything tied to scroll position
     ===================================================================== */
  var header = document.getElementById("siteHeader");
  var progressBar = document.getElementById("scrollProgress");
  var spineFill = document.getElementById("spineFill");
  var backToTopFill = document.getElementById("backToTopFill");
  var BTT_CIRCUMFERENCE = 119.4;

  var hero = document.querySelector(".hero");
  var heroCopy = document.querySelector(".hero-copy");
  var heroOrbit = document.querySelector(".hero-orbit");
  var heroGlow = document.querySelector(".hero-glow");
  var scrollCue = document.querySelector(".scroll-cue");
  var aurora1 = document.querySelector(".aurora-1");
  var aurora2 = document.querySelector(".aurora-2");

  var process = document.getElementById("process");
  var processSteps = process ? process.querySelectorAll(".process-step") : [];
  var processNodes = process ? process.querySelectorAll(".process-node") : [];
  var processFill = document.getElementById("processFill");
  var processRing = document.getElementById("processRing");
  var processInnerRing = process ? process.querySelector(".process-ring-inner") : null;
  var processNow = document.getElementById("processNow");
  var processBigNum = document.getElementById("processBigNum");
  var processBigLabel = document.getElementById("processBigLabel");
  var processCenter = process ? process.querySelector(".process-center") : null;
  var RING_C = 879.65;
  var activeStep = -1;

  var footerWord = document.getElementById("footerWord");

  var vh = window.innerHeight;
  var heroH = hero ? hero.offsetHeight : vh;
  var lastY = -1;
  function measure() {
    vh = window.innerHeight;
    heroH = hero ? hero.offsetHeight : vh;
    if (marquee) marquee.setWidth = marquee.el.scrollWidth / 4;
    lastY = -1; // force the next frame to re-apply scroll effects
  }
  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();

  var lastDir = 1;
  var headerAnchorY = 0;
  var prevY = 0;

  function setStep(i) {
    if (i === activeStep) return;
    activeStep = i;
    processSteps.forEach(function (step, k) {
      step.classList.toggle("is-active", k === i);
      step.classList.toggle("is-past", k < i);
    });
    var num = "0" + (i + 1);
    if (processNow) processNow.textContent = num;
    if (processBigNum) processBigNum.textContent = num;
    if (processBigLabel && processSteps[i]) processBigLabel.textContent = processSteps[i].querySelector("h3").textContent;
    if (processCenter) {
      processCenter.classList.remove("is-swap");
      void processCenter.offsetWidth; // restart the pop animation
      processCenter.classList.add("is-swap");
    }
  }

  function onScroll(y) {
    var max = document.documentElement.scrollHeight - vh;
    var pct = max > 0 ? clamp(y / max, 0, 1) * 100 : 0;

    // Reads first, then writes, so the browser lays out at most once.
    var brandRect = motion && brandWords.length ? brandText.getBoundingClientRect() : null;
    var processRect = motion && process ? process.getBoundingClientRect() : null;
    var footerRect = motion && footerWord ? footerWord.getBoundingClientRect() : null;

    /* Header: solid once scrolled, hides going down, returns going up */
    header.classList.toggle("is-scrolled", y > 12);
    var dir = y > prevY ? 1 : y < prevY ? -1 : lastDir;
    prevY = y;
    if (dir !== lastDir) { headerAnchorY = y; lastDir = dir; }
    var navOpen = mainNav && mainNav.classList.contains("is-open");
    if (motion && !navOpen) {
      if (dir === 1 && y > heroH * 0.6 && y - headerAnchorY > 60) header.classList.add("is-hidden");
      else if (dir === -1 && (headerAnchorY - y > 30 || y < heroH * 0.6)) header.classList.remove("is-hidden");
    } else {
      header.classList.remove("is-hidden");
    }

    if (progressBar) progressBar.style.width = pct + "%";
    if (spineFill) spineFill.style.height = pct + "%";
    if (backToTopFill) backToTopFill.style.strokeDashoffset = String(BTT_CIRCUMFERENCE * (1 - pct / 100));
    if (backToTop) backToTop.classList.toggle("is-visible", y > 480);

    if (!motion) return;

    /* Hero: copy drifts up and fades, orbit grows and turns, glow sinks */
    if (y < heroH * 1.2) {
      var hp = clamp(y / heroH, 0, 1);
      if (heroCopy) {
        heroCopy.style.translate = "0 " + (-hp * 140).toFixed(1) + "px";
        heroCopy.style.opacity = String(clamp(1 - hp * 1.5, 0, 1));
      }
      if (heroOrbit) {
        heroOrbit.style.translate = "0 " + (hp * 90).toFixed(1) + "px";
        heroOrbit.style.scale = String(1 + hp * 0.35);
        heroOrbit.style.rotate = (hp * 75).toFixed(2) + "deg";
        heroOrbit.style.opacity = String(clamp(1 - hp * 1.25, 0, 1));
      }
      if (heroGlow) heroGlow.style.translate = "0 " + (hp * 260).toFixed(1) + "px";
      if (scrollCue) scrollCue.style.opacity = String(clamp(1 - hp * 6, 0, 1));
    }

    /* Background light drifts at a different speed than the page */
    if (aurora1) aurora1.style.translate = "0 " + (y * 0.12).toFixed(1) + "px";
    if (aurora2) aurora2.style.translate = "0 " + (-y * 0.08).toFixed(1) + "px";

    /* Brand statement words light up one after another */
    if (brandRect) {
      var bp = clamp((vh * 0.88 - brandRect.top) / (vh * 0.55), 0, 1);
      var lit = bp * (brandWords.length + 2);
      for (var i = 0; i < brandWords.length; i++) {
        var o = 0.14 + 0.86 * clamp(lit - i, 0, 1);
        brandWords[i].style.opacity = o.toFixed(3);
      }
    }

    /* How We Work: pinned, steps advance through the scroll distance */
    if (processRect) {
      var travel = processRect.height - vh;
      var pp = travel > 0 ? clamp(-processRect.top / travel, 0, 1) : 0;
      var n = processSteps.length;
      setStep(Math.min(n - 1, Math.floor(pp * n)));
      if (processFill) processFill.style.transform = "scaleX(" + pp.toFixed(4) + ")";
      if (processRing) processRing.style.strokeDashoffset = (RING_C * (1 - pp)).toFixed(2);
      if (processInnerRing) processInnerRing.style.transform = "rotate(" + (pp * -180).toFixed(2) + "deg)";
      processNodes.forEach(function (node, k) { node.classList.toggle("is-lit", pp >= k / n - 0.001); });
    }

    /* Footer wordmark fills left to right as the page bottoms out */
    if (footerRect) {
      // 0 when the word peeks in at the bottom, 1 once it's fully on screen
      var fp = clamp((vh - footerRect.top) / footerRect.height, 0, 1);
      footerWord.style.setProperty("--fill", (fp * 100).toFixed(1) + "%");
    }
  }

  var lastT = performance.now();
  var lastFrameY = window.scrollY;
  var velocity = 0;
  function frame(t) {
    if (lenis) lenis.raf(t);
    var y = window.scrollY;
    var dt = Math.min(64, Math.max(0, t - lastT));
    lastT = t;
    var dy = y - lastFrameY;
    lastFrameY = y;
    velocity += (dy - velocity) * 0.18;

    if (marquee && marquee.visible && marquee.setWidth > 0) {
      if (dy > 0.5) marquee.dir = -1;
      else if (dy < -0.5) marquee.dir = 1;
      var speed = 0.045 * dt + Math.min(Math.abs(velocity) * 0.6, 40);
      var w = marquee.setWidth;
      marquee.x += marquee.dir * speed;
      marquee.x = ((marquee.x % w) + w) % w - w; // keep in [-w, 0)
      marquee.el.style.transform = "translate3d(" + marquee.x.toFixed(2) + "px,0,0)";
    }

    if (y !== lastY) {
      onScroll(y);
      lastY = y;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Cursor-spotlight + 3D tilt on cards (delegated so it still ---------- */
  /* works for cards added/rebuilt later, e.g. tools search/filter re-renders) */
  if (!prefersReducedMotion && finePointer) {
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest(".card");
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width;
      var relY = (e.clientY - rect.top) / rect.height;
      card.style.setProperty("--spot-x", relX * 100 + "%");
      card.style.setProperty("--spot-y", relY * 100 + "%");
      var tiltX = (relY - 0.5) * -7;
      var tiltY = (relX - 0.5) * 7;
      card.style.transform = "perspective(900px) rotateX(" + tiltX + "deg) rotateY(" + tiltY + "deg) translateY(-6px)";
    });
    document.addEventListener("pointerout", function (e) {
      var card = e.target.closest(".card");
      if (!card || (e.relatedTarget && card.contains(e.relatedTarget))) return;
      card.style.transform = "";
    });
  }

  /* ---------- Hero visual parallax tilt ---------- */
  var heroVisual = document.querySelector(".hero-visual");
  if (heroVisual && hero && !prefersReducedMotion && finePointer) {
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.transform = "rotateY(" + (relX * 10) + "deg) rotateX(" + (relY * -10) + "deg)";
    });
    hero.addEventListener("pointerleave", function () {
      heroVisual.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  }

  /* ---------- Magnetic hover on hero CTA buttons ---------- */
  if (!prefersReducedMotion && finePointer) {
    document.querySelectorAll(".hero-cta .btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + relX * 0.25 + "px, " + relY * 0.25 + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
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
