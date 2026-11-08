/* ============================================================
   flowers.js — latar bunga bergerak, bunga 3D, kartu 3D, klik
   Berdiri sendiri (tidak bergantung pada script.js)
   ============================================================ */
(function () {
  function init() {
    // Bersihkan sisa versi lama supaya tidak dobel
    document.querySelectorAll('.flower-field, .f3d').forEach((el) => el.remove());

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const small  = window.innerWidth < 768;
    const rand   = (a, b) => Math.random() * (b - a) + a;
    const pick   = (arr) => arr[Math.floor(Math.random() * arr.length)];

    /* ---------- bunga SVG ---------- */
    const COLORS = [
      ['#fff1f7', '#f472b6'], ['#fce7f3', '#ec4899'], ['#ffe4e6', '#fb7185'],
      ['#f5d0fe', '#e879f9'], ['#fdf2f8', '#f9a8d4'], ['#ffd6e8', '#db2777']
    ];
    let uid = 0;
    function flowerSVG() {
      const [c1, c2] = pick(COLORS);
      const n = pick([5, 6, 8]);
      const id = 'fg' + (uid++);
      let petals = '';
      for (let i = 0; i < n; i++) {
        petals += `<ellipse cx="50" cy="27" rx="13" ry="24" fill="url(#${id})" stroke="${c2}" stroke-opacity=".4" transform="rotate(${(360 / n) * i} 50 50)"/>`;
      }
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs>
        <radialGradient id="${id}" cx="50%" cy="15%" r="90%">
          <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
        </radialGradient></defs>${petals}
        <circle cx="50" cy="50" r="10" fill="#fde68a"/>
        <circle cx="50" cy="50" r="5" fill="#f59e0b" opacity=".7"/></svg>`;
    }

    /* ---------- latar: bunga melayang + kelopak jatuh ---------- */
    const field = document.createElement('div');
    field.className = 'flower-field';
    field.setAttribute('aria-hidden', 'true');

    const flowerCount = small ? 10 : 22;
    for (let i = 0; i < flowerCount; i++) {
      const el = document.createElement('div');
      const far = Math.random() < 0.35;                   // sebagian "jauh" (kecil & blur)
      el.className = 'fl' + (Math.random() < 0.4 ? ' tilt' : '');
      el.style.cssText =
        `--s:${far ? rand(30, 55) : rand(80, 150)}px;` +
        `--x:${rand(-2, 96)}%;--y:${rand(-2, 92)}%;` +
        `--o:${far ? rand(.35, .5) : rand(.55, .85)};` +
        `--bl:${far ? 1.5 : 0}px;` +
        `--dx:${rand(-70, 70)}px;--dy:${rand(-80, 80)}px;` +
        `--dur:${rand(8, 16)}s;--spin:${rand(24, 55)}s;`;
      el.innerHTML = flowerSVG();
      if (Math.random() < 0.5) el.querySelector('svg').style.animationDirection = 'reverse';
      field.appendChild(el);
    }

    if (!reduce) {
      const petalCount = small ? 14 : 30;
      for (let i = 0; i < petalCount; i++) {
        const p = document.createElement('span');
        p.className = 'petal';
        p.style.cssText =
          `--x:${rand(0, 100)}%;--w:${rand(10, 22)}px;--o:${rand(.55, .9)};` +
          `--sway:${rand(-120, 120)}px;--dur:${rand(10, 20)}s;--delay:${-rand(0, 20)}s;`;
        field.appendChild(p);
      }
    }
    document.body.prepend(field);

    /* ---------- bunga 3D besar di hero ---------- */
    const heroBg = document.querySelector('.hero-bg') || document.querySelector('.hero');
    function makeFlower3D(cls) {
      const wrap = document.createElement('div');
      wrap.className = 'f3d ' + cls;
      const spin = document.createElement('div');
      spin.className = 'f3d-spin';
      // [jumlah kelopak, lebar, tinggi, kemiringan, offset sudut, tinggi Z]
      const layers = [
        [12, 60, 170, 76, 0,  0],
        [9,  50, 140, 54, 20, 16],
        [7,  42, 108, 32, 10, 32],
        [5,  34, 76,  14, 30, 46]
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
      heroBg.appendChild(makeFlower3D('f3d-c'));
    }

    /* ---------- parallax: latar bunga bergeser lawan arah kursor ---------- */
    if (fine && !reduce) {
      let raf = 0;
      document.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const px = e.clientX / window.innerWidth - 0.5;
          const py = e.clientY / window.innerHeight - 0.5;
          field.style.transform = `translate3d(${(-px * 36).toFixed(1)}px, ${(-py * 28).toFixed(1)}px, 0)`;
        });
      });
    }

    /* ---------- hero: isi ikut miring 3D mengikuti kursor ---------- */
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
        if (card.dataset.tilt) return;
        card.dataset.tilt = '1';
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
    if (!reduce && !window.__petalBurst) {
      window.__petalBurst = true;
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

/* ============================================================
   BUNYI KLIK — "ting" lembut saat klik (tanpa file audio)
   Tempel di PALING BAWAH flowers.js
   ============================================================ */
(function () {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  const VOLUME = 0.18;                                   // ← ubah volume di sini (0.05 – 0.4)
  const NOTES  = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // nada pentatonik (enak didengar)
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('clickSoundMuted') === '1'; } catch (e) {}

  function chime(freq) {
    if (muted) return;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(VOLUME, now + 0.01);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    master.connect(ctx.destination);

    // nada utama + 2 harmonik tipis = bunyi lonceng kecil
    [[1, 'sine', 1], [2, 'sine', 0.35], [3.01, 'triangle', 0.12]].forEach(([mult, type, gain]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq * mult;
      g.gain.value = gain;
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#soundToggle')) return;
    const isButton = e.target.closest('a, button, .btn');
    // tombol/link = nada lebih tinggi, klik biasa = nada acak
    const freq = isButton ? NOTES[NOTES.length - 1 - Math.floor(Math.random() * 2)]
                          : NOTES[Math.floor(Math.random() * NOTES.length)];
    chime(freq);
  });

  /* ---------- tombol mute/unmute (pojok kiri bawah) ---------- */
  const style = document.createElement('style');
  style.textContent = `
    #soundToggle{position:fixed;left:20px;bottom:20px;z-index:1200;width:44px;height:44px;
      border-radius:50%;border:1px solid rgba(236,72,153,.35);background:rgba(255,255,255,.85);
      backdrop-filter:blur(8px);font-size:1.2rem;cursor:pointer;
      box-shadow:0 6px 18px rgba(236,72,153,.25);transition:transform .2s ease}
    #soundToggle:hover{transform:scale(1.1) rotate(-8deg)}`;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'soundToggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Nyalakan/matikan bunyi klik');
  const paint = () => { btn.textContent = muted ? '🔕' : '🔔'; };
  paint();
  btn.addEventListener('click', () => {
    muted = !muted;
    try { localStorage.setItem('clickSoundMuted', muted ? '1' : '0'); } catch (e) {}
    paint();
    if (!muted) chime(NOTES[3]);
  });
  document.body.appendChild(btn);
})();