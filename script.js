/* TAKWEEN — launch site interactions (lightweight, no dependencies) */
/* ------------------------------------------------------------------
   TAKWEEN_CONFIG — replace these placeholder values before launch.
   (Also update the same numbers/links in the footer & contact page.)
   ------------------------------------------------------------------ */
  window.TAKWEEN_CONFIG = {
    whatsappNumber: '',                       // placeholder — set before launch
    whatsappMessage: 'مرحبًا، أود الانضمام إلى قائمة انتظار تكوين.'
  };

(function () {
  'use strict';

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Simplify motion on low-performance devices
  var lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
                 (navigator.deviceMemory && navigator.deviceMemory <= 2);

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuBtn && mobilePanel) {
    menuBtn.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobilePanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobilePanel.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Toggle-style visual controls
  document.querySelectorAll('[data-switch]').forEach(function (el) {
    el.setAttribute('role', 'switch');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-checked', el.classList.contains('on') ? 'true' : 'false');
    function toggle() {
      var on = el.classList.toggle('on');
      el.setAttribute('aria-checked', on ? 'true' : 'false');
    }
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
    });
  });

  // "Coming soon" header icons (search / account / favorites / bag)
  // Visually present for future e-commerce; intentionally inactive at launch.
  var toast = null;
  var toastTimer = null;
  function showSoon(label) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'soon-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = label + ' — تتوفر هذه الميزة قريبًا مع الإطلاق';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }
  document.querySelectorAll('[data-soon]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // placeholder links (footer policy pages, social) must not navigate
      if (btn.tagName === 'A') e.preventDefault();
      showSoon(btn.getAttribute('data-soon'));
    });
  });

  // Floating WhatsApp button (config-driven; present on every page)
  (function whatsapp() {
    var cfg = window.TAKWEEN_CONFIG || {};
    // Launch: no public number yet — do not render a WhatsApp link to a placeholder number.
    if (!cfg.whatsappNumber) return;
    var href = 'https://wa.me/' + cfg.whatsappNumber +
               '?text=' + encodeURIComponent(cfg.whatsappMessage || '');
    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', 'تواصلي عبر واتساب');
    a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.6-4A8 8 0 1 1 20 11.5Z"/><path d="M9.3 9.2c.2 3 2.5 5.3 5.5 5.5"/></svg><span class="wa-text">تواصلي عبر واتساب</span>';
    document.body.appendChild(a);
  })();

  // Share buttons (native share sheet, with clipboard fallback)
  document.querySelectorAll('[data-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var data = { title: document.title, url: location.href };
      if (navigator.share) { navigator.share(data).catch(function () {}); }
      else if (navigator.clipboard) {
        navigator.clipboard.writeText(location.href);
        showSoon('تم نسخ الرابط');
      } else { showSoon('انسخي رابط الصفحة للمشاركة'); }
    });
  });

  // Blog: lightweight client-side category filter + search
  (function blogFilter() {
    var grid = document.getElementById('blogGrid');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.post-card'));
    var chips = document.querySelectorAll('.chip[data-filter]');
    var searchEl = document.getElementById('blogSearch');
    var current = '*';
    function apply() {
      var q = (searchEl && searchEl.value || '').trim();
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-cat') || '';
        var txt = card.textContent || '';
        var okCat = current === '*' || cat === current;
        var okQ = !q || txt.indexOf(q) !== -1;
        card.style.display = (okCat && okQ) ? '' : 'none';
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        current = chip.getAttribute('data-filter');
        apply();
      });
    });
    if (searchEl) searchEl.addEventListener('input', apply);
  })();

  // Day / night mode (persisted; swaps the approved logo for its ivory variant)
  var rootEl = document.documentElement;
  function applyTheme(t) {
    rootEl.setAttribute('data-theme', t);
    document.querySelectorAll('.brand img, .footer-brand img').forEach(function (img) {
      img.src = t === 'dark' ? 'assets/takween-logo-ivory.png' : 'assets/takween-logo.png';
    });
  }
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('takween-theme'); } catch (e) {}
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  document.querySelectorAll('.theme-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('takween-theme', next); } catch (e) {}
    });
  });

  // Front-end demo forms (no backend / no checkout)
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      if (!button) return;
      var old = button.textContent;
      button.textContent = 'تم استلام طلبك — سنتواصل معك';
      button.disabled = true;
      setTimeout(function () {
        button.textContent = old;
        button.disabled = false;
        form.reset();
      }, 2600);
    });
  });

  // Gentle reveal on scroll (with stagger indices for card groups)
  document.querySelectorAll('[data-reveal]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--stagger', Math.min(i, 8));
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }

  // Header transition on scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var scrolled = false;
    window.addEventListener('scroll', function () {
      var s = window.scrollY > 24;
      if (s !== scrolled) { scrolled = s; header.classList.toggle('scrolled', s); }
    }, { passive: true });
  }

  // Floating brand shapes + light parallax (decorative only; skipped for
  // reduced-motion users and low-performance devices)
  if (!reducedMotion && !lowPower) {
    var host = document.querySelector('.hero') || document.querySelector('.page-hero');
    if (host) {
      var ring = '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="44" stroke="#B08D72" stroke-width="1.4" stroke-dasharray="214 62" stroke-linecap="round" opacity=".55"/></svg>';
      var arc = '<svg viewBox="0 0 100 100" fill="none"><path d="M12 72c14-30 62-42 76-22" stroke="#A69284" stroke-width="1.2" stroke-linecap="round" opacity=".5"/></svg>';
      var seal = '<svg viewBox="0 0 100 100" fill="none"><path d="M50 14 86 50 50 86 14 50 50 14Z" stroke="#DCD0C4" stroke-width="1.2" opacity=".65"/><circle cx="50" cy="50" r="5" stroke="#A69284" stroke-width="1.2" opacity=".5"/></svg>';
      var layer = document.createElement('div');
      layer.className = 'float-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML =
        '<div class="float-shape float-a" data-parallax="0.05" style="width:150px;top:12%;left:6%">' + ring + '</div>' +
        '<div class="float-shape float-b" data-parallax="-0.035" style="width:110px;bottom:14%;left:32%">' + arc + '</div>' +
        '<div class="float-shape float-c" data-parallax="0.03" style="width:90px;top:18%;right:8%">' + seal + '</div>';
      host.style.position = 'relative';
      host.insertBefore(layer, host.firstChild);

      var items = layer.querySelectorAll('[data-parallax]');
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          items.forEach(function (el) {
            el.style.marginTop = (y * parseFloat(el.getAttribute('data-parallax'))) + 'px';
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  // Site-wide ambient background layer — TAKWEEN shapes drifting very slowly
  // behind every section (decorative only; content sits above via z-index).
  (function ambientLayer() {
    if (document.querySelector('.page-bg')) return;
    var ringOpen = '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="1" stroke-dasharray="206 70" stroke-linecap="round"/></svg>';
    var ringSmall = '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="1.3" stroke-dasharray="152 124" stroke-linecap="round"/></svg>';
    var curve = '<svg viewBox="0 0 100 100" fill="none"><path d="M6 68C28 30 66 84 96 40" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>';
    var blob = '<svg viewBox="0 0 100 100" fill="none"><rect x="10" y="10" width="80" height="80" rx="34" stroke="currentColor" stroke-width="1.1"/></svg>';
    var seal = '<svg viewBox="0 0 100 100" fill="none"><path d="M50 14 86 50 50 86 14 50 50 14Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="50" cy="50" r="6" stroke="currentColor" stroke-width="1.2"/></svg>';
    var dotted = '<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="1.6" stroke-dasharray="0.5 11" stroke-linecap="round"/></svg>';
    function shape(cls, drift, pos, color, o, svg) {
      return '<div class="bg-shape ' + cls + '" data-drift="' + drift + '" style="' + pos + ';color:' + color + ';--o:' + o + '"><span class="bg-inner">' + svg + '</span></div>';
    }
    var layer = document.createElement('div');
    layer.className = 'page-bg';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
      shape('bg-a', '0.04',  'width:min(46vw,540px);top:-9%;left:-9%',      'var(--bronze)', '.08', ringOpen) +
      shape('bg-b', '-0.03', 'width:min(34vw,430px);top:32%;right:-9%',     'var(--clay)',   '.09', curve) +
      shape('bg-c', '0.05',  'width:min(30vw,360px);bottom:-10%;left:12%',  'var(--clay)',   '.06', blob) +
      shape('bg-d', '-0.02', 'width:118px;top:13%;right:24%',               'var(--clay)',   '.07', seal) +
      shape('bg-e', '0.03',  'width:min(24vw,290px);bottom:14%;right:34%',  'var(--bronze)', '.08', dotted) +
      shape('bg-f', '-0.04', 'width:96px;top:56%;left:7%',                  'var(--clay)',   '.06', ringSmall);
    if (reducedMotion || lowPower) layer.classList.add('bg-static');
    document.body.insertBefore(layer, document.body.firstChild);
    if (!reducedMotion && !lowPower) {
      var shapes = layer.querySelectorAll('[data-drift]');
      var waiting = false;
      window.addEventListener('scroll', function () {
        if (waiting) return;
        waiting = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          shapes.forEach(function (el) {
            el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-drift'))).toFixed(1) + 'px,0)';
          });
          waiting = false;
        });
      }, { passive: true });
    }
  })();
})();
