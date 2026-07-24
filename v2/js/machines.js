/**
 * Machines Carousel — infinite auto-scroll
 * -----------------------------------------
 * - Continuously auto-scrolls via requestAnimationFrame incrementing
 *   scrollLeft (not a CSS transform marquee) so manual arrows/touch
 *   drag share the exact same mechanism instead of fighting it.
 * - BUG FIX: this used to also have scroll-snap-type:x mandatory on
 *   the track (css/machines.css), which fights continuous programmatic
 *   scrollLeft changes — browsers repeatedly snap back toward the
 *   nearest card boundary, which is almost certainly why the motion
 *   looked stuck/jittery rather than continuously moving. Removed.
 * - Seamless loop: the real card set is cloned once via JS (not
 *   duplicated in the HTML source — keeps the crawlable markup single
 *   and clean) and appended, marked aria-hidden + tabindex="-1" so
 *   screen readers/keyboard users never land on the duplicate. When
 *   scroll position passes the first set, it silently jumps back by
 *   exactly that width — invisible to the eye since the clone is
 *   pixel-identical.
 * - Pauses on hover/focus (desktop) and touch-drag (mobile — without
 *   this, a swipe gesture and the auto-scroll would both be writing
 *   to scrollLeft simultaneously). Fully disabled under
 *   prefers-reduced-motion — manual arrows still work in that case.
 */

(function initMachines() {
  const section = document.querySelector('[data-machines]');
  if (!section) return;

  const track = section.querySelector('[data-machines-track]');
  const prevBtn = section.querySelector('[data-machines-prev]');
  const nextBtn = section.querySelector('[data-machines-next]');
  if (!track) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function cardStep() {
    const card = track.querySelector('.machine-card');
    if (!card) return 280;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || '16');
    return card.getBoundingClientRect().width + gap;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });
  }

  // Reduced motion: manual browsing only, no clone, no auto-scroll.
  if (prefersReducedMotion) return;

  // --- Clone the real card set once for a seamless loop ---
  const realCards = Array.from(track.querySelectorAll('.machine-card'));
  const loopWidth = track.scrollWidth; // width of the one real set, measured before cloning

  realCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    track.appendChild(clone);
  });

  // --- Continuous auto-scroll ---
  const SPEED_PX_PER_SEC = 50;
  let rafId = null;
  let lastTime = null;
  let paused = false;

  function step(timestamp) {
    if (lastTime === null) lastTime = timestamp;
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!paused) {
      track.scrollLeft += SPEED_PX_PER_SEC * delta;
      if (track.scrollLeft >= loopWidth) {
        track.scrollLeft -= loopWidth;
      }
    }
    rafId = requestAnimationFrame(step);
  }

  rafId = requestAnimationFrame(step);

  section.addEventListener('mouseenter', () => { paused = true; });
  section.addEventListener('mouseleave', () => { paused = false; });
  section.addEventListener('focusin', () => { paused = true; });
  section.addEventListener('focusout', (e) => {
    if (!section.contains(e.relatedTarget)) paused = false;
  });

  // Touch: pause for the duration of an active drag/swipe, so the
  // user's gesture and the auto-scroll aren't both writing to
  // scrollLeft at the same time (which would look janky/fought-over).
  // Resumes shortly after the finger lifts, not instantly, so a quick
  // flick doesn't immediately get overridden by the auto-scroll.
  let touchResumeTimer = null;
  track.addEventListener('touchstart', () => {
    paused = true;
    clearTimeout(touchResumeTimer);
  }, { passive: true });
  track.addEventListener('touchend', () => {
    clearTimeout(touchResumeTimer);
    touchResumeTimer = setTimeout(() => { paused = false; }, 1200);
  }, { passive: true });

  // Pause the rAF loop entirely (not just the increment) when the
  // section is off-screen, so it isn't burning cycles on a tab the
  // user has scrolled away from.
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (entry.isIntersecting && !rafId) {
        lastTime = null;
        rafId = requestAnimationFrame(step);
      }
    });
  }, { threshold: 0 });
  visibilityObserver.observe(section);
})();
