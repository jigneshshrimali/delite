/**
 * Navigation
 * ----------
 * - Adds `.is-scrolled` to the header past a threshold (rAF-throttled).
 * - Mobile menu: opens a slide-in panel, traps focus while open,
 *   restores focus to the trigger on close, closes on Escape/scrim/link click.
 */

(function initHeaderScroll() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const SCROLL_THRESHOLD = 24;
  let ticking = false;

  function updateHeaderState() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateHeaderState);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateHeaderState();
})();

(function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-mobile-nav]');
  const scrim = document.querySelector('[data-nav-scrim]');
  if (!toggle || !panel || !scrim) return;

  const focusableSelector =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function openMenu() {
    lastFocused = document.activeElement;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    panel.classList.add('is-open');
    scrim.classList.add('is-visible');
    document.body.classList.add('nav-open');

    const firstLink = panel.querySelector(focusableSelector);
    if (firstLink) firstLink.focus();

    document.addEventListener('keydown', onKeydown);
  }

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    panel.classList.remove('is-open');
    scrim.classList.remove('is-visible');
    document.body.classList.remove('nav-open');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }
    // Simple focus trap while the panel is open
    if (e.key === 'Tab') {
      const focusable = Array.from(panel.querySelectorAll(focusableSelector));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  scrim.addEventListener('click', closeMenu);

  panel.querySelectorAll('.mobile-nav__link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // If the viewport is resized past the desktop breakpoint while the
  // mobile panel is open, close it so state doesn't get stuck.
  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  desktopQuery.addEventListener('change', (e) => {
    if (e.matches && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
})();
