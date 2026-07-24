/**
 * Image Reveal
 * ------------
 * Deliberately NOT a third-party library — pulling one in adds a
 * network request + parse/execute cost on every page, directly
 * fighting the "best loading time" goal. This does the same job (a
 * soft fade+scale-in as each image finishes loading) in vanilla JS.
 *
 * Safety contract: images are visible by DEFAULT (see tokens.css).
 * This script only adds `.is-pending` to an image it has confirmed
 * is genuinely still loading, immediately before animating it in —
 * never as a blanket "hide everything, JS will reveal it" pattern.
 * If this script fails to run at all, every image is just... visible,
 * with no fade effect. Never invisible.
 *
 * Usage: any <img> with [data-reveal] gets this treatment.
 */

(function initImageReveal() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return; // leave every image at its visible default

  const images = document.querySelectorAll('img[data-reveal]');

  images.forEach((img) => {
    // Already loaded (cache hit) — nothing to animate, leave it alone
    // at its visible default rather than faking a fade for no reason.
    if (img.complete && img.naturalWidth > 0) return;

    // Confirmed still loading — NOW it's safe to add the pending
    // (hidden) state, since we know something will remove it shortly.
    img.classList.add('is-pending');

    function reveal() {
      requestAnimationFrame(() => img.classList.remove('is-pending'));
    }

    if (img.decode) {
      img.decode().then(reveal).catch(reveal);
    } else {
      img.addEventListener('load', reveal, { once: true });
      img.addEventListener('error', reveal, { once: true }); // never leave a broken image stuck at opacity:0
    }
  });
})();
