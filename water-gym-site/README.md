# Sprites Gym Site — Setup Guide

## Project Documentation

- [`WATER_GYM_FOUNDATION.md`](./WATER_GYM_FOUNDATION.md) captures the current Sprites Gym product/lore/design groundwork already embedded in this site: Marina, Ripple, the sprite-agent roster, Ability cards, pricing assumptions, onboarding flow, visual language, and notes for future Command Center design.
- [`SOFTWARE_ROLLOUT.md`](./SOFTWARE_ROLLOUT.md) documents the installer/setup orchestrator MVP: dependency detection, OpenClaw agent creation, provider/model config, local generated config, and current rollout checkpoint.

Use the foundation brief as the handoff document for Smeargle/UX, Mr. Mime/product, Castform/agent systems, Unown/workflows, Digtrio/integrations, Kecleon/brand-lore, and Meowth/revenue work. Use the rollout doc for Digtrio/Metagross/Duskull engineering work.

## Quick Start

Open `index.html` directly in a browser. No build step, no server required for the marketing site.

## Local Sprites Gym Setup Prototype

Dry-run the setup orchestrator:

```bash
npm run setup:dry-run
```

Apply local OpenClaw agent/config setup:

```bash
npm run setup:apply -- --skip-key-validation
```

If OpenClaw is missing, allow setup to install it first:

```bash
npm run setup:apply -- --install-openclaw --skip-key-validation
```

This creates/updates the local Sprites Gym agents (`water-marina`, `water-ripple`, `water-tidebyte`, `water-squink`, `water-waveform`, `water-torrentail`, `water-cascadex`) and writes ignored local state under `.water-gym/`.

## Bundled Installer Prototype

Run the installer wizard in development:

```bash
npm install
npm run installer:dev
```

Build a Windows installer:

```bash
npm run installer:pack
# or, for local unsigned/dev packaging:
npm run installer:pack:nosign
```

Build an unpacked Windows app directory:

```bash
npm run installer:dir
# or, for local unsigned/dev packaging:
npm run installer:dir:nosign
```

The installer prototype wraps the setup engine in a Sprites Gym branded Electron wizard. It also includes an **Allowed Folders** panel: users can choose or drag/drop folders to grant Sprites Gym explicit read access outside its own workspace. Those paths are stored in `.water-gym/config.json` under `allowedFolders` and can be revoked from the wizard.

Final packaging still needs a prebundled OpenClaw runtime so users do not need npm/network access on first run.

---

## Connecting Stripe Checkout

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign in.
2. Create a **Product** for each tier (Splash, Cascade, Tsunami).
3. Under each product, create a **Payment Link** (Billing → Payment Links → New).
4. Set it to **Recurring** with the monthly price.
5. Copy the generated URL (e.g. `https://buy.stripe.com/xxxxxxxx`).
6. Open `js/stripe-config.js`.
7. Replace each placeholder value with the correct Stripe Payment Link URL.

```js
window.SPRITES_GYM_STRIPE_LINKS = {
  splash: 'https://buy.stripe.com/your_splash_link',
  cascade: 'https://buy.stripe.com/your_cascade_link',
  tsunami: 'https://buy.stripe.com/your_tsunami_link'
};
```

---

## Email Notifications (Notify Me form)

The notify form currently shows a success message client-side only.

To wire it up for real:
- **Mailchimp**: Replace the form's `submit` handler in `js/main.js` with a Mailchimp embed or API call.
- **Substack**: Replace with a Substack signup embed.
- **ConvertKit / Beehiiv**: Same pattern — swap the POST target.

---

## Deploying

### Netlify (recommended)
1. Drag and drop the `water-gym-site/` folder onto [netlify.com/drop](https://app.netlify.com/drop).
2. Your site is live instantly.

### GitHub Pages
1. Push this folder as its own repo.
2. Go to Settings → Pages → Deploy from branch → `main` / root.

### Cloudflare Pages
1. Connect your GitHub repo.
2. Set build command to _(empty)_ and output directory to `/`.

---

## Adding Future Gyms

Each gym slot in the Gym Map (`index.html`) is a `.gym-slot.locked` div with:
- `data-type` — the element type (fire, electric, etc.)
- `data-hint` — tooltip text shown on hover

When a new gym launches:
1. Change `.locked` to `.available` on the appropriate slot.
2. Replace the `???` placeholder content with the gym name and sprite.
3. Add a `href="#[gym-section-id]"` to link to its product section.
4. Duplicate the Sprites Gym section block and apply a new color palette via a theme class (e.g. `.fire-theme`).

Each gym's accent colors are controlled by CSS custom properties on its wrapper — override them in `style.css` under a new theme class.

---

## File Structure

```
water-gym-site/
├── index.html          ← Full page
├── css/
│   ├── style.css       ← Layout, components, responsive
│   ├── sprites.css     ← CSS pixel art sprites
│   └── animations.css  ← Keyframes, scroll effects, water fx
├── js/
│   └── main.js         ← Typewriter, scroll observers, flip, Stripe
└── README.md           ← This file
```
