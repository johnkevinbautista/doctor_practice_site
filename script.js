/* Meridian Health — Site Scripts */

/* ---------- Sticky Header ---------- */
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* ---------- Mobile Nav ---------- */
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    navToggle.querySelectorAll('span')[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
    navToggle.querySelectorAll('span')[1].style.opacity  = open ? '0' : '';
    navToggle.querySelectorAll('span')[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ---------- Active Nav Link ---------- */
(function setActiveNav() {
  const links = document.querySelectorAll('.nav-link[data-page]');
  const page  = document.body.dataset.page;
  links.forEach(l => {
    if (l.dataset.page === page) l.classList.add('active');
  });
})();

/* ---------- Intersection Observer — fade-up ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '';
      e.target.style.animation = '';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => {
  el.style.opacity = '0';
  io.observe(el);
});

/* ---------- Animated Stats Counter ---------- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  requestAnimationFrame(function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  });
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));

/* ---------- Contact Form ---------- */
const contactForm = document.getElementById('appointment-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      const success = document.getElementById('form-success');
      if (success) {
        contactForm.style.display = 'none';
        success.style.display = 'block';
      } else {
        btn.textContent = 'Request Sent!';
        btn.style.background = 'var(--teal)';
      }
    }, 1200);
  });
}

/* ---------- Smooth scroll for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
