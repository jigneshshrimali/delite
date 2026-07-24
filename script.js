/* =============================================
   DELITE CERAMIC MACHINERY — script.js
   Animations: Parallax, Scroll Reveal, Counter
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ===== LOADER =====
    const loader = document.getElementById('loader');
    const progress = loader.querySelector('.loader-progress');

    let load = 0;
    const loadInterval = setInterval(() => {
        load += Math.random() * 20;
        if (load >= 100) {
            load = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                loader.classList.add('done');
                document.body.style.overflow = '';
            }, 300);
        }
        progress.style.width = load + '%';
    }, 120);

    document.body.style.overflow = 'hidden';

    // ===== CUSTOM CURSOR =====
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll('a, button, .prod-card, .ind-card, .why-card').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Hide cursor on mobile
    if ('ontouchstart' in window) {
        dot.style.display = 'none';
        ring.style.display = 'none';
    }

    // ===== HEADER SCROLL =====
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // ===== MOBILE MENU =====
    const mobileBtn = document.getElementById('mobileBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        mobileBtn.classList.toggle('open', isOpen);
        mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileBtn.classList.remove('open');
        });
    });

    // ===== PARALLAX =====
    const heroBg = document.getElementById('heroBg');

    function updateParallax() {
        const scrollY = window.scrollY;
        const heroH = document.querySelector('.hero').offsetHeight;
        if (scrollY < heroH * 1.2) {
            const pct = scrollY / heroH;
            heroBg.style.transform = `translateY(${pct * 15}%) scale(1.1)`;
        }
    }

    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    // ===== SCROLL REVEAL =====
    const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // ===== STAT COUNTERS =====
    const statNums = document.querySelectorAll('.stat-num[data-target]');

    function animateCount(el) {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const val = target * ease;

            if (target >= 1000) {
                el.textContent = Math.floor(val).toLocaleString() + suffix;
            } else if (Number.isInteger(target)) {
                el.textContent = Math.floor(val) + suffix;
            } else {
                el.textContent = val.toFixed(1) + suffix;
            }

            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target + suffix;
        }

        requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNums.forEach(el => counterObserver.observe(el));

    // ===== PRODUCT FILTER =====
    const filterBtns = document.querySelectorAll('.flt');
    const prodCards = document.querySelectorAll('.prod-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            prodCards.forEach((card, i) => {
                const cat = card.getAttribute('data-cat');
                const show = filter === 'all' || cat === filter;

                if (show) {
                    card.classList.remove('hidden');
                    card.style.animationDelay = (i * 0.06) + 's';
                    card.style.animation = 'none';
                    card.offsetHeight; // reflow
                    card.style.animation = '';
                    // Fade in
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'opacity .4s ease, transform .4s ease';
                        card.style.transitionDelay = (i * 0.05) + 's';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.classList.add('hidden');
                    card.style.transition = '';
                    card.style.transitionDelay = '';
                }
            });
        });
    });

    // ===== SCROLL NAV HIGHLIGHT =====
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => sectionObserver.observe(s));

    // ===== BACK TO TOP =====
    const backTop = document.getElementById('backTop');
    window.addEventListener('scroll', () => {
        backTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== SMOOTH SCROLL for nav links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 72; // header height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ===== PRODUCT CARD IMAGE HANDLING =====
    document.querySelectorAll('.prod-img img').forEach(img => {
        img.addEventListener('load', () => {
            img.nextElementSibling.style.display = 'none';
        });
        img.addEventListener('error', () => {
            img.style.display = 'none';
            const fallback = img.nextElementSibling;
            if (fallback) {
                fallback.classList.add('active');
                fallback.style.zIndex = '2';
            }
        });
    });

    // ===== PARALLAX ON SCROLL FOR HERO GEAR =====
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroVisual.style.transform = `translateY(calc(-50% + ${scrollY * 0.15}px))`;
            }
        }, { passive: true });
    }

    // ===== HORIZONTAL SCROLL TABLE HINT =====
    const tableWrap = document.querySelector('.table-wrap');
    if (tableWrap) {
        tableWrap.addEventListener('touchstart', () => {}, { passive: true });
    }

    // ===== HOVER TILT on product cards =====
    prodCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

});

// ===== FORM SUBMIT =====
function handleFormSubmit(e) {
    e.preventDefault();
    const success = document.getElementById('formSuccess');
    success.classList.add('show');
    e.target.reset();
    setTimeout(() => success.classList.remove('show'), 5000);
}
