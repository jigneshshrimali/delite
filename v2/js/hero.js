/**
 * Hero Slider — infinite physical carousel
 * ------------------------------------------
 * Per directive: every slider on the site loops continuously in one
 * direction, never stops, never resets with a visible jump. Previous
 * version crossfaded slides in place; this physically translates a
 * track left/right, with a cloned slide at each end so BOTH the
 * autoplay (always forward) and manual prev/back stay perfectly
 * seamless — the "jump" back to the real slide happens only once the
 * clone (pixel-identical to the real slide) is already fully in view,
 * so it's invisible to the eye.
 *
 * Callout drawing, count-up reveal, content-swap, autoplay engine,
 * and pause control are UNCHANGED from the previous version — only
 * the slide-positioning mechanism below them was rewritten.
 */

(function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const slider = hero.querySelector('.hero__slider');
  const track = hero.querySelector('[data-hero-track]');
  const realSlides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const prevBtn = hero.querySelector('[data-hero-prev]');
  const nextBtn = hero.querySelector('[data-hero-next]');
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const liveRegion = hero.querySelector('[data-hero-live]');
  const productNameEl = hero.querySelector('[data-hero-product-name] span');
  const playPauseBtn = hero.querySelector('[data-hero-playpause]');
  if (!slider || !track || realSlides.length === 0) return;

  const contentInner = hero.querySelector('[data-hero-content-inner]');
  const headlineEl = hero.querySelector('[data-hero-headline]');
  const kickerEl = hero.querySelector('[data-hero-kicker]');
  const subtextEl = hero.querySelector('[data-hero-subtext]');
  const ctaGroupEl = hero.querySelector('[data-hero-ctas]');

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function formatNumber(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function renderContentForSlide(slide) {
    if (!contentInner) return;
    if (headlineEl && slide.dataset.headline) {
      headlineEl.innerHTML = slide.dataset.headline
        .split('|')
        .map((line) => line.trim())
        .join('<br />');
    }
    if (kickerEl && slide.dataset.kicker !== undefined) {
      kickerEl.textContent = slide.dataset.kicker;
    }
    if (subtextEl && slide.dataset.subtext) {
      subtextEl.textContent = slide.dataset.subtext;
    }
    if (ctaGroupEl && slide.dataset.ctaPrimaryLabel) {
      const primary = ctaGroupEl.querySelector('[data-cta-primary]');
      const secondary = ctaGroupEl.querySelector('[data-cta-secondary]');
      if (primary) {
        primary.textContent = slide.dataset.ctaPrimaryLabel;
        primary.href = slide.dataset.ctaPrimaryHref || '#';
      }
      if (secondary) {
        const hasSecondary = Boolean(slide.dataset.ctaSecondaryLabel);
        secondary.hidden = !hasSecondary;
        if (hasSecondary) {
          secondary.textContent = slide.dataset.ctaSecondaryLabel;
          secondary.href = slide.dataset.ctaSecondaryHref || '#';
        }
      }
    }
  }

  function drawLinesForSlide(slide) {
    const svg = slide.querySelector('[data-hero-lines]');
    if (!svg || window.innerWidth < 768) return;

    const rect = slide.getBoundingClientRect();
    if (rect.width === 0) return;

    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.innerHTML = '';

    const callouts = Array.from(slide.querySelectorAll('[data-callout]'));
    callouts.forEach((callout) => {
      const targetX = (parseFloat(callout.dataset.targetX) / 100) * rect.width;
      const targetY = (parseFloat(callout.dataset.targetY) / 100) * rect.height;
      const cRect = callout.getBoundingClientRect();
      const anchorX = cRect.left < rect.left + rect.width / 2
        ? cRect.right - rect.left
        : cRect.left - rect.left;
      const anchorY = cRect.top + cRect.height / 2 - rect.top;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const midX = (anchorX + targetX) / 2;
      path.setAttribute('d', `M ${anchorX} ${anchorY} Q ${midX} ${anchorY} ${targetX} ${targetY}`);
      svg.appendChild(path);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', targetX);
      dot.setAttribute('cy', targetY);
      dot.setAttribute('r', 3);
      svg.appendChild(dot);
    });
  }

  function revealSlide(slide) {
    if (window.innerWidth < 768) return;

    const svg = slide.querySelector('[data-hero-lines]');
    const callouts = Array.from(slide.querySelectorAll('[data-callout]'));

    if (prefersReducedMotion || typeof gsap === 'undefined') {
      callouts.forEach((c) => {
        const valueEl = c.querySelector('[data-count-to]');
        if (valueEl) valueEl.textContent = formatNumber(parseFloat(valueEl.dataset.countTo));
      });
      return;
    }

    svg.classList.add('is-animating');
    callouts.forEach((c) => c.classList.add('is-animating'));

    const tl = gsap.timeline({
      onComplete: () => {
        svg.classList.remove('is-animating');
        callouts.forEach((c) => c.classList.remove('is-animating'));
      },
    });

    tl.to(svg.querySelectorAll('path'), {
      strokeDashoffset: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power2.inOut',
    })
      .to(svg.querySelectorAll('circle'), { opacity: 1, duration: 0.3, stagger: 0.12 }, '<')
      .to(callouts, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' }, '-=0.6');

    callouts.forEach((callout, i) => {
      const valueEl = callout.querySelector('[data-count-to]');
      if (!valueEl) return;
      const target = parseFloat(valueEl.dataset.countTo);
      const counter = { value: 0 };
      tl.to(
        counter,
        {
          value: target,
          duration: 1,
          ease: 'power2.out',
          onUpdate: () => { valueEl.textContent = formatNumber(counter.value); },
        },
        0.5 + i * 0.12
      );
    });
  }

  // --- Build the infinite track: [cloneOfLast, real0, real1, ..., realN-1, cloneOfFirst] ---
  const firstClone = realSlides[0].cloneNode(true);
  const lastClone = realSlides[realSlides.length - 1].cloneNode(true);
  [firstClone, lastClone].forEach((clone) => {
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('id');
  });
  track.insertBefore(lastClone, track.firstChild);
  track.appendChild(firstClone);

  const trackSlides = Array.from(track.children); // length = realSlides.length + 2
  let trackIndex = 1; // DOM position 1 = real slide 0 (position 0 is the prepended lastClone)
  let isAnimating = false;

  function realIndexOf(rawTrackIndex) {
    const n = realSlides.length;
    return ((rawTrackIndex - 1) % n + n) % n;
  }

  function positionTrack(animate) {
    const width = slider.getBoundingClientRect().width;
    if (!animate) track.classList.add('is-jumping');
    track.style.transform = `translateX(${-trackIndex * width}px)`;
    if (!animate) {
      void track.offsetHeight;
      requestAnimationFrame(() => track.classList.remove('is-jumping'));
    }
  }

  function syncUIToRealIndex(realIndex) {
    const slide = realSlides[realIndex];

    dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', i === realIndex ? 'true' : 'false');
    });

    if (liveRegion) {
      liveRegion.textContent = `Showing ${slide.dataset.productName || `Slide ${realIndex + 1}`}`;
    }
    if (productNameEl) {
      productNameEl.textContent = slide.dataset.productName || '';
    }

    drawLinesForSlide(slide);
    revealSlide(slide);

    if (contentInner && !prefersReducedMotion && typeof gsap !== 'undefined') {
      contentInner.classList.add('is-animating');
      gsap.fromTo(
        contentInner,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => renderContentForSlide(slide),
          onComplete: () => contentInner.classList.remove('is-animating'),
        }
      );
    } else {
      renderContentForSlide(slide);
    }
  }

  function goTo(step) {
    if (isAnimating) return;
    isAnimating = true;
    trackIndex += step;
    positionTrack(true);
    syncUIToRealIndex(realIndexOf(trackIndex));
  }

  function goToRealIndex(target) {
    if (isAnimating) return;
    isAnimating = true;
    trackIndex = target + 1;
    positionTrack(true);
    syncUIToRealIndex(target);
  }

  track.addEventListener('transitionend', (e) => {
    if (e.target !== track || e.propertyName !== 'transform') return;
    isAnimating = false;

    if (trackIndex === trackSlides.length - 1) {
      trackIndex = realSlides.length;
      positionTrack(false);
    } else if (trackIndex === 0) {
      trackIndex = 1;
      positionTrack(false);
    }
  });

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goToRealIndex(i)));

  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(-1);
    if (e.key === 'ArrowRight') goTo(1);
  });

  const AUTOPLAY_MS = 6000;
  let autoplayTimer = null;
  let userPaused = false;

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    if (prefersReducedMotion || realSlides.length < 2 || userPaused) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(1), AUTOPLAY_MS);
  }

  function setPausedUI(isPaused) {
    if (!playPauseBtn) return;
    playPauseBtn.setAttribute('aria-pressed', String(isPaused));
    playPauseBtn.setAttribute('aria-label', isPaused ? 'Play slideshow' : 'Pause slideshow');
  }

  if (playPauseBtn) {
    if (prefersReducedMotion || realSlides.length < 2) {
      playPauseBtn.hidden = true;
    } else {
      playPauseBtn.addEventListener('click', () => {
        userPaused = !userPaused;
        setPausedUI(userPaused);
        userPaused ? stopAutoplay() : startAutoplay();
      });
    }
  }

  [prevBtn, nextBtn, ...dots].forEach((el) => {
    if (!el) return;
    el.addEventListener('click', () => {
      if (!userPaused) startAutoplay();
    });
  });

  positionTrack(false);

  function initialRun() {
    drawLinesForSlide(realSlides[0]);
    revealSlide(realSlides[0]);
  }

  if (window.__deliteLoaded || !document.querySelector('[data-loader]')) {
    initialRun();
  } else {
    document.addEventListener('delite:loaded', initialRun, { once: true });
  }

  startAutoplay();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      positionTrack(false);
      drawLinesForSlide(realSlides[realIndexOf(trackIndex)]);
    });
  }

  // ResizeObserver instead of a window-resize listener: fires
  // immediately on observe() with the real current size, and again
  // on ANY actual layout change to the slider — font swap, image
  // decode, orientation change, mobile browser toolbar show/hide —
  // not just explicit window resize events. A plain resize listener
  // was missing some of these on mobile, leaving the track positioned
  // against a stale width measurement (the reported "not showing
  // properly" bug).
  let resizeTimer;
  const resizeObserver = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      positionTrack(false);
      drawLinesForSlide(realSlides[realIndexOf(trackIndex)]);
    }, 100);
  });
  resizeObserver.observe(slider);

  if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    let rafId = null;
    hero.addEventListener('mousemove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const activeSlide = realSlides[realIndexOf(trackIndex)];
        const product = activeSlide.querySelector('[data-hero-product]');
        if (product) {
          const rect = hero.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          product.style.transform = `perspective(1200px) rotateX(${relY * -6}deg) rotateY(${relX * 6}deg)`;
        }
        rafId = null;
      });
    });
    hero.addEventListener('mouseleave', () => {
      const activeSlide = realSlides[realIndexOf(trackIndex)];
      const product = activeSlide.querySelector('[data-hero-product]');
      if (product) product.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    });
  }
})();
