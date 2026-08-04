/* ═══════════════════════════════════════════
   THE GYM ECOSYSTEM — main.js
═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── NAV ────────────────────────────────
  const nav = document.getElementById('main-nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    navToggle.textContent = navLinks.classList.contains('open') ? '▲' : '▼';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.textContent = '▼';
    });
  });

  // ─── TYPEWRITER ─────────────────────────
  // Returns a cancel token { cancelled: false }. Set .cancelled = true to stop.
  function typewrite(el, text, delay = 40, onDone) {
    el.textContent = '';
    let i = 0;
    const token = { cancelled: false };
    const tick = () => {
      if (token.cancelled) return;
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, delay);
      } else if (onDone) {
        onDone();
      }
    };
    tick();
    return token;
  }

  function initDialogue(boxId, delay = 40) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const textEl = box.querySelector('.dialogue-text');
    const cursor = box.querySelector('.blink-cursor');
    if (!textEl) return;

    const text = textEl.dataset.text || '';
    textEl.textContent = '';
    if (cursor) cursor.classList.add('hidden');

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.disconnect();
        typewrite(textEl, text, delay, () => {
          if (cursor) cursor.classList.remove('hidden');
        });
      }
    }, { threshold: 0.4 });

    obs.observe(box);
  }

  initDialogue('water-intro-dialogue', 35);
  initDialogue('final-dialogue', 45);

  // ─── HERO MARINA INTRO DIALOGUE ─────────
  function initMarinaIntro() {
    const hero = document.getElementById('hero');
    const intro = document.getElementById('marina-intro');
    const introImage = document.getElementById('marina-intro-image');
    const introText = document.getElementById('marina-intro-text');
    const introNext = document.getElementById('marina-intro-next');
    const introSkip = document.getElementById('marina-intro-skip');
    const heroImage = document.getElementById('marina-hero-image');

    if (!hero || !intro || !introImage || !introText || !introNext) return;

    const steps = [
      {
        image: 'images/Marina_Talking_statement.png',
        text: 'My Gym uses specialized AI Sprites to generate blogs, repurpose content, schedule social posts, monitor trends, and grow your audience automatically.\nConnect your AI provider, link your socials, and launch content workflows in minutes.'
      },
      {
        image: 'images/Marina_Talking_Question.png',
        text: 'Want to reach a broader audience? Organize your photos and content? Hop on trends and manage all your social media in one streamlined workflow system?'
      },
      {
        image: 'images/Marina_smirk.png',
        text: "Then you'll need me and my teams help."
      }
    ];

    let stepIndex = 0;
    let introClosed = false;
    let activeTypewriteToken = null;
    hero.classList.add('marina-intro-active');

    const finishIntro = () => {
      if (introClosed) return;
      introClosed = true;

      if (heroImage) {
        heroImage.src = 'images/Marina_smirk.png';
      }

      hero.classList.remove('marina-intro-active');
      hero.classList.add('marina-intro-done');
      setTimeout(() => {
        intro.style.display = 'none';
      }, 320);
    };

    const renderStep = () => {
      if (activeTypewriteToken) activeTypewriteToken.cancelled = true;
      const step = steps[stepIndex];
      introImage.src = step.image;
      introImage.alt = stepIndex === 0 ? 'Marina speaking' : 'Marina asking a question';
      introNext.disabled = true;

      activeTypewriteToken = typewrite(introText, step.text, 14, () => {
        if (introClosed) return;
        introNext.disabled = false;
        introNext.focus({ preventScroll: true });
      });
    };

    introNext.addEventListener('click', () => {
      stepIndex += 1;
      if (stepIndex < steps.length) {
        renderStep();
        return;
      }

      finishIntro();
    });

    if (introSkip) {
      introSkip.addEventListener('click', finishIntro);
    }

    renderStep();

    // Allow replaying by clicking Marina's hero image
    if (heroImage) {
      heroImage.style.cursor = 'pointer';
      heroImage.title = 'Click to replay intro';
      heroImage.addEventListener('click', () => {
        if (activeTypewriteToken) activeTypewriteToken.cancelled = true;
        stepIndex = 0;
        introClosed = false;
        intro.style.display = '';
        hero.classList.add('marina-intro-active');
        hero.classList.remove('marina-intro-done');
        introNext.disabled = true;
        renderStep();
      });
    }
  }

  initMarinaIntro();

  // ─── CARD PORTRAIT REACTIONS ───────────
  function initCardPortraitSwap(cardSelector, imageId) {
    const cardFront = document.querySelector(cardSelector);
    const portrait = document.getElementById(imageId);
    if (!cardFront || !portrait) return;

    const defaultSrc = portrait.dataset.defaultSrc || portrait.getAttribute('src');
    const hoverSrc = portrait.dataset.hoverSrc || defaultSrc;

    const showHover = () => {
      portrait.src = hoverSrc;
    };

    const showDefault = () => {
      portrait.src = defaultSrc;
    };

    cardFront.addEventListener('mouseenter', showHover);
    cardFront.addEventListener('mouseleave', showDefault);
    cardFront.addEventListener('focusin', showHover);
    cardFront.addEventListener('focusout', showDefault);
  }

  initCardPortraitSwap('.sprite-card.leader-card .card-front', 'marina-card-image');
  initCardPortraitSwap('.sprite-card[data-sprite="ripple"] .card-front', 'ripple-card-image');
  initCardPortraitSwap('.sprite-card[data-sprite="tidebyte"] .card-front', 'tidbyte-card-image');
  initCardPortraitSwap('.sprite-card[data-sprite="squink"] .card-front', 'squink-card-image');
  initCardPortraitSwap('.sprite-card[data-sprite="torrentail"] .card-front', 'torrentail-card-image');
  initCardPortraitSwap('.sprite-card[data-sprite="cascadex"] .card-front', 'cascadex-card-image');

  // ─── STAT BARS (sprite cards) ─────────
  function animateStatBars(card) {
    card.querySelectorAll('.stat-fill').forEach(fill => {
      const target = parseInt(fill.dataset.fill, 10) || 0;
      fill.style.setProperty('--target-width', target + '%');
      fill.classList.add('animated');
    });
  }

  function hydrateSpriteCardBacks() {
    const generatedAttributes = {
      marina: ['Role: Team captain and workflow orchestrator', 'Style: Direct, strategic, quality-first', 'Focus: Final review and alignment', 'Power Move: Multi-sprite handoff chains'],
      ripple: ['Role: Trend scout and timing analyst', 'Style: Fast, signal-driven, reactive', 'Focus: Topic momentum and platform shifts', 'Power Move: Early-wave opportunity alerts'],
      tidebyte: ['Role: Search optimization specialist', 'Style: Analytical and structure-focused', 'Focus: SERP visibility and ranking lift', 'Power Move: Intent-matched keyword clustering'],
      squink: ['Role: Core writer and voice crafter', 'Style: Creative, adaptive, audience-aware', 'Focus: Hooks, clarity, and conversion flow', 'Power Move: Tone-perfect first drafts'],
      waveform: ['Role: Repurposing and format adapter', 'Style: Efficient and channel-specific', 'Focus: Expanding one idea across platforms', 'Power Move: Long-form to short-form pipelines'],
      torrentail: ['Role: Metrics and insight analyst', 'Style: Evidence-based and objective', 'Focus: Performance diagnostics and optimization', 'Power Move: Action-ready reporting briefs'],
      cascadex: ['Role: Distribution and scheduling lead', 'Style: Organized and cadence-driven', 'Focus: Calendar consistency and delivery windows', 'Power Move: Multi-platform release orchestration']
    };

    document.querySelectorAll('.sprite-card').forEach(card => {
      const spriteKey = card.dataset.sprite;
      const back = card.querySelector('.card-back');
      if (!back) return;

      if (!back.querySelector('.card-close-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'card-close-btn';
        closeBtn.setAttribute('aria-label', 'Close card');
        closeBtn.textContent = 'X';
        back.insertAdjacentElement('afterbegin', closeBtn);
      }

      const nameEl = back.querySelector('.sprite-name-back');

      if (!back.querySelector('.sprite-back-portrait')) {
        const frontPortrait = card.querySelector('.card-front img.card-sprite');
        const portrait = document.createElement('img');
        portrait.className = 'sprite-back-portrait';
        portrait.src = frontPortrait ? frontPortrait.getAttribute('src') : 'images/logo.png';
        portrait.alt = ((nameEl && nameEl.textContent) || 'Sprite') + ' profile portrait';
        if (nameEl) {
          nameEl.insertAdjacentElement('afterend', portrait);
        } else {
          back.insertAdjacentElement('afterbegin', portrait);
        }
      }

      if (!back.querySelector('.sprite-attribute-list')) {
        const label = document.createElement('div');
        label.className = 'sprite-attributes-label';
        label.textContent = 'ATTRIBUTES';

        const list = document.createElement('ul');
        list.className = 'sprite-attribute-list';

        (generatedAttributes[spriteKey] || ['Role: Specialist sprite', 'Style: Adaptive', 'Focus: High-impact execution', 'Power Move: Team synergy']).forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          list.appendChild(li);
        });

        const abilitiesLabel = back.querySelector('.sprite-abilities-label');
        if (abilitiesLabel) {
          abilitiesLabel.insertAdjacentElement('beforebegin', label);
          label.insertAdjacentElement('afterend', list);
        } else {
          back.appendChild(label);
          back.appendChild(list);
        }
      }
    });
  }

  // ─── INTERSECTION OBSERVER (general) ────
  const fadeTargets = document.querySelectorAll('.fade-in, .battle-stat, .sprite-card, .ability-card');

  const staggerMap = new Map();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // Stagger siblings in same parent
      const siblings = Array.from(el.parentElement.querySelectorAll(
        '.fade-in, .battle-stat, .sprite-card, .ability-card'
      ));
      const idx = siblings.indexOf(el);
      const delay = idx * 80;

      setTimeout(() => {
        el.classList.add('visible');
        if (el.classList.contains('sprite-card')) animateStatBars(el);
        if (el.classList.contains('battle-stat')) animateBSBar(el);
      }, delay);

      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  fadeTargets.forEach(el => observer.observe(el));

  // ─── BATTLE STAT BARS ────────────────────
  function animateBSBar(stat) {
    const bar = stat.querySelector('.bs-bar');
    if (!bar) return;
    const target = parseInt(bar.dataset.fill, 10) || 0;
    bar.style.setProperty('--target-width', target + '%');
    bar.classList.add('animated');
  }

  // ─── SPRITE CARD FLIP ──────────────────
  hydrateSpriteCardBacks();
  const spriteCards = Array.from(document.querySelectorAll('.sprite-card'));
  let activeCard = null;
  const cardOrigins = new WeakMap();

  const cardBackdrop = document.createElement('div');
  cardBackdrop.className = 'card-focus-backdrop';
  document.body.appendChild(cardBackdrop);

  const closeActiveCard = () => {
    if (!activeCard) return;

    const origin = cardOrigins.get(activeCard);
    if (origin && origin.parent) {
      if (origin.nextSibling && origin.nextSibling.parentNode === origin.parent) {
        origin.parent.insertBefore(activeCard, origin.nextSibling);
      } else {
        origin.parent.appendChild(activeCard);
      }
    }

    activeCard.classList.remove('flipped', 'focus-open', 'active-focus');
    activeCard = null;
    document.body.classList.remove('card-focus-active');
  };

  const openCard = (card) => {
    if (activeCard && activeCard !== card) {
      closeActiveCard();
    }

    if (!cardOrigins.has(card)) {
      cardOrigins.set(card, {
        parent: card.parentNode,
        nextSibling: card.nextSibling
      });
    }

    document.body.appendChild(card);
    spriteCards.forEach(c => c.classList.remove('flipped', 'focus-open', 'active-focus'));
    card.classList.add('focus-open', 'active-focus');
    activeCard = card;
    document.body.classList.add('card-focus-active');

    // Double-rAF: first frame positions the card at center (front face showing),
    // second frame triggers the flip so the transition actually animates.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (activeCard === card) {
          card.classList.add('flipped');
        }
      });
    });

    animateStatBars(card);
  };

  spriteCards.forEach(card => {
    card.addEventListener('click', () => {
      if (activeCard === card) {
        closeActiveCard();
        return;
      }
      openCard(card);
    });

    const closeBtn = card.querySelector('.card-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        closeActiveCard();
      });
    }
  });

  cardBackdrop.addEventListener('click', closeActiveCard);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeActiveCard();
    }
  });

  // ─── STRIPE BUTTONS ──────────────────────
  const stripeLinks = window.SPRITES_GYM_STRIPE_LINKS || {};

  function getStripeLinkForButton(btn) {
    const plan = (btn.dataset.plan || '').toLowerCase();
    const configuredLink = stripeLinks[plan];
    const legacyLink = btn.dataset.stripeLink;
    return configuredLink || legacyLink || '';
  }

  function isStripePaymentLink(url) {
    return /^https:\/\/buy\.stripe\.com\//i.test(url);
  }

  document.querySelectorAll('.subscribe-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const link = getStripeLinkForButton(btn);

      if (!link || link.includes('YOUR_') || !isStripePaymentLink(link)) {
        e.preventDefault();
        showPixelAlert('Stripe payment link is not configured yet.\nUpdate js/stripe-config.js with your buy.stripe.com links.');
        return;
      }

      window.location.href = link;
    });
  });

  // ─── NOTIFY FORM ─────────────────────────
  const notifyForm = document.getElementById('notify-form');
  if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = notifyForm.querySelector('input[type="email"]').value;
      if (email) {
        notifyForm.innerHTML = '<p style="font-size:9px;color:#4caf50;line-height:2;">✓ YOU\'RE ON THE LIST.<br>WE\'LL NOTIFY YOU.</p>';
      }
    });
  }

  // ─── PIXEL ALERT (dialogue-style) ────────
  function showPixelAlert(msg) {
    const existing = document.getElementById('pixel-alert');
    if (existing) existing.remove();

    const box = document.createElement('div');
    box.id = 'pixel-alert';
    box.style.cssText = `
      position: fixed;
      bottom: 2rem; left: 50%; transform: translateX(-50%);
      background: #f8f8e8;
      border: 4px solid #383838;
      box-shadow: 0 0 0 2px #f8f8e8, 0 0 0 6px #383838;
      padding: 1.25rem 1.5rem;
      color: #1a1a1a;
      font-family: 'Press Start 2P', monospace;
      font-size: 8px;
      line-height: 2;
      z-index: 9999;
      max-width: 360px;
      text-align: center;
      white-space: pre-line;
    `;
    box.textContent = msg;

    const close = document.createElement('div');
    close.textContent = '[ OK ]';
    close.style.cssText = `
      margin-top: 0.75rem;
      cursor: pointer;
      color: #1a6fa8;
    `;
    close.addEventListener('click', () => box.remove());
    box.appendChild(close);
    document.body.appendChild(box);

    setTimeout(() => box.remove(), 5000);
  }

  // ─── ACTIVE NAV LINK ─────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}`
            ? 'var(--badge-gold)'
            : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

})();
