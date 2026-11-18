'use strict';

/* ---------- Settings: edit these ---------- */
const CONTACT_EMAIL = 'your-email@example.com';   // used if no form endpoint is set
const FORM_ENDPOINT = '';                          // e.g. a Formspree URL; leave '' to use email instead

/* ---------- Highlight the nav link for the section in view ---------- */
(() => {
  const links = document.querySelectorAll('.navbar a');
  const sections = [...links]
    .filter(a => a.getAttribute('href').startsWith('#'))
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => {
        const on = a.getAttribute('href') === '#' + entry.target.id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ---------- Contact form ---------- */
(() => {
  const form = document.querySelector('.contact form');
  if (!form) return;

  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  form.appendChild(status);

  const show = (msg, ok) => {
    status.textContent = msg;
    status.classList.toggle('error', !ok);
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    if (!name || !email || !message) {
      show('Please fill in your name, email, and message.', false);
      return;
    }

    const btn = form.querySelector('button[type="submit"]');

    if (FORM_ENDPOINT) {
      btn.disabled = true;
      show('Sending…', true);
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        show('Thanks! Your message was sent.', true);
      } catch (err) {
        show('Something went wrong. Please try again or email me directly.', false);
      } finally {
        btn.disabled = false;
      }
    } else {
      const subject = encodeURIComponent('Portfolio message from ' + name);
      const body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
      show('Opening your email app…', true);
    }
  });
})();
