/**
 * CIEL Fine Dining — script.js
 *
 * 1.  Magnetic cursor with label
 * 2.  BIG background name: cursor parallax (requestAnimationFrame lerp)
 * 3.  Hero photo subtle parallax
 * 4.  Navbar scroll state
 * 5.  Mobile menu
 * 6.  Hero photo clip-path entrance
 * 7.  Scroll-triggered: clip-path reveals + fade-ins (IntersectionObserver)
 * 8.  Counter animation on stats (none here, but ready)
 * 9.  Menu tabs with re-triggered line animations
 * 10. Reservation form: validation, date default, success
 * 11. Smooth anchor scroll
 * 12. Back to top
 */

'use strict';

/* ── Utils ── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const isMob = () => window.innerWidth < 580;

/* ════════════════════════════════════════
   1 + 2. CURSOR & BG NAME PARALLAX
   Uses a single rAF loop for both.
   bgName shifts ±16px based on cursor
   position relative to viewport center.
════════════════════════════════════════ */
const cur  = $('#cur');
const cur2 = $('#cur2');
const curL = $('#cur-label');
const bgName = $('#bgName');
const heroPhoto = $('#heroPhoto');
const heroImg   = $('#heroImg');

let mx = window.innerWidth  / 2;
let my = window.innerHeight / 2;

// Smooth positions for cursor
let cx = mx, cy = my;
let rx = mx, ry = my;

// Smooth offset for parallax name
let pox = 0, poy = 0;
// Photo parallax (very subtle)
let phx = 0, phy = 0;

// Track raw mouse (no DOM writes here)
document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

// Hover expand on interactive elements
function bindCursorHover() {
  $$('a, button, .tab, .btn-submit, .dl, .ta').forEach(el => {
    const label = el.dataset.label || '';
    el.addEventListener('mouseenter', () => {
      cur.classList.add('hov');
      cur2.classList.add('hov');
      if (label) {
        curL.textContent = label;
        curL.classList.add('show');
      }
    });
    el.addEventListener('mouseleave', () => {
      cur.classList.remove('hov');
      cur2.classList.remove('hov');
      curL.classList.remove('show');
    });
  });
}
bindCursorHover();

/* Main animation loop */
function raf() {
  if (!isMob()) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const offX = mx - vw / 2;
    const offY = my - vh / 2;

    // Cursor dot — fast follow
    cx = lerp(cx, mx, 0.45);
    cy = lerp(cy, my, 0.45);
    cur.style.left = cx + 'px';
    cur.style.top  = cy + 'px';
    curL.style.left = cx + 'px';
    curL.style.top  = cy + 'px';

    // Cursor ring — slow trail
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    cur2.style.left = rx + 'px';
    cur2.style.top  = ry + 'px';

    // BG name parallax — very slow, max ±18px
    pox = lerp(pox, offX * 0.032, 0.07);
    poy = lerp(poy, offY * 0.032, 0.07);
    if (bgName) {
      bgName.style.transform =
        `translate(calc(-50% + ${pox}px), calc(-50% + ${poy}px))`;
    }

    // Hero photo parallax — opposite direction, max ±8px
    phx = lerp(phx, offX * -0.012, 0.07);
    phy = lerp(phy, offY * -0.008, 0.07);
    if (heroImg) {
      heroImg.style.transform = `translate(${phx}px, ${phy}px) scale(1.06)`;
    }
  }
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* ════════════════════════════════════════
   3. NAVBAR SCROLL STATE
════════════════════════════════════════ */
const hdr = $('#hdr');
const btt = $('#btt');
window.addEventListener('scroll', () => {
  hdr?.classList.toggle('stuck', window.scrollY > 50);
  btt?.classList.toggle('show', window.scrollY > 500);
}, { passive: true });

/* ════════════════════════════════════════
   4. MOBILE MENU
════════════════════════════════════════ */
const mobToggle = $('#mob-toggle');
const mobNav    = $('#mob-nav');
let mobOpen = false;

function toggleMob() {
  mobOpen = !mobOpen;
  mobNav.classList.toggle('open', mobOpen);
  mobToggle.setAttribute('aria-expanded', mobOpen);
  document.body.style.overflow = mobOpen ? 'hidden' : '';
  const s = $$('span', mobToggle);
  if (mobOpen) {
    s[0].style.transform = 'translateY(6px) rotate(45deg)';
    s[1].style.transform = 'translateY(-6px) rotate(-45deg)';
  } else {
    s[0].style.transform = '';
    s[1].style.transform = '';
  }
}
mobToggle?.addEventListener('click', toggleMob);
$$('.mob-link').forEach(l => l.addEventListener('click', () => {
  if (mobOpen) toggleMob();
}));

/* ════════════════════════════════════════
   5. HERO PHOTO ENTRANCE (clip-path)
════════════════════════════════════════ */
window.addEventListener('load', () => {
  const photo = $('#heroPhoto');
  if (photo) {
    setTimeout(() => photo.classList.add('in'), 200);
  }
});

/* ════════════════════════════════════════
   6. SCROLL REVEAL (IntersectionObserver)
   clip-path + fade-in animations
════════════════════════════════════════ */
const revObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    revObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' });

$$('.clip-reveal, .fade-in').forEach(el => revObserver.observe(el));

/* ════════════════════════════════════════
   7. MENU TABS
════════════════════════════════════════ */
$$('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const id = tab.dataset.tab;
    $$('.tab-panel').forEach(p => p.classList.remove('active'));
    const panel = $('#' + id);
    if (!panel) return;
    panel.classList.add('active');

    // Stagger line items in new panel
    const lines = $$('.dl, .ta, .fade-in', panel);
    lines.forEach(el => el.classList.remove('in'));
    lines.forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 40 + i * 65);
    });
  });
});

// Init first panel
setTimeout(() => {
  $$('#t1 .dl').forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 300 + i * 80);
  });
}, 400);

/* ════════════════════════════════════════
   8. RESERVATION FORM
════════════════════════════════════════ */
const form    = $('#res-form');
const dateInp = $('#rDate');
const formBtn = $('#formBtn');
const btnTxt  = $('#btnTxt');

// Default date — next Tuesday
if (dateInp) {
  const now = new Date();
  const ymd = d => d.toISOString().split('T')[0];
  dateInp.min = ymd(now);
  const daysToTue = (2 - now.getDay() + 7) % 7 || 7;
  const nextTue = new Date(now);
  nextTue.setDate(now.getDate() + daysToTue);
  dateInp.value = ymd(nextTue);
}

// Gold focus
$$('.f-field input, .f-field select, .f-field textarea').forEach(f => {
  f.addEventListener('focus', () => {
    f.style.borderBottomColor = 'var(--gold)';
  });
  f.addEventListener('blur', () => {
    if (!f.value) f.style.borderBottomColor = '';
  });
});

form?.addEventListener('submit', e => {
  e.preventDefault();
  const required = [
    $('#rName'), $('#rEmail'), $('#rDate'), $('#rGuests')
  ];
  let ok = true;
  required.forEach(f => {
    if (!f?.value?.trim()) {
      f.style.borderBottomColor = '#c0392b';
      ok = false;
    } else {
      f.style.borderBottomColor = 'var(--gold)';
    }
  });
  if (!ok) { required.find(f => !f?.value?.trim())?.focus(); return; }

  // Success
  if (btnTxt) btnTxt.textContent = '✓ Reservation Received';
  if (formBtn) {
    formBtn.style.background = '#2d6a4f';
    formBtn.style.pointerEvents = 'none';
  }
  setTimeout(() => {
    if (btnTxt) btnTxt.textContent = 'Reserve My Table';
    if (formBtn) {
      formBtn.style.background = '';
      formBtn.style.pointerEvents = '';
    }
    form.reset();
    $$('.f-field input, .f-field select, .f-field textarea').forEach(f => {
      f.style.borderBottomColor = '';
    });
    // Re-set default date
    if (dateInp) {
      const now = new Date();
      const dtu = (2 - now.getDay() + 7) % 7 || 7;
      const next = new Date(now);
      next.setDate(now.getDate() + dtu);
      dateInp.value = next.toISOString().split('T')[0];
    }
  }, 4000);
});

/* ════════════════════════════════════════
   9. SMOOTH ANCHOR SCROLL
════════════════════════════════════════ */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ════════════════════════════════════════
   10. BACK TO TOP
════════════════════════════════════════ */
btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Signature */
console.log('%cCIEL\nFine Dining · Mayfair · London',
  'font-family:Georgia,serif;font-style:italic;font-size:1.5rem;color:#a07840');
