/* ==========================================================================
   ELCE Danışmanlık — Main JavaScript
   Header scroll, mobile nav, reveal animations, service card spotlight,
   counters, FAQ accordion, contact form.
   ========================================================================== */
(function () {
  "use strict";

  // Initial theme check (needs to run before any other script executes)
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }

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
      const list = item.closest(".faq-list, .faq-grid");
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

  // Pre-fill contact form message based on URL ref parameter
  const messageInput = document.getElementById("message");
  if (messageInput) {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      let prefilledText = "";
      if (ref === "muhafazakar") {
        prefilledText = "Merhaba, Yatırım Profil Analizcisi sonucuma göre 'Muhafazakar Profil & Sermaye Koruma' (Finansal & Portföy Danışmanlığı) hizmetiniz hakkında detaylı bilgi ve teklif almak istiyorum.";
      } else if (ref === "dengeli") {
        prefilledText = "Merhaba, Yatırım Profil Analizcisi sonucuma göre 'Dengeli Büyüme & Gayrimenkul Yatırımı' (Gayrimenkul Danışmanlığı & Yatırım Analizi) hizmetiniz hakkında detaylı bilgi ve teklif almak istiyorum.";
      } else if (ref === "yuksek_getiri") {
        prefilledText = "Merhaba, Yatırım Profil Analizcisi sonucuma göre 'Yüksek Getiri & Ticari Girişimcilik' (Ticari Aracılık & Tarım) hizmetiniz hakkında detaylı bilgi ve teklif almak istiyorum.";
      }
      if (prefilledText) {
        messageInput.value = prefilledText;
      }
    }
  }

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

      // FormSubmit AJAX integration
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.textContent = "Gönderiliyor…";
      btn.disabled = true;

      const nameVal = form.querySelector("#name") ? form.querySelector("#name").value.trim() : "";
      const emailVal = form.querySelector("#email") ? form.querySelector("#email").value.trim() : "";
      const phoneVal = form.querySelector("#phone") ? form.querySelector("#phone").value.trim() : "";
      const msgVal = form.querySelector("#message") ? form.querySelector("#message").value.trim() : "";

      fetch("https://formsubmit.co/ajax/info@elcedanismanlik.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          "Ad Soyad": nameVal,
          "E-posta": emailVal,
          "Telefon": phoneVal,
          "Mesaj": msgVal
        })
      })
      .then(response => {
        if (!response.ok) throw new Error("Gönderim başarısız");
        return response.json();
      })
      .then(data => {
        form.reset();
        btn.innerHTML = original;
        btn.disabled = false;
        status.className = "form-status success";
        status.textContent = "Mesajınız alındı. Talebiniz info@elcedanismanlik.com adresine başarıyla iletildi.";
      })
      .catch(error => {
        console.error("E-posta gönderim hatası:", error);
        btn.innerHTML = original;
        btn.disabled = false;
        status.className = "form-status error";
        status.textContent = "Gönderim sırasında hata oluştu. Lütfen info@elcedanismanlik.com adresine doğrudan e-posta gönderin.";
      });
    });

    // clear error as user types
    form.querySelectorAll("[data-required]").forEach((input) =>
      input.addEventListener("input", () => showError(input, false))
    );
  }

  /* ---------- Investment Profile Analyzer ---------- */
  const riskBtns = document.querySelectorAll(".analyzer-btn[data-risk]");
  const targetBtns = document.querySelectorAll(".analyzer-btn[data-target]");
  const resultDiv = document.getElementById("analyzer-result");
  
  let selectedRisk = null;
  let selectedTarget = null;
  
  const updateRecommendation = () => {
    if (!selectedRisk || !selectedTarget || !resultDiv) return;
    
    let title = "";
    let text = "";
    let refParam = "";
    
    if (selectedRisk === "low") {
      title = "Muhafazakar Profil & Sermaye Koruma";
      text = "Sizin için en uygun hizmetimiz Finansal & Portföy Danışmanlığıdır. Düşük riskli devlet tahvilleri, altın ve dengeli fon dağılımları ile varlıklarınızı enflasyona karşı koruyoruz.";
      refParam = "muhafazakar";
    } else if (selectedRisk === "medium") {
      title = "Dengeli Büyüme & Gayrimenkul Yatırımı";
      text = "Sizin için en uygun hizmetimiz Gayrimenkul Danışmanlığı ve Yatırım Analizidir. Bölgesel gelişim potansiyeli yüksek, değer artışı ve kira getirisi sunan projelere odaklanmanızı öneririz.";
      refParam = "dengeli";
    } else {
      title = "Yüksek Getiri & Ticari Girişimcilik";
      text = "Sizin için en uygun hizmetimiz Ticari Faaliyet Danışmanlığı ve Tarım Faaliyetleridir. Güre'deki zeytin üretimimiz gibi yüksek kârlılığa ve ihracat potansiyeline sahip reel sektör yatırımlarını yönetiyoruz.";
      refParam = "yuksek_getiri";
    }
    
    resultDiv.innerHTML = `
      <h4>Öneri: ${title}</h4>
      <p>${text}</p>
      <button type="button" class="btn-sm" id="analyzer-contact-btn" style="display: inline-block; margin-top: 1.2rem; border: none; outline: none; cursor: pointer; padding: 0.65rem 1.4rem; background: var(--gold-300); color: #05090f; border-radius: var(--radius); font-weight: 600; font-size: 0.9rem; transition: background 0.3s var(--ease), transform 0.2s var(--ease);">İletişime Geçin</button>
    `;
    resultDiv.style.display = "block";

    const contactBtn = document.getElementById("analyzer-contact-btn");
    if (contactBtn) {
      contactBtn.addEventListener("click", () => {
        resultDiv.innerHTML = `
          <form id="analyzer-contact-form" novalidate style="margin-top: 1.2rem; border-top: 1px solid var(--line-soft); padding-top: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem;">
            <div style="font-size: 0.92rem; font-weight: 600; color: var(--gold-300); margin-bottom: 0.2rem;">Hızlı Talep Formu: ${title}</div>
            
            <div class="field" style="display: flex; flex-direction: column; gap: 0.25rem;">
              <label for="analyzer-name" style="font-size: 0.82rem; color: var(--text-dim);">Ad Soyad *</label>
              <input type="text" id="analyzer-name" name="name" placeholder="Adınız Soyadınız" data-required style="padding: 0.55rem 0.75rem; font-size: 0.88rem; border-radius: 6px; border: 1px solid var(--line-soft); background: rgba(255,255,255,0.02); color: var(--cream);">
              <span class="err-msg" style="font-size: 0.75rem; color: #ff5555; display: none;">Lütfen adınızı girin.</span>
            </div>

            <div class="field" style="display: flex; flex-direction: column; gap: 0.25rem;">
              <label for="analyzer-email" style="font-size: 0.82rem; color: var(--text-dim);">E-posta *</label>
              <input type="email" id="analyzer-email" name="email" placeholder="ornek@eposta.com" data-required style="padding: 0.55rem 0.75rem; font-size: 0.88rem; border-radius: 6px; border: 1px solid var(--line-soft); background: rgba(255,255,255,0.02); color: var(--cream);">
              <span class="err-msg" style="font-size: 0.75rem; color: #ff5555; display: none;">Geçerli bir e-posta girin.</span>
            </div>

            <div class="field" style="display: flex; flex-direction: column; gap: 0.25rem;">
              <label for="analyzer-msg" style="font-size: 0.82rem; color: var(--text-dim);">Mesajınız *</label>
              <textarea id="analyzer-msg" name="message" data-required style="padding: 0.55rem 0.75rem; font-size: 0.88rem; border-radius: 6px; border: 1px solid var(--line-soft); background: rgba(255,255,255,0.02); color: var(--cream); min-height: 70px; resize: vertical; font-family: inherit;">Merhaba, Yatırım Profil Analizcisi sonucuma göre "${title}" hakkında detaylı bilgi ve teklif almak istiyorum.</textarea>
              <span class="err-msg" style="font-size: 0.75rem; color: #ff5555; display: none;">Lütfen mesajınızı girin.</span>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.65rem 1.2rem; font-size: 0.88rem; margin-top: 0.4rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">Talebi Gönder</button>
            <div class="form-status" style="padding: 0.55rem 0.75rem; font-size: 0.82rem; border-radius: 6px; display: none;"></div>
          </form>
        `;

        const subForm = document.getElementById("analyzer-contact-form");
        if (subForm) {
          const status = subForm.querySelector(".form-status");
          const inputs = subForm.querySelectorAll("[data-required]");
          
          inputs.forEach(input => {
            input.addEventListener("input", () => {
              input.closest(".field").querySelector(".err-msg").style.display = "none";
            });
          });

          subForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let valid = true;
            
            inputs.forEach(input => {
              const val = input.value.trim();
              let ok = val !== "";
              if (ok && input.type === "email") {
                ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
              }
              const errMsg = input.closest(".field").querySelector(".err-msg");
              if (!ok) {
                errMsg.style.display = "block";
                valid = false;
              } else {
                errMsg.style.display = "none";
              }
            });

            if (!valid) {
              status.style.display = "block";
              status.className = "form-status error";
              status.textContent = "Lütfen zorunlu alanları doldurun.";
              return;
            }

            const subBtn = subForm.querySelector('button[type="submit"]');
            const originalText = subBtn.textContent;
            subBtn.textContent = "Gönderiliyor...";
            subBtn.disabled = true;

            const nameVal = document.getElementById("analyzer-name").value.trim();
            const emailVal = document.getElementById("analyzer-email").value.trim();
            const msgVal = document.getElementById("analyzer-msg").value.trim();

            fetch("https://formsubmit.co/ajax/info@elcedanismanlik.com", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({
                "Talep Türü": "Yatırım Profil Analizcisi Sonucu",
                "Seçilen Profil": title,
                "Ad Soyad": nameVal,
                "E-posta": emailVal,
                "Mesaj": msgVal
              })
            })
            .then(res => {
              if (!res.ok) throw new Error();
              return res.json();
            })
            .then(data => {
              subForm.reset();
              subBtn.textContent = originalText;
              subBtn.disabled = false;
              status.style.display = "block";
              status.className = "form-status success";
              status.textContent = "Talebiniz info@elcedanismanlik.com adresine başarıyla iletildi.";
            })
            .catch(err => {
              subBtn.textContent = originalText;
              subBtn.disabled = false;
              status.style.display = "block";
              status.className = "form-status error";
              status.textContent = "Hata oluştu. Lütfen info@elcedanismanlik.com adresine mail atın.";
            });
          });
        }
      });
    }
  };
  
  riskBtns.forEach(btn => btn.addEventListener("click", () => {
    riskBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedRisk = btn.dataset.risk;
    updateRecommendation();
  }));
  
  targetBtns.forEach(btn => btn.addEventListener("click", () => {
    targetBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTarget = btn.dataset.target;
    updateRecommendation();
  }));

  /* ---------- Dynamic Services Filter ---------- */
  const filterBtns = document.querySelectorAll(".category-btn");
  const serviceCards = document.querySelectorAll(".services-grid .service-card, .cards-grid .service-card");
  
  if (filterBtns.length && serviceCards.length) {
    filterBtns.forEach(btn => btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const category = btn.dataset.filter;
      serviceCards.forEach(card => {
        const cat = card.dataset.category || "";
        if (category === "all" || cat.split(" ").includes(category)) {
           card.classList.remove("hidden");
        } else {
           card.classList.add("hidden");
        }
      });
    }));
  }

  /* ---------- Theme Toggle Listener ---------- */
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  /* ---------- Service Detail Page Loader ---------- */
  const serviceTitleEl = document.getElementById("service-title");
  if (serviceTitleEl && window.SERVICES_DATA) {
    const urlParams = new URLSearchParams(window.location.search);
    let serviceId = urlParams.get("id");
    
    if (!serviceId || !window.SERVICES_DATA[serviceId]) {
      serviceId = "yatirim";
    }
    
    const data = window.SERVICES_DATA[serviceId];
    
    document.title = `${data.title} — ELCE Danışmanlık`;
    serviceTitleEl.textContent = data.title;
    
    const categoryEl = document.getElementById("service-category");
    if (categoryEl) categoryEl.textContent = data.category;
    
    const descEl = document.getElementById("service-description");
    if (descEl) descEl.textContent = data.description;
    
    const longDescEl = document.getElementById("service-long-description");
    if (longDescEl) longDescEl.textContent = data.longDescription;
    
    const breadcrumbServiceEl = document.getElementById("breadcrumb-service");
    if (breadcrumbServiceEl) breadcrumbServiceEl.textContent = data.title;
    
    const badgeEl = document.getElementById("form-service-badge");
    if (badgeEl) badgeEl.textContent = `${data.title} Talep Formu`;

    const featuresListEl = document.getElementById("service-features");
    if (featuresListEl) {
      featuresListEl.innerHTML = data.features.map(f => `
        <li style="display: flex; gap: 0.85rem; align-items: start;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 18px; height: 18px; color: var(--gold-300); margin-top: 0.25rem; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <strong style="color: var(--cream); display: block; font-size: 1.02rem; margin-bottom: 0.15rem;">${f.title}</strong>
            <span style="color: var(--text-dim); font-size: 0.95rem; line-height: 1.5;">${f.desc}</span>
          </div>
        </li>
      `).join("");
    }

    const processStepsEl = document.getElementById("service-process");
    if (processStepsEl) {
      processStepsEl.innerHTML = data.process.map((step, idx) => `
        <div class="process-step" style="padding: 1.5rem; display: flex; gap: 1.2rem; align-items: start;">
          <div style="background: var(--gold-glow); border: 1px solid var(--line); color: var(--gold-300); font-family: var(--font-serif); font-size: 1.15rem; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; flex-shrink: 0; font-weight: 600;">
            ${idx + 1}
          </div>
          <div>
            <strong style="color: var(--cream); display: block; font-size: 1.05rem; margin-bottom: 0.25rem;">${step.title}</strong>
            <span style="color: var(--text-dim); font-size: 0.94rem; line-height: 1.5; display: block;">${step.desc}</span>
          </div>
        </div>
      `).join("");
    }
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
