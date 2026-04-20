# Ian Nytes — Developmental Editor Website

A clean, warm-aesthetic, multi-page website for a freelance developmental editor.

## Files

```
editor-site/
├── index.html       — Home page
├── services.html    — All services (with consultation upsell logic)
├── examples.html    — Before/after samples and testimonials
├── projects.html    — Current book and writing projects
├── archive.html     — Stitcher's Archive external link page
├── contact.html     — Contact form with conditional consultation checkbox
├── style.css        — All styles (one file, fully responsive)
├── main.js          — Shared nav, footer, form logic, animations
└── README.md        — This file
```

---

## Running Locally

No build step needed — this is pure HTML/CSS/JS.

**Option A — Open directly:**
Just open `index.html` in any browser. All pages link to each other relatively.

**Option B — Local server (recommended):**
Using Python:
```bash
cd editor-site
python3 -m http.server 8080
# Visit http://localhost:8080
```

Using Node.js (npx):
```bash
cd editor-site
npx serve .
```

---

## Setting Up the Contact Form

The form uses **Formspree** (free tier, no backend needed).

### Step 1 — Create a Formspree account
1. Go to https://formspree.io
2. Sign up for a free account
3. Click **+ New Form**
4. Set the **recipient email** to `ian.nytes@gmail.com`
5. Copy the **Form ID** (it looks like `xpzgdkaj`)

### Step 2 — Add your Form ID
Open `main.js` and find this line near the top of `initContactForm()`:

```js
const FORMSPREE_FORM_ID = 'YOUR_FORM_ID_HERE'; // ← Replace this
```

Replace `YOUR_FORM_ID_HERE` with your actual Formspree form ID.

### That's it!
The form will now send submissions directly to your email. 
The consultation add-on field is included in the email data automatically.

> **Note:** Without a real Form ID, the form will fall back to opening the user's 
> default email client with the data pre-filled. This works as a temporary fallback 
> but isn't ideal long-term.

### Alternative: EmailJS
If you prefer EmailJS (https://emailjs.com):
1. Create an account and connect a Gmail service
2. Create an email template — use variables like `{{name}}`, `{{email}}`, `{{service}}`
3. Replace the `fetch()` block in `main.js` with:
   ```js
   await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData, 'YOUR_PUBLIC_KEY');
   ```
4. Add the EmailJS SDK to each HTML file's `<head>`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
   ```

---

## Customization Checklist

### Content to replace (search for `[Placeholder` in all files):
- [ ] **index.html** — Bio section, stat numbers, year/credential details
- [ ] **services.html** — Genre list, turnaround times, word count limits
- [ ] **examples.html** — Real testimonials (replace placeholder text)
- [ ] **projects.html** — Book title, blurb, genre tags, links to read/purchase
- [ ] **archive.html** — Stitcher's Archive description, excerpt, platform links
- [ ] **all pages** — Replace `[X]` with real numbers throughout

### Links to activate:
- [ ] `archive.html` — Replace `href="#"` with actual archive URL
- [ ] `projects.html` — Replace `href="#"` with book/newsletter links
- [ ] Formspree form ID in `main.js`

### Optional additions:
- Add your photo to the "About Me" section in `index.html`
- Add your actual book cover image to `projects.html`
- Add Google Analytics or Plausible for traffic tracking
- Add a favicon (`<link rel="icon" href="favicon.ico">` in each `<head>`)

---

## Deploying

### Option A — Netlify (recommended, free)
1. Go to https://netlify.com and create an account
2. Click **"Add new site" → "Deploy manually"**
3. Drag the `editor-site/` folder onto the Netlify drop zone
4. Done — you'll get a free `.netlify.app` URL instantly
5. Connect a custom domain in Settings → Domain management

### Option B — GitHub Pages (free)
1. Create a GitHub account at https://github.com
2. Create a new repository called `editor-site` (or any name)
3. Upload all files in `editor-site/` to the repository
4. Go to Settings → Pages → Source: **Deploy from branch → main**
5. Your site will be at `https://yourusername.github.io/editor-site/`

### Option C — Cloudflare Pages (free, fast CDN)
1. Go to https://pages.cloudflare.com
2. Connect your GitHub repo
3. No build command needed (static site)
4. Extremely fast global CDN included free

### Option D — Traditional hosting (Namecheap, Bluehost, etc.)
Upload all files in `editor-site/` via FTP to the `public_html/` directory.

---

## Custom Domain

Once deployed on Netlify or Cloudflare Pages:
1. Buy a domain from Namecheap, Squarespace, or Google Domains (~$12/yr)
2. Follow your host's instructions to connect the domain (usually 2–3 DNS records)
3. HTTPS is handled automatically on Netlify/Cloudflare

---

## Colors & Typography (for future tweaks)

All colors are CSS custom properties in `style.css`:
```css
--cream:       #FFF8F0   /* Page background */
--brown:       #5A4634   /* Primary headings, nav */
--terracotta:  #D77A61   /* Accent, buttons, highlights */
--text:        #2E2E2E   /* Body text */
```

Fonts loaded from Google Fonts:
- **Cormorant Garamond** — headings (elegant, literary serif)
- **Jost** — body text (clean, modern sans-serif)
