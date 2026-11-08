/* ============================================================
   PORTFOLIO — SCRIPT.JS
   Interaktivitas: Navbar, Tabs, Scroll Animations, Counter, dll.
   ============================================================ */

/* ============================================================
   DATA PROFIL — ubah di sini saja (otomatis tampil di seluruh halaman)
   ============================================================ */
const PROFILE = {
  nim:   '24051108',     // ← ganti dengan NIM kamu, contoh: '2024xxxxxx'
  kelas: 'TI24D',   // ← ganti dengan kelas kamu, contoh: 'TI-3A'
  email: 'lisyaayu466@gmail.com'
};

document.addEventListener('DOMContentLoaded', () => {
  // Isi NIM & Kelas ke semua elemen bertanda data-profile
  document.querySelectorAll('[data-profile]').forEach(el => {
    const v = PROFILE[el.dataset.profile];
    if (v) el.textContent = v;
  });

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const progressBar = document.getElementById('scrollProgress');

  let scrollTicking = false;
  function onScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ')';
    }
    backToTop.classList.toggle('visible', scrollY > 500);
    updateActiveNavLink();
    scrollTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  // ===== ROLE TYPING EFFECT =====
  const roleEl = document.getElementById('roleText');
  if (roleEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const roles = ['Web Developer', 'Desktop Developer (Java)', 'Mobile Developer (Android)'];
    let r = 0, c = 0, deleting = false;
    (function tick() {
      const word = roles[r];
      roleEl.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 80;
      if (!deleting && c === word.length) { deleting = true; delay = 1400; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      c += deleting ? -1 : 1;
      setTimeout(tick, delay);
    })();
  }

  // ===== BACK TO TOP =====
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== MOBILE NAV TOGGLE =====
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  function setMenu(open) {
    navToggle.classList.toggle('active', open);
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  navToggle.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('open'));
  });

  // Tutup menu saat link diklik
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  // Tutup menu dengan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  // Jika layar diputar / dilebarkan ke desktop, pastikan menu & scroll-lock reset
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  // ===== ACTIVE NAV LINK =====
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinksAll.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  // ===== CURSOR GLOW (Desktop) =====
  const cursorGlow = document.getElementById('cursorGlow');

  if (cursorGlow && window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  // ===== SKILLS TABS =====
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  function activateTab(btn, focus) {
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.tabIndex = -1;
    });
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.tabIndex = 0;
    if (focus) btn.focus();
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');

    // Reset lalu animasikan ulang bar di tab yang baru aktif
    document.querySelectorAll('.skill-fill').forEach(bar => { bar.style.width = '0'; });
    setTimeout(animateSkillBars, 100);
  }

  tabBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => activateTab(btn, false));
    btn.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabBtns[(i + 1) % tabBtns.length];
      if (e.key === 'ArrowLeft') next = tabBtns[(i - 1 + tabBtns.length) % tabBtns.length];
      if (next) { e.preventDefault(); activateTab(next, true); }
    });
  });

  // ===== SCROLL ANIMATIONS (Intersection Observer) =====
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('visible'));
    // ditunda agar semua variabel di bawah sudah terdeklarasi
    setTimeout(() => { animateSkillBars(); animateCounters(); }, 300);
  }

  const observer = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Animate skill bars when they come into view
        if (entry.target.closest('#skills')) {
          setTimeout(animateSkillBars, 300);
        }

        // Animate counters when stats come into view
        if (entry.target.closest('.hero-stats')) {
          animateCounters();
        }
      }
    });
  }, observerOptions) : null;

  if (observer) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
  }

  // ===== SKILL BAR ANIMATION =====
  function animateSkillBars() {
    const activeTab = document.querySelector('.tab-content.active');
    if (!activeTab) return;

    activeTab.querySelectorAll('.skill-fill').forEach(bar => {
      const targetWidth = bar.dataset.width;
      bar.style.width = targetWidth + '%';
    });
  }

  // Initial animation for default tab
  setTimeout(animateSkillBars, 800);

  // ===== COUNTER ANIMATION =====
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    document.querySelectorAll('.stat-number').forEach(counter => {
      const target = parseInt(counter.dataset.target);
      const duration = 1500;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = Math.floor(current);
      }, 16);
    });
  }

  // ===== CONTACT FORM =====
  // Situs ini statis (tanpa server): pesan dikirim lewat Gmail compose yang sudah terisi
  // otomatis (tujuan: PROFILE.email). Jika popup diblokir, dipakai mailto: sebagai cadangan.
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('#name').value.trim();
      const email = contactForm.querySelector('#email').value.trim();
      const message = contactForm.querySelector('#message').value.trim();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const subject = 'Pesan dari portfolio — ' + name;
      const body = message + '\n\n— ' + name + ' (' + email + ')';
      const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1'
        + '&to=' + encodeURIComponent(PROFILE.email)
        + '&su=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      const win = window.open(gmailUrl, '_blank', 'noopener');
      if (!win) {
        window.location.href = 'mailto:' + PROFILE.email
          + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }

      submitBtn.textContent = '✅ Membuka Gmail…';
      submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      submitBtn.disabled = true;

      setTimeout(() => {
        contactForm.reset();
        submitBtn.innerHTML = '<i data-lucide="send" class="btn-icon"></i> Kirim Pesan';
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 3000);
    });
  }

  // ===== SMOOTH SCROLL for all anchor links =====
  // Tautan placeholder (href="#") diabaikan; id yang tidak ada tidak menyebabkan error.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      e.preventDefault();
      if (!href || href === '#') return;

      const target = document.getElementById(href.slice(1));
      if (target) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        history.replaceState(null, '', href);
      }
    });
  });
});


/* ============================================================
   TEMA BUNGA — latar bunga, bunga 3D, kartu 3D, percikan klik
   (tempel di PALING BAWAH script.js)
   ============================================================ */
(function () {
  function init() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const small  = window.innerWidth < 768;
    const rand   = (a, b) => Math.random() * (b - a) + a;
    const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];

    /* ---------- bunga SVG ---------- */
    const COLORS = [
      ['#fff1f7', '#f472b6'], ['#fce7f3', '#ec4899'], ['#ffe4e6', '#fb7185'],
      ['#f5d0fe', '#e879f9'], ['#fdf2f8', '#f9a8d4']
    ];
    let uid = 0;
    function flowerSVG() {
      const [c1, c2] = pick(COLORS);
      const n = pick([5, 6, 8]);
      const id = 'fg' + (uid++);
      let petals = '';
      for (let i = 0; i < n; i++) {
        petals += `<ellipse cx="50" cy="27" rx="13" ry="24" fill="url(#${id})" stroke="${c2}" stroke-opacity=".35" transform="rotate(${(360 / n) * i} 50 50)"/>`;
      }
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>
        <radialGradient id="${id}" cx="50%" cy="15%" r="90%">
          <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
        </radialGradient></defs>${petals}
        <circle cx="50" cy="50" r="10" fill="#fde68a"/>
        <circle cx="50" cy="50" r="5" fill="#f59e0b" opacity=".65"/></svg>`;
    }

    /* ---------- latar: bunga melayang + kelopak jatuh ---------- */
    const field = document.createElement('div');
    field.className = 'flower-field';
    field.setAttribute('aria-hidden', 'true');

    const flowerCount = small ? 8 : 16;
    for (let i = 0; i < flowerCount; i++) {
      const el = document.createElement('div');
      const far = Math.random() < 0.4;                    // sebagian dibuat "jauh" (kecil & blur)
      el.className = 'fl';
      el.style.cssText =
        `--s:${far ? rand(26, 48) : rand(60, 120)}px;` +
        `--x:${rand(-3, 96)}%;--y:${rand(-3, 92)}%;` +
        `--o:${far ? rand(.25, .4) : rand(.4, .65)};` +
        `--bl:${far ? 2 : 0}px;` +
        `--dx:${rand(-60, 60)}px;--dy:${rand(-70, 70)}px;` +
        `--dur:${rand(9, 18)}s;--spin:${rand(30, 70)}s;`;
      el.innerHTML = flowerSVG();
      if (Math.random() < 0.5) el.querySelector('svg').style.animationDirection = 'reverse';
      field.appendChild(el);
    }

    if (!reduce) {
      const petalCount = small ? 12 : 26;
      for (let i = 0; i < petalCount; i++) {
        const p = document.createElement('span');
        p.className = 'petal';
        p.style.cssText =
          `--x:${rand(0, 100)}%;--w:${rand(9, 20)}px;--o:${rand(.45, .85)};` +
          `--sway:${rand(-120, 120)}px;--dur:${rand(11, 22)}s;--delay:${-rand(0, 22)}s;`;
        field.appendChild(p);
      }
    }
    document.body.prepend(field);

    /* ---------- bunga 3D besar di hero ---------- */
    const heroBg = document.querySelector('.hero-bg');
    function makeFlower3D(cls) {
      const wrap = document.createElement('div');
      wrap.className = 'f3d ' + cls;
      const spin = document.createElement('div');
      spin.className = 'f3d-spin';
      // [jumlah kelopak, lebar, tinggi, kemiringan, offset sudut, tinggi Z]
      const layers = [
        [10, 56, 150, 74, 0,  0],
        [8,  46, 124, 50, 22, 14],
        [6,  38, 96,  26, 10, 28]
      ];
      layers.forEach(([n, w, h, tilt, off, z]) => {
        const layer = document.createElement('div');
        layer.className = 'f3d-layer';
        layer.style.transform = `translateZ(${z}px)`;
        for (let i = 0; i < n; i++) {
          const pt = document.createElement('div');
          pt.className = 'f3d-petal';
          pt.style.cssText = `--pw:${w}px;--ph:${h}px;--t:${tilt}deg;--a:${off + (360 / n) * i}deg;`;
          layer.appendChild(pt);
        }
        spin.appendChild(layer);
      });
      const core = document.createElement('div');
      core.className = 'f3d-core';
      spin.appendChild(core);
      wrap.appendChild(spin);
      return wrap;
    }
    if (heroBg) {
      heroBg.appendChild(makeFlower3D('f3d-a'));
      heroBg.appendChild(makeFlower3D('f3d-b'));
    }

    /* ---------- hero: parallax 3D mengikuti kursor ---------- */
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    if (hero && heroContent && fine && !reduce) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        heroContent.style.setProperty('--ry', (px * 6).toFixed(2) + 'deg');
        heroContent.style.setProperty('--rx', (-py * 5).toFixed(2) + 'deg');
      });
      hero.addEventListener('mouseleave', () => {
        heroContent.style.setProperty('--ry', '0deg');
        heroContent.style.setProperty('--rx', '0deg');
      });
    }

    /* ---------- kartu 3D: miring mengikuti kursor ---------- */
    if (fine && !reduce) {
      document.querySelectorAll('.project-card, .info-card, .skill-card, .contact-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.transition = 'transform .12s ease-out, box-shadow .3s';
          card.style.transform =
            `perspective(900px) rotateX(${((0.5 - py) * 12).toFixed(2)}deg) ` +
            `rotateY(${((px - 0.5) * 14).toFixed(2)}deg) translateY(-6px) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transition = 'transform .5s ease, box-shadow .3s';
          card.style.transform = '';
          setTimeout(() => card.style.removeProperty('transition'), 520);
        });
      });
    }

    /* ---------- klik: percikan kelopak ---------- */
    if (!reduce) {
      document.addEventListener('click', (e) => {
        for (let i = 0; i < 9; i++) {
          const b = document.createElement('span');
          b.className = 'burst';
          const ang = rand(0, Math.PI * 2), dist = rand(40, 110);
          b.style.left = e.clientX + 'px';
          b.style.top = e.clientY + 'px';
          b.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
          b.style.setProperty('--by', Math.sin(ang) * dist + 40 + 'px');
          document.body.appendChild(b);
          setTimeout(() => b.remove(), 950);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();