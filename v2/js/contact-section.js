/**
 * Contact Section Form
 * --------------------
 * Same rationale as footer.js: no real backend exists yet, so this
 * builds a mailto: link from the fields rather than faking a success
 * message. See footer.js for the fuller explanation of this pattern.
 */

(function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const statusEl = form.querySelector('[data-form-status]');

  function setStatus(message, state) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = state || '';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const get = (id) => form.querySelector(`#${id}`)?.value.trim() || '';
    const name = get('contact-name');
    const company = get('contact-company');
    const email = get('contact-email');
    const phone = get('contact-phone');
    const product = get('contact-product');
    const country = get('contact-country');
    const message = get('contact-message');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !message) {
      setStatus('Please fill in your name, email, and message.', 'error');
      return;
    }
    if (!emailPattern.test(email)) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }

    const subject = encodeURIComponent(`Product Enquiry from ${name}`);
    const bodyLines = [
      `Name: ${name}`,
      `Company: ${company || 'Not provided'}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `Product Interested In: ${product || 'Not specified'}`,
      `Country: ${country || 'Not specified'}`,
      '',
      'Message:',
      message,
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    const mailto = `mailto:info@deliteceramicmachinery.com?subject=${subject}&body=${body}`;

    setStatus('Opening your email client to send this enquiry…', 'success');
    window.location.href = mailto;
  });
})();
