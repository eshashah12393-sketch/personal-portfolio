/* ============================================================
   PORTFOLIO — script.js
   Theme toggle, mobile nav, scroll reveal, resume, Formspree
   ============================================================ */

(function () {
  "use strict";

  /* ---------- DOM REFERENCES ---------- */
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const yearEl = document.getElementById("year");

  /* ---------- YEAR (HTML ships with a 2026 fallback) ---------- */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- THEME (light / dark) ---------- */
  const THEME_KEY = "portfolio-theme";

  function readStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null; // storage blocked (e.g. Safari Private Mode)
    }
  }

  function getPreferredTheme() {
    const stored = readStoredTheme();
    if (stored === "dark" || stored === "light") return stored;
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (err) {
      return "light";
    }
  }

  function updateToggleA11y(theme) {
    if (!themeToggle) return;
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      /* storage blocked — theme still applies for this session */
    }
    updateToggleA11y(theme);
  }

  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------- MOBILE NAV ---------- */
  let overlay = null;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.addEventListener("click", closeMenu);
    document.body.appendChild(overlay);
    return overlay;
  }

  function openMenu() {
    if (!navLinks || !hamburger) return;
    navLinks.classList.add("open");
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    ensureOverlay().classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!navLinks || !hamburger) return;
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    if (overlay) overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.contains("open") ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    // Keep in sync with the CSS breakpoint (max-width: 900px)
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* ---------- SCROLL EFFECTS ---------- */
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (navbar) navbar.classList.toggle("scrolled", y > 24);
    if (backToTop) backToTop.classList.toggle("show", y > 480);

    setActiveLink();
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- ACTIVE SECTION HIGHLIGHT ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = document.querySelectorAll(".nav-link");

  function setActiveLink() {
    const scrollPos = (window.scrollY || window.pageYOffset) + 120;
    let currentId = "";

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) currentId = section.id;
    });

    navAnchors.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -50px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- CONTACT FORM (native POST to Formspree) ---------- */
  const nextField = contactForm
    ? contactForm.querySelector('input[name="_next"]')
    : null;

  if (nextField && !nextField.value) {
    // Absolute URL so Formspree redirects back to this page after sending
    nextField.value = window.location.href.split("#")[0];
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function () {
      try {
        sessionStorage.setItem("fs-sent", String(Date.now()));
      } catch (err) {
        /* storage blocked — redirect still works, just no status message */
      }
    });
  }

  try {
    const sentAt = sessionStorage.getItem("fs-sent");
    if (sentAt && Date.now() - Number(sentAt) < 60000) {
      sessionStorage.removeItem("fs-sent");
      if (formStatus) {
        formStatus.textContent = "Thank you! Your message has been sent.";
        formStatus.className = "form-status success";
      }
    }
  } catch (err) {
    /* ignore */
  }

  /* ---------- RESUME: print-to-PDF ---------- */
  const downloadBtn = document.getElementById("downloadResume");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.print();
    });
  }

  /* ---------- SMOOTH ANCHOR SCROLL ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        (navbar ? navbar.offsetHeight : 0);
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      // Move focus for skip-link / main landmark
      if (target.hasAttribute("tabindex")) {
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ---------- INIT ---------- */
  onScroll();
  setActiveLink();
  window.__portfolioReady = true;
})();
