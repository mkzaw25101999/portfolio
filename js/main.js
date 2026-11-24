(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (remembers choice) ---------- */
  const themeBtn = document.getElementById('themeBtn');
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  const syncIcon = () => { themeBtn.textContent = root.getAttribute('data-theme') === 'light' ? '☾' : '☀'; };
  syncIcon();
  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncIcon();
  });

  /* ---------- Mobile menu ---------- */
  const nav = document.querySelector('nav');
  const menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.textContent = open ? '✕' : '☰';
    menuBtn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.textContent = '☰';
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Hero: highlight marks + typing effect ---------- */
  window.addEventListener('load', () => document.querySelector('.hero').classList.add('loaded'));

  const typedEl = document.getElementById('typed');
  const roles = ['Full-Stack Developer', 'React & Node.js Engineer', 'QA Tester', 'AI Integration Builder'];
  if (reduceMotion) {
    typedEl.textContent = roles[0];
  } else {
    let r = 0, i = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      typedEl.textContent = word.slice(0, i);
      if (!deleting && i < word.length) { i++; setTimeout(tick, 70); }
      else if (!deleting) { deleting = true; setTimeout(tick, 1800); }
      else if (i > 0) { i--; setTimeout(tick, 35); }
      else { deleting = false; r = (r + 1) % roles.length; setTimeout(tick, 350); }
    };
    setTimeout(tick, 700);
  }

  /* ---------- Scroll: progress bar, nav shadow, back-to-top, timeline fill ---------- */
  const progress = document.querySelector('.progress');
  const toTop = document.querySelector('.to-top');
  const timeline = document.querySelector('.timeline');
  const fill = document.querySelector('.timeline-fill');

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 600);

    if (timeline && fill) {
      const rect = timeline.getBoundingClientRect();
      const seen = Math.min(Math.max(window.innerHeight * 0.7 - rect.top, 0), rect.height - 12);
      fill.style.height = `${seen}px`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ---------- Reveal on scroll (+ stagger children, counters, bars) ---------- */
  const animateCount = el => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const start = performance.now();
    const step = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  document.querySelectorAll('.stagger').forEach(group => {
    [...group.children].forEach((child, idx) => { child.style.transitionDelay = `${idx * 90}ms`; });
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('visible');
      el.querySelectorAll('[data-count]').forEach(animateCount);
      el.querySelectorAll('.bar > div').forEach(b => { b.style.width = b.dataset.width; });
      revealObserver.unobserve(el);
      // Once the entrance is done, drop the reveal classes so hover transitions use their own timing
      if (!el.querySelector('.section-title')) {
        setTimeout(() => {
          [...el.children].forEach(c => { c.style.transitionDelay = ''; });
          el.classList.remove('reveal', 'stagger', 'visible');
        }, 1400);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .stagger').forEach(el => revealObserver.observe(el));

  /* ---------- Card spotlight + subtle 3D tilt ---------- */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        const rx = ((y / r.height) - 0.5) * -6;
        const ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Copy email ---------- */
  const toast = document.querySelector('.toast');
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  document.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', async e => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      showToast('Email copied to clipboard ✓');
    } catch {
      showToast(btn.dataset.copy);
    }
  }));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
