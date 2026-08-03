/* ==========================================================================
   Brandli - main.js
   ניווט, מד התקדמות גלילה, אנימציות חשיפה, ולידציה לטפסים, תוסף נגישות
   ללא תלויות חיצוניות.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $  = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------
     1. Header - צל בגלילה + מד התקדמות
     ------------------------------------------------------------------ */
  var header = $('.site-header');
  var progressBar = $('.scroll-progress__bar');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 12);

    if (progressBar) {
      var max = root.scrollHeight - root.clientHeight;
      var pct = max > 0 ? Math.min(100, (y / max) * 100) : 0;
      progressBar.style.width = pct.toFixed(2) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     2. תפריט מובייל
     ------------------------------------------------------------------ */
  var navToggle = $('.nav-toggle');
  var mainNav = $('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      mainNav.classList.toggle('is-open', !open);
      doc.body.style.overflow = !open ? 'hidden' : '';
    });

    // סגירה בלחיצה על קישור
    $$('.main-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth <= 1000 && !a.closest('.has-sub > a')) {
          navToggle.setAttribute('aria-expanded', 'false');
          mainNav.classList.remove('is-open');
          doc.body.style.overflow = '';
        }
      });
    });

    // סגירה ב-Escape
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('is-open');
        doc.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  // תת־תפריט: קליק במובייל, hover בדסקטופ
  $$('.has-sub > a').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      if (window.innerWidth <= 1000) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('is-open');
      }
    });
  });

  /* ------------------------------------------------------------------
     3. Reveal on scroll
     ------------------------------------------------------------------ */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealables = $$('.reveal');

  if (revealables.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
      revealables.forEach(function (el, i) {
        el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
        io.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------------
     4. ציר תהליך - הדגשת שלבים לפי גלילה
     ------------------------------------------------------------------ */
  var steps = $$('.tl-step');
  if (steps.length && 'IntersectionObserver' in window) {
    var tlIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-on');
      });
    }, { rootMargin: '0px 0px -25% 0px', threshold: 0.35 });
    steps.forEach(function (s) { tlIo.observe(s); });
  }

  /* ------------------------------------------------------------------
     5. ולידציה + שליחת טופס
     ------------------------------------------------------------------ */
  $$('form[data-validate]').forEach(function (form) {
    var status = $('.form-status', form);

    var setError = function (field, msg) {
      var input = $('input, select, textarea', field);
      var box = $('.err', field);
      if (!input) return;
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        if (box) box.textContent = msg;
      } else {
        input.removeAttribute('aria-invalid');
        if (box) box.textContent = '';
      }
    };

    var validateField = function (field) {
      var input = $('input, select, textarea', field);
      if (!input) return true;
      var value = (input.value || '').trim();
      var type = input.getAttribute('data-type') || input.type;

      if (input.required && !value) {
        setError(field, 'שדה חובה');
        return false;
      }
      if (value && type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        setError(field, 'כתובת דוא״ל לא תקינה');
        return false;
      }
      if (value && type === 'tel' && !/^0\d{1,2}[-\s]?\d{7}$|^\+972[-\s]?\d{8,9}$/.test(value.replace(/\s/g, ''))) {
        setError(field, 'מספר טלפון לא תקין (למשל 050-1234567)');
        return false;
      }
      if (value && input.name === 'name' && value.length < 2) {
        setError(field, 'נא להזין שם מלא');
        return false;
      }
      setError(field, '');
      return true;
    };

    $$('.field', form).forEach(function (field) {
      var input = $('input, select, textarea', field);
      if (!input) return;
      input.addEventListener('blur', function () { validateField(field); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var firstBad = null;

      $$('.field', form).forEach(function (field) {
        if (!validateField(field)) {
          ok = false;
          if (!firstBad) firstBad = $('input, select, textarea', field);
        }
      });

      var consent = $('input[name="consent"]', form);
      if (consent && !consent.checked) {
        ok = false;
        if (!firstBad) firstBad = consent;
      }

      if (!ok) {
        if (status) {
          status.className = 'form-status is-err';
          status.textContent = 'נראה שחסרים פרטים או שיש שדה לא תקין. בדקו את השדות המסומנים ונסו שוב.';
        }
        if (firstBad) firstBad.focus();
        return;
      }

      /* --------------------------------------------------------------
         TODO לפני עלייה לאוויר: לחבר לשרת / CRM.
         כרגע מדובר בהדגמה בצד לקוח בלבד - הנתונים אינם נשלחים לשום מקום.
         דוגמה:
           fetch('/api/lead', { method: 'POST', body: new FormData(form) })
         -------------------------------------------------------------- */
      var btn = $('button[type="submit"]', form);
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'שולח…'; }

      window.setTimeout(function () {
        if (status) {
          status.className = 'form-status is-ok';
          status.textContent = 'תודה! הפנייה התקבלה. נחזור אליכם בתוך יום עסקים אחד.';
        }
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'שליחה'; }
        if (status) status.focus && status.focus();
      }, 700);
    });
  });

  /* ------------------------------------------------------------------
     6. תוסף נגישות
     ------------------------------------------------------------------ */
  var a11yBtn = $('.a11y-btn');
  var a11yPanel = $('.a11y-panel');
  var STORE = 'brandli-a11y';

  var state = {};
  try { state = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (err) { state = {}; }

  var CLASSES = {
    fontSize: ['', 'a11y-fs-1', 'a11y-fs-2'],
    contrast: 'a11y-contrast',
    links: 'a11y-links',
    readable: 'a11y-readable',
    nomotion: 'a11y-nomotion',
    bigcursor: 'a11y-bigcursor'
  };

  function applyState() {
    CLASSES.fontSize.forEach(function (c) { if (c) root.classList.remove(c); });
    var fs = state.fontSize || 0;
    if (CLASSES.fontSize[fs]) root.classList.add(CLASSES.fontSize[fs]);

    ['contrast', 'links', 'readable', 'nomotion', 'bigcursor'].forEach(function (key) {
      root.classList.toggle(CLASSES[key], !!state[key]);
      var btn = $('[data-a11y="' + key + '"]');
      if (btn) btn.setAttribute('aria-pressed', String(!!state[key]));
    });

    var fsBtn = $('[data-a11y="fontSize"]');
    if (fsBtn) {
      fsBtn.setAttribute('aria-pressed', String(fs > 0));
      var lbl = $('.a11y-fs-label', fsBtn);
      if (lbl) lbl.textContent = ['הגדלת טקסט', 'טקסט גדול (110%)', 'טקסט גדול מאוד (125%)'][fs];
    }

    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (err) { /* מצב פרטי */ }
  }

  if (a11yBtn && a11yPanel) {
    a11yBtn.addEventListener('click', function () {
      var open = a11yPanel.classList.toggle('is-open');
      a11yBtn.setAttribute('aria-expanded', String(open));
      if (open) { var f = $('.a11y-opt', a11yPanel); if (f) f.focus(); }
    });

    doc.addEventListener('click', function (e) {
      if (!a11yPanel.classList.contains('is-open')) return;
      if (a11yPanel.contains(e.target) || a11yBtn.contains(e.target)) return;
      a11yPanel.classList.remove('is-open');
      a11yBtn.setAttribute('aria-expanded', 'false');
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && a11yPanel.classList.contains('is-open')) {
        a11yPanel.classList.remove('is-open');
        a11yBtn.setAttribute('aria-expanded', 'false');
        a11yBtn.focus();
      }
    });

    $$('[data-a11y]', a11yPanel).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-a11y');
        if (key === 'fontSize') {
          state.fontSize = ((state.fontSize || 0) + 1) % 3;
        } else {
          state[key] = !state[key];
        }
        applyState();
      });
    });

    var resetBtn = $('.a11y-reset', a11yPanel);
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state = {};
        applyState();
      });
    }
  }

  applyState();

  /* ------------------------------------------------------------------
     7. שנה נוכחית בפוטר
     ------------------------------------------------------------------ */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ------------------------------------------------------------------
     8. עוגן חלק עם קיזוז לכותרת קבועה
     ------------------------------------------------------------------ */
  $$('a[href^="#"]:not([href="#"])').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var target = doc.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var offset = (header ? header.offsetHeight : 0) + 20;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + id);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
})();
