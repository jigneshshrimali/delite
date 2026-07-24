/**
 * Loading Sequence
 * -----------------
 * Calibration-gauge brand reveal.
 *
 * Behaviour:
 *  - Runs once per browser session (sessionStorage flag) so returning
 *    visitors navigating between pages aren't re-annoyed by it.
 *  - Fully skipped under prefers-reduced-motion: content appears instantly.
 *  - Timeline: ticks stagger in -> ring arc draws 0-100% with synced
 *    counter -> logo crossfades over the gauge -> brief hold -> scanline
 *    sweep + clip-path wipe reveals the page.
 */

(function initLoader() {
  const loader = document.querySelector('[data-loader]');
  if (!loader) return;

  const SESSION_KEY = 'delite:loaderShown';
  const alreadyShown = sessionStorage.getItem(SESSION_KEY) === 'true';
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function skipInstantly() {
    document.body.classList.remove('is-loading');
    loader.classList.add('is-done');
    loader.setAttribute('aria-hidden', 'true');
    sessionStorage.setItem(SESSION_KEY, 'true');
    window.__deliteLoaded = true;
    document.dispatchEvent(new CustomEvent('delite:loaded'));
  }

  // --- Skip path: reduced motion or already seen this session ---
  // Checked first so repeat visits (the common case) never pay for
  // tick generation, GSAP work, or the animation at all.
  if (prefersReducedMotion || alreadyShown) {
    skipInstantly();
    return;
  }

  // --- Fail-safe: if the GSAP CDN didn't load (network/ad-blocker),
  // never leave the page permanently hidden behind a stuck loader.
  if (typeof gsap === 'undefined') {
    skipInstantly();
    return;
  }

  document.body.classList.add('is-loading');

  const ringFill = loader.querySelector('.loader__ring-fill');
  const percentEl = loader.querySelector('.loader__percent');
  const logoEl = loader.querySelector('.loader__logo');
  const statusEl = loader.querySelector('.loader__status');
  const tickGroup = loader.querySelector('.loader__ticks');

  const RADIUS = 90;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  ringFill.style.strokeDasharray = `${CIRCUMFERENCE}`;
  ringFill.style.strokeDashoffset = `${CIRCUMFERENCE}`;

  // Build tick marks around the gauge (generated, not hand-authored markup)
  const TICK_COUNT = 40;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < TICK_COUNT; i++) {
    const angle = (360 / TICK_COUNT) * i;
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', '100');
    tick.setAttribute('y1', '6');
    tick.setAttribute('x2', '100');
    tick.setAttribute('y2', i % 5 === 0 ? '16' : '12');
    tick.setAttribute('class', 'loader__tick');
    tick.setAttribute('transform', `rotate(${angle} 100 100)`);
    fragment.appendChild(tick);
  }
  tickGroup.appendChild(fragment);

  function removeLoader() {
    loader.classList.add('is-hidden');
    loader.addEventListener(
      'transitionend',
      () => {
        loader.classList.add('is-done');
        loader.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('is-loading');
        window.__deliteLoaded = true;
        document.dispatchEvent(new CustomEvent('delite:loaded'));
      },
      { once: true }
    );
  }

  const ticks = loader.querySelectorAll('.loader__tick');
  const counter = { value: 0 };

  const srStatus = loader.querySelector('[data-loader-status]');

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      sessionStorage.setItem(SESSION_KEY, 'true');
      if (srStatus) srStatus.textContent = 'Delite loaded.';
      removeLoader();
    },
  });

  tl.to(ticks, {
    opacity: 1,
    duration: 0.4,
    stagger: { each: 0.008, from: 'start' },
  })
    .to(
      ringFill,
      {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power3.inOut',
      },
      '<'
    )
    .to(
      counter,
      {
        value: 100,
        duration: 1.4,
        ease: 'power3.inOut',
        onUpdate: () => {
          percentEl.textContent = Math.round(counter.value);
        },
      },
      '<'
    )
    .to(statusEl, { opacity: 0, duration: 0.2 }, '-=0.3')
    .to(percentEl, { opacity: 0, duration: 0.2 }, '<')
    .to(logoEl, { opacity: 1, duration: 0.4 }, '-=0.1')
    .to({}, { duration: 0.5 }) // hold beat on the revealed logo
    .add(() => loader.classList.add('is-sweeping')) // triggers scanline via CSS
    .to({}, { duration: 0.3 }); // let the sweep read before the wipe-out begins
})();
