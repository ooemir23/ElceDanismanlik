/* ==========================================================================
   ELCE Danışmanlık — Main JavaScript
   Header scroll, mobile nav, reveal animations, service card spotlight,
   counters, FAQ accordion, contact form.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 30);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Service card spotlight (mouse follow) ---------- */
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent =
          (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close siblings in same list
      const list = item.closest(".faq-list");
      if (list) {
        list.querySelectorAll(".faq-item.open").forEach((other) => {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".faq-a").style.maxHeight = null;
          }
        });
      }
      item.classList.toggle("open", !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    const showError = (field, show) => {
      field.closest(".field").classList.toggle("error", show);
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      const required = form.querySelectorAll("[data-required]");

      required.forEach((input) => {
        const val = input.value.trim();
        let ok = val !== "";
        if (ok && input.type === "email") {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }
        showError(input, !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        status.className = "form-status error";
        status.textContent = "Lütfen zorunlu alanları eksiksiz doldurun.";
        return;
      }

      // Simulated success (no backend in static build)
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = "Gönderiliyor…";
      btn.disabled = true;

      setTimeout(() => {
        form.reset();
        btn.textContent = original;
        btn.disabled = false;
        status.className = "form-status success";
        status.textContent =
          "Mesajınız alındı. Danışmanlarımız en kısa sürede sizinle iletişime geçecek.";
      }, 900);
    });

    // clear error as user types
    form.querySelectorAll("[data-required]").forEach((input) =>
      input.addEventListener("input", () => showError(input, false))
    );
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
