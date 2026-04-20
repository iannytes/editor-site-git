// Multi-card excerpt modal logic
document.addEventListener('DOMContentLoaded', function() {
  var excerptModal = document.getElementById('excerptModal');
  var excerptModalContent = document.getElementById('excerptModalContent');
  var excerptModalTitle = document.getElementById('excerptModalTitle');
  var excerptModalText = document.getElementById('excerptModalText');
  var closeExcerptModal = document.getElementById('closeExcerptModal');
  var readMoreBtns = document.querySelectorAll('.readMoreBtn');
  readMoreBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var card = btn.closest('.flashcard-excerpt');
      if (card && excerptModal && excerptModalTitle && excerptModalText) {
        excerptModalTitle.textContent = card.getAttribute('data-title') || '';
        excerptModalText.innerHTML = card.getAttribute('data-fulltext') || '';
        excerptModal.style.display = 'flex';
      }
    });
  });
  if (closeExcerptModal && excerptModal) {
    closeExcerptModal.addEventListener('click', function() {
      excerptModal.style.display = 'none';
    });
    excerptModal.addEventListener('click', function(e) {
      if (e.target === excerptModal) {
        excerptModal.style.display = 'none';
      }
    });
  }
});
// Excerpt expand/collapse logic
document.addEventListener('DOMContentLoaded', function() {
  var expandBtn = document.getElementById('excerpt-expand');
  var card = document.getElementById('excerpt-card');
  var preview = document.getElementById('excerpt-preview');
  var full = document.getElementById('excerpt-full');
  var fade = document.getElementById('excerpt-fade');
  if (expandBtn && card && preview && full) {
    expandBtn.addEventListener('click', function() {
      if (full.style.display === 'none') {
        full.style.display = 'block';
        preview.style.display = 'none';
        card.style.maxHeight = '2000px';
        fade.style.display = 'none';
        expandBtn.textContent = 'Show Less';
      } else {
        full.style.display = 'none';
        preview.style.display = 'block';
        card.style.maxHeight = '340px';
        fade.style.display = '';
        expandBtn.textContent = 'Read More';
      }
    });
  }
});
/* ============================================
   EDITOR WEBSITE — MAIN JAVASCRIPT
   ============================================ */

/* ── Inject shared navigation ── */
function buildNav(activePage) {
  const pages = [
    { href: 'index.html',    label: 'Home'             },
    { href: 'services.html', label: 'Services'         },
    { href: 'examples.html', label: 'Examples'         },
    { href: 'projects.html', label: 'Current Projects' },
    { href: 'archive.html',  label: "Stitcher's Archive" },
  ];

  const links = pages
    .map(p => `<a href="${p.href}" class="${activePage === p.href ? 'active' : ''}">${p.label}</a>`)
    .join('');

  const mobileLinks = pages
    .map(p => `<a href="${p.href}">${p.label}</a>`)
    .join('');

  const navHTML = `
    <nav class="nav" role="navigation" aria-label="Main navigation">
      <div class="nav__inner">
        <a href="index.html" class="nav__logo">
          Ian Nytes
        </a>

        <div class="nav__links">
          ${links}
          <a href="contact.html" class="btn btn--primary btn--sm">Request a Consult</a>
        </div>

        <button class="nav__hamburger" aria-label="Toggle menu" aria-expanded="false" onclick="toggleMenu(this)">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- Mobile menu -->
    <div class="nav__mobile" id="mobileMenu">
      ${mobileLinks}
      <a href="contact.html" class="btn btn--primary" style="margin-top:0.5rem; text-align:center;">
        Request an Edit
      </a>
    </div>
  `;

  document.getElementById('nav-placeholder').innerHTML = navHTML;
}

function toggleMenu(btn) {
  const menu = document.getElementById('mobileMenu');
  const open = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
}

/* ── Inject shared footer ── */
function buildFooter() {
  document.getElementById('footer-placeholder').innerHTML = `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <div class="footer__inner">
          <div class="footer__brand">
            <h3>Developmental Editing<br>& Content Strategy</h3>
            <p>Helping writers craft compelling stories and businesses build stronger web presence. 
               Honest feedback. Practical solutions. Real results.</p>
            <a href="mailto:ian.nytes@gmail.com" class="footer__contact-link">
              ✉ ian.nytes@gmail.com
            </a>
          </div>
          <div class="footer__col">
            <h5>Pages</h5>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="examples.html">Examples</a></li>
              <li><a href="projects.html">Current Projects</a></li>
              <li><a href="archive.html">Stitcher's Archive</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h5>Services</h5>
            <ul>
              <li><a href="services.html#developmental">Developmental Editing</a></li>
              <li><a href="services.html#critique">Story Critique</a></li>
              <li><a href="services.html#newsletter">Newsletter Service</a></li>
              <li><a href="services.html#copy">Website Copy</a></li>
              <li><a href="services.html#consultation">Story Consultation</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} — Developmental Editor & Content Consultant</span>
          <span>Built with care for storytellers and businesses.</span>
        </div>
      </div>
    </footer>
  `;
}

/* ── Fade-up scroll animations ── */
function initAnimations() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

/* ── Contact form logic ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const serviceSelect  = document.getElementById('serviceType');

  // Service select change listener (can be expanded if needed for future conditional fields)

  /* Validation helpers */
  function showError(inputId, msg) {
    const el = document.getElementById(inputId);
    el.classList.add('has-error');
    const errEl = document.getElementById(inputId + 'Error');
    if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
  }

  function clearErrors() {
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    form.querySelectorAll('.form-error-msg').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function validateForm() {
    clearErrors();
    let valid = true;

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const service = serviceSelect.value;
    const message = document.getElementById('message').value.trim();

    if (!name) { showError('name', 'Please enter your name.'); valid = false; }

    if (!email) {
      showError('email', 'Please enter your email address.'); valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Please enter a valid email address.'); valid = false;
    }

    if (!service) { showError('serviceType', 'Please select a service.'); valid = false; }

    if (!message) {
      showError('message', 'Please add a message.'); valid = false;
    } else if (message.length < 20) {
      showError('message', 'Message is too short — please add a bit more detail.'); valid = false;
    }

    return valid;
  }

  /* Form submission via Formspree
     ─────────────────────────────────────────────────────────
     SETUP INSTRUCTIONS:
     1. Go to https://formspree.io and create a free account
     2. Create a new form → set recipient to ian.nytes@gmail.com
     3. Copy your Form ID (looks like "xyzabcde")
     4. Replace FORMSPREE_FORM_ID below with your actual ID
     ─────────────────────────────────────────────────────────
     ALTERNATIVE (EmailJS):
     1. Go to https://emailjs.com — create an account
     2. Add an Email Service (Gmail) and an Email Template
     3. Replace the fetch() below with emailjs.send(...)
     See the EmailJS quickstart: https://www.emailjs.com/docs/
     ───────────────────────────────────────────────────────── */
  const FORMSPREE_FORM_ID = 'xqewpvov'; // ← Replace this

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const successEl = document.getElementById('formSuccess');
    const errorEl   = document.getElementById('formError');
    const submitBtn = document.getElementById('submitBtn');

    successEl.classList.remove('visible');
    errorEl.classList.remove('visible');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Gather form data
    const formData = {
      name:         document.getElementById('name').value.trim(),
      email:        document.getElementById('email').value.trim(),
      service:      serviceSelect.value,
      message:      document.getElementById('message').value.trim(),
    };

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        successEl.classList.add('visible');
        form.reset();
        consultAddon.classList.remove('visible');
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      // Fallback: show mailto link if Formspree isn't configured
      if (FORMSPREE_FORM_ID === 'YOUR_FORM_ID_HERE') {
        const subject = encodeURIComponent(`Edit Request — ${formData.service}`);
        const body    = encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.service}\n` +
          `Consultation: ${formData.consultation}\n\nMessage:\n${formData.message}`
        );
        window.location.href = `mailto:ian.nytes@gmail.com?subject=${subject}&body=${body}`;
        successEl.classList.add('visible');
        successEl.querySelector('p').textContent =
          "Opening your email client… If nothing happens, email ian.nytes@gmail.com directly.";
      } else {
        errorEl.classList.add('visible');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

/* ── Init on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
  initAnimations();
  initContactForm();
});
