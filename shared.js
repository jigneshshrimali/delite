/* ============================================================
   DELITE CERAMIC MACHINERY — shared.js
   Loader, Nav, Cursor, Reveal, Counter, Back-to-top, Footer
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── LOADER ── */
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('ldrFill');
  if (loader && fill) {
    document.body.style.overflow = 'hidden';
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 22 + 8;
      if (p >= 100) { p = 100; clearInterval(iv); }
      fill.style.width = p + '%';
      if (p === 100) setTimeout(() => {
        loader.classList.add('gone');
        document.body.style.overflow = '';
      }, 280);
    }, 120);
  }

  /* ── CUSTOM CURSOR ── */
  const dot  = document.querySelector('.cur-dot');
  const ring = document.querySelector('.cur-ring');
  if (dot && ring) {
    let mx=0, my=0, rx=0, ry=0;
    document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; dot.style.cssText=`left:${mx}px;top:${my}px`; });
    const animRing = () => { rx+=(mx-rx)*.1; ry+=(my-ry)*.1; ring.style.cssText=`left:${rx}px;top:${ry}px`; requestAnimationFrame(animRing); };
    animRing();
    document.querySelectorAll('a,button,.card,.prod-card,.ind-cell,.why-card,.team-card').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
    });
  }

  /* ── NAV SCROLL / ACTIVE ── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();

    // Mark active page
    const page = document.body.dataset.page || '';
    document.querySelectorAll('.nav-link[data-page]').forEach(l => {
      if (l.dataset.page === page) l.classList.add('here');
    });
  }

  /* ── MOBILE MENU ── */
  const ham     = document.getElementById('ham');
  const mobMenu = document.getElementById('mobMenu');
  if (ham && mobMenu) {
    ham.addEventListener('click', () => {
      const open = mobMenu.classList.toggle('open');
      ham.classList.toggle('open', open);
    });
    mobMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobMenu.classList.remove('open'); ham.classList.remove('open');
    }));
  }

  /* ── SCROLL REVEAL ── */
  const rvEls = document.querySelectorAll('.rv');
  if (rvEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold:0.1, rootMargin:'0px 0px -40px 0px' });
    rvEls.forEach(el => obs.observe(el));
  }

  /* ── STAT COUNTERS ── */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const dur = 1600, start = performance.now();
      const tick = now => {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1-t, 3);
        const val = target * ease;
        el.textContent = (Number.isInteger(target) ? Math.floor(val) : val.toFixed(0)) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
    }, { threshold:0.5 });
    obs.observe(el);
  });

  /* ── PARALLAX HERO BG ── */
  const heroBg = document.querySelector('.hero-bg-img');
  if (heroBg) {
    const heroEl = document.querySelector('.hero');
    const onPar = () => {
      if (window.scrollY < (heroEl?.offsetHeight || 0) * 1.2)
        heroBg.style.transform = `translateY(${window.scrollY * 0.12}px)`;
    };
    window.addEventListener('scroll', onPar, { passive:true });
  }

  /* ── BACK TO TOP ── */
  const btt = document.getElementById('btt');
  if (btt) {
    window.addEventListener('scroll', () => btt.classList.toggle('vis', window.scrollY > 500), { passive:true });
    btt.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
  }

  /* ── SMOOTH ANCHOR SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  });

  /* ── FOOTER FORM ── */
  document.querySelectorAll('.js-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = form.querySelector('.form-ok');
      if (ok) { ok.classList.add('show'); form.reset(); setTimeout(() => ok.classList.remove('show'), 5000); }
    });
  });

  /* ── PRODUCT FILTER (shop page) ── */
  const ftabs = document.querySelectorAll('.ftab');
  const pcards = document.querySelectorAll('.pcard');
  if (ftabs.length) {
    ftabs.forEach(btn => {
      btn.addEventListener('click', () => {
        ftabs.forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const f = btn.dataset.f;
        let idx = 0;
        pcards.forEach(c => {
          const show = f === 'all' || c.dataset.cat === f;
          c.classList.toggle('hidden', !show);
          if (show) {
            c.style.transitionDelay = (idx * 0.055) + 's';
            c.style.opacity = '0'; c.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => requestAnimationFrame(() => {
              c.style.opacity = '1'; c.style.transform = 'translateY(0)';
            }));
            idx++;
          }
        });
      });
    });
  }

  /* ── CARD SUBTLE TILT ── */
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-6px) rotateX(${-y*4}deg) rotateY(${x*5}deg)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  /* ── FAQ ACCORDION (services) ── */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── BLOG SEARCH ── */
  const blogSearch = document.getElementById('blogSearch');
  if (blogSearch) {
    blogSearch.addEventListener('input', () => {
      const q = blogSearch.value.toLowerCase();
      document.querySelectorAll('.blog-card').forEach(c => {
        c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  /* ── CONTACT MAP placeholder click ── */
  const mapPh = document.getElementById('mapPh');
  if (mapPh) mapPh.addEventListener('click', () => {
    window.open('https://maps.google.com/?q=Plot+27/4+GIDC+Naroda+Phase+3+Ahmedabad+382330','_blank');
  });

});

/* ── GLOBAL FORM SUBMIT ── */
function submitForm(e) {
  e.preventDefault();
  const ok = e.target.querySelector('.form-ok');
  if (ok) { ok.classList.add('show'); e.target.reset(); setTimeout(() => ok.classList.remove('show'), 5000); }
}