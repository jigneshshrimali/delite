/**
 * FAQ Accordion
 * -------------
 * Simple single-item-open accordion. Uses data-open attribute (not
 * inline style toggling) so the CSS grid-template-rows transition
 * handles the open/close animation smoothly.
 */

(function initFaqAccordion() {
  const items = document.querySelectorAll('[data-faq-item]');
  if (!items.length) return;

  items.forEach((item) => {
    const button = item.querySelector('[data-faq-question]');
    if (!button) return;

    button.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';

      // Close any other open item — single-open accordion
      items.forEach((other) => {
        other.setAttribute('data-open', 'false');
        other.querySelector('[data-faq-question]')?.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.setAttribute('data-open', 'true');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
