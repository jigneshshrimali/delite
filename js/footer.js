/**
 * Footer
 * ------
 * - Copyright year is set from the visitor's actual clock, not hardcoded
 *   (avoids the classic "© 2023" staleness bug).
 * - Newsletter signup: no real email service (Mailchimp, etc.) is
 *   connected yet. Rather than fake a silent "Subscribed!" success
 *   that goes nowhere, this tells the visitor honestly that signup
 *   isn't wired up yet. Replace with a real API call once a service
 *   is connected — the validation/UI below still applies either way.
 */

(function initFooterYear() {
  const yearEl = document.querySelector('[data-footer-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

(function initNewsletterForm() {
  const form = document.querySelector('[data-newsletter-form]');
  if (!form) return;

  const statusEl = document.querySelector('[data-newsletter-status]');
  const emailInput = form.querySelector('#newsletter-email');

  function setStatus(message, state) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = state || '';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput?.value.trim() || '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Honest — no newsletter service is connected yet.
    setStatus(
      "Thanks! Newsletter signup isn't fully connected yet — please email us directly in the meantime.",
      'success'
    );
    form.reset();
  });
})();
