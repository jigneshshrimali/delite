/**
 * Testimonials — scroll reveal
 * -----------------------------
 * Cards visible by default (see testimonials.css); JS adds
 * .is-animating only immediately before a scroll-triggered tween.
 */

(function initTestimonials() {
  const section = document.querySelector('[data-testimonials]');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('[data-testimonial-card]'));
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || typeof gsap === 'undefined') return;

  function animateIn() {
    cards.forEach((c) => c.classList.add('is-animating'));
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power2.out',
      onComplete: () => cards.forEach((c) => c.classList.remove('is-animating')),
    });
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateIn();
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(section);
})();
