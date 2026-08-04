# Sprites Gym Foundation Brief

_Last updated: 2026-05-09_

This document captures the current groundwork already present in this static Sprites Gym site. Treat it as source-of-truth context for the future The Command Center until a newer product spec supersedes it.

## Project Identity

**Product family:** The Gym Ecosystem  
**First product:** Sprites Gym / Gym #1  
**Positioning:** A downloadable, BYOK AI content department made of specialized sprites coordinated by a Sprite Trainer.  
**Primary promise:** Install your AI team, connect your provider, launch content workflows, and watch specialized agents collaborate inside one app.

### Existing site copy that defines the concept

- “The Sprites Gym is a collection of modular AI sprite packages — each one a specialized team built to handle a specific domain of work.”
- “Each Gym is installable, bring-your-own-key, and designed to feel like a living AI department — not just another chatbot.”
- “Connect your AI provider, launch a workflow, and watch your team go to work. The Sprites Gym is first. More gyms are coming.”
- Sprites Gym tagline: **AI Content Department. Content Creation · SEO · Growth · Repurposing.**
- Sprites Gym intro: **Seven specialized sprites led by Marina — each handling a different stage of your content pipeline.**

## Communication Product Boundary

All communication with sprites/agents happens through The Command Center. Normal users should not need Telegram, Discord, a separate Mission Control, terminal logs, or any other external lane. Inputs, outputs, sprite questions, sprite-to-sprite coordination, approvals, and deliverables must all route back into the app.

A highest-paid/custom tier may eventually allow users to edit/extend the build and create their own external integrations, but that is explicitly outside the default product. The default product is a one-stop shop.

## Theme and Emotional Direction

Important product architecture note: **the base app should not be water-themed.** The base UI should feel like a polished Pokémon-clone / monster-collecting gym platform. Water/specific pack flavor belongs in Gym-pack theme layers, not the shared installer/app shell. Users may eventually own multiple Gym packs, so themes need to coexist cleanly inside one downloader/app experience.

The Sprites Gym pack should feel:

- fluid
- fast-moving
- strategic
- creative
- collaborative
- approachable for nontechnical users
- premium but playful
- alive/observably active

Existing theme tags in the page:

- Flow
- Adaptability
- Distribution
- Momentum
- Virality
- Social Intelligence

The user experience should make the user feel like they are managing a living content studio, not filling out a generic AI form. That feeling should come from pack content and theme accents layered onto a reusable base UI, not from hardcoding the whole product as a water interface.

## Sprite Trainer

### Marina

**Role:** Water Sprite Trainer  
**Specialty:** Command & Coordination  
**Quote:** “Every wave starts somewhere. I decide where.”

**Abilities currently defined:**

- Delegates tasks across all sprites
- Maintains workflow coherence
- Final quality gate on all outputs
- Coordinates review loops

**Stats shown on card:**

- STR 95
- SPD 88
- WIS 99

### Marina visual direction

Existing image assets:

- `images/marina.png` — main hero/final CTA portrait
- `images/Marina_smirk.png` — card/hero resolved expression
- `images/Marina_Talking_Question.png` — dialogue/question expression
- `images/Marina_Talking_statement.png` — dialogue/statement expression

Observed visual traits:

- Teal-blue ponytail, strong water/shell motifs, sporty command-jacket silhouette.
- Confident expression; points/directs the user like a guide and operator.
- Palette: teal hair, aqua eyes, blue/white jacket, navy underlayer, shell accessories, bright pool/glass-dome background.
- She should be the user-facing coordinator and final approval gate in the app.
- The Command Center should make her feel present through dialogue boxes, short status calls, approval prompts, and “Marina says…” moments, without turning every action into a mascot interruption.

### Current Marina intro dialogue flow

The homepage currently opens with a multi-step Marina dialogue overlay:

1. “My Gym uses specialized AI Sprites to generate blogs, repurpose content, schedule social posts, monitor trends, and grow your audience automatically. Connect your AI provider, link your socials, and launch content workflows in minutes.”
2. “Want to reach a broader audience? Organize your photos and content? Hop on trends and manage all your social media in one streamlined workflow system?”
3. “Then you'll need me and my teams help.”

Implementation implication: onboarding should begin with a short guided Marina setup sequence: connect provider, choose workflow, optionally connect socials, launch first Ability.

## Sprite-Agent Roster

The Sprites Gym roster is **six sprites plus one Sprite Trainer**. “Full 7-sprite roster” language means Marina + the six specialist sprites, not a missing seventh sprite.

### Ripple

**Specialty:** Trend Monitor  
**Quote:** “I feel trends before they break the surface.”  
**Image asset:** `images/Ripple.png`

**Abilities:**

- Real-time topic trend analysis
- Viral pattern detection
- Platform-specific timing intelligence
- Feeds insights to the full team

**Stats:** SPD 95, AWR 90, RCH 80

**Visual direction:**

- Jellyfish/water-spirit sprite with translucent aqua dome, tentacles, large friendly blue eyes, and holographic analytics/map panels.
- Background suggests bright water-gym atrium/pool architecture.
- UI implications: Ripple should own trend maps, wave/current metaphors, surface/breaking trend indicators, and “current map” panels. Ripple's screens should be glassy, aqua, slightly translucent, and data-rich but still friendly.

### Tidebyte

**Specialty:** SEO Optimizer  
**Quote:** “The algorithm has no secrets from me.”

**Abilities:**

- Keyword research & intent mapping
- Title & meta description generation
- On-page SEO structuring
- Slug & heading optimization

**Stats:** SEO 97, ANA 85, DEP 92

**Visual/CSS sprite notes:**

- Sprite palette in CSS uses dark blue, gold, claw/deep blue, electric-aqua eye.
- Should feel sharper/more technical than Ripple.
- UI ownership: SEO briefs, keyword maps, SERP intent, title/meta panels, slug/heading scoring.

### Squink

**Specialty:** Writer  
**Quote:** “Words flow like water. I just direct the current.”

**Abilities:**

- Long-form blog & article drafting
- Hook & intro generation
- Tone matching to brand voice
- Caption & short-form writing

**Stats:** WRT 93, TON 89, CRE 96

**Visual/CSS sprite notes:**

- Sprite palette uses deep purple, blue-purple, ink, magenta eye.
- Should own writing surfaces, voice/tone controls, drafts, hooks, and caption generation.

### Waveform

**Specialty:** Content Repurposer  
**Quote:** “One piece of content. Infinite reach.”

**Abilities:**

- Blog → Shorts → Threads → Reels
- Platform-specific reformatting
- Clip & highlight extraction
- Cross-platform campaign packs

**Stats:** ADP 94, RCH 91, SPD 86

**Visual/CSS sprite notes:**

- Sprite palette uses cyan, teal, and dark blue-green.
- Should own transformation flows: “source content in, platform variants out.”

### Torrentail

**Specialty:** Analytics  
**Quote:** “Numbers don't lie. They just need translating.”

**Abilities:**

- Post performance analysis
- Audience growth metrics
- Engagement pattern detection
- Optimization recommendations

**Stats:** ANA 98, PRE 92, INS 87

**Visual/CSS sprite notes:**

- Sprite palette uses electric blue, dark navy, fin colors, and gold data markers.
- Should own dashboards, charts, postmortems, performance summaries, and “next best action” recommendations.

### Cascadex

**Specialty:** Scheduler  
**Quote:** “Right content. Right platform. Right moment.”

**Abilities:**

- Multi-platform post scheduling
- Algorithm-timed publishing
- Content calendar management
- Campaign queue coordination

**Stats:** ORG 96, TIM 99, AUT 88

**Visual/CSS sprite notes:**

- Sprite palette uses violet, pale lavender, gold clock elements, and dark purple.
- Should own calendars, queues, approvals, publishing windows, and schedule conflict warnings.

## Defined Abilities / Workflows

The site already contains ten user-facing Abilities. These should become first-class Command Center/Pokemart workflow cards later.

1. **Generate Blog Post**
   - Team: Ripple · Tidebyte · Squink · Marina
   - Output: SEO-optimized long-form post with title options, meta, slug, and social snippets.

2. **Schedule Social Post**
   - Team: Squink · Cascadex · Torrentail
   - Output: Platform-adapted posts with captions, hashtags, and scheduled publishing across six platforms.

3. **Repurpose Content**
   - Team: Waveform · Squink · Cascadex
   - Output: Turn one piece of content into a full cross-platform campaign pack.

4. **Shorts Script**
   - Team: Ripple · Squink · Waveform
   - Output: Hook-first short-form video scripts for YouTube Shorts, TikTok, and Reels.

5. **Content Calendar**
   - Team: Ripple · Cascadex · Marina
   - Output: Full monthly content plan with topics, platforms, and posting schedule.

6. **SEO Optimize**
   - Team: Tidebyte · Squink · Marina
   - Output: Audit and upgrade an existing article for search intent, keywords, and structure.

7. **YouTube Description**
   - Team: Tidebyte · Squink
   - Output: SEO-rich video descriptions with chapters, CTAs, and keyword placement.

8. **Instagram Caption**
   - Team: Squink · Ripple · Cascadex
   - Output: Engagement-optimized captions with hashtag strategy for Instagram posts and Reels.

9. **Analyze Performance**
   - Team: Torrentail · Ripple · Marina
   - Output: Post-performance review with insights and recommended next steps.

10. **Campaign Pack**
    - Team: Full Team · Marina
    - Output: End-to-end multi-platform campaign: blog, social, shorts, email, and schedule.

## Battle Stats / Feature Pillars

The page defines four feature pillars:

1. **BYOK Support** — 100
   - Connect OpenAI, Anthropic, Gemini, OpenRouter, or local models. No vendor lock-in.
2. **Multi-Provider Routing** — 90
   - Assign different AI providers per sprite. Optimize for speed, cost, and quality.
3. **Auto-Update System** — 85
   - Receive new sprites, workflow patches, and improvements without reinstalling.
4. **Social Integration** — 88
   - Connect Instagram, TikTok, YouTube, X, Facebook, and Reddit for direct publishing.

## Pricing / Commercial Assumptions

The site currently proposes three badge tiers:

### Splash Badge — $29/mo

- 3 Sprites: Ripple, Squink, Tidebyte
- 50 workflow runs/month
- Blog Post + Social Post abilities
- BYOK, 1 provider
- Email support
- No social media integration
- No Command Center
- No multi-gym access

### Cascade Badge — $79/mo

- Full 7-sprite roster
- 200 workflow runs/month
- All 10 abilities unlocked
- BYOK, multi-provider
- Social media integration, 6 platforms
- Auto-update system
- Priority support
- No Command Center

### Tsunami Badge — $199/mo

- Full 7-sprite roster
- Unlimited workflow runs
- All 10 abilities unlocked
- BYOK, all providers
- Social media integration, 6 platforms
- The Command Center UI
- Multi-gym ready for future gyms
- Team access + priority updates
- Priority access to all future gym launches

Product review note: The current pricing gates “The Command Center UI” to Tsunami. If the app itself is the product’s core experience, this may need revisiting; perhaps lower tiers get a limited Command Center while Tsunami gets multi-gym/team/advanced automation.

## Install / Onboarding Flow

The current site defines a four-step start flow:

1. **Install the Gym** — download package after subscribing; one-command installer; no dependencies.
2. **Connect Your Key** — paste API key from a supported provider; setup wizard walks through it.
3. **Select Provider** — pick one provider or assign different models per sprite.
4. **Go** — launch an Ability from The Command Center.

Supported provider labels on the page:

- OpenAI
- Anthropic
- Gemini
- OpenRouter
- Local Models

## Ecosystem Map

Sprites Gym is positioned as Gym #1. Seven future gyms are teased as locked slots:

- Fire — “Fueled by ambition. Forged in automation.”
- Electric — “Speed, precision, and shock-value clarity.”
- Grass — “Growth, roots, and long-term strategy.”
- Psychic — “Pattern recognition. Insight at scale.”
- Dark — “Competitive intelligence and counterplay.”
- Steel — “Infrastructure, systems, and cold precision.”
- Dragon — “Elite. Enterprise. End-to-end domination.”

## Current Design System

### Format

- Static HTML/CSS/JS site.
- No build step.
- GBA/8-bit-inspired layout with modern illustrated/anime assets.
- Pixel UI: chunky borders, dialogue boxes, stat bars, badges, flip cards, typewriter text.

### Fonts

Loaded from Google Fonts:

- `Press Start 2P` for main pixel UI labels/headings.
- `VT323` for body/dialogue-style text.

### Color tokens

From `css/style.css`:

- `--dark-navy`: `#0a1628`
- `--ocean-deep`: `#0d2b45`
- `--ocean-mid`: `#1a4a6b`
- `--water-blue`: `#1e6ba8`
- `--aqua`: `#00bcd4`
- `--electric-aqua`: `#00e5ff`
- `--foam`: `#b2ebf2`
- `--badge-gold`: `#ffd700`
- `--hp-green`: `#4caf50`
- `--text-light`: `#e0f7ff`
- `--text-dim`: `#7aa8c4`

### UI components already represented

- Fixed pixel nav
- Hero section with Marina image and intro dialogue overlay
- Dialogue boxes with typewriter effects and blinking cursor
- Gym map with available/locked cards
- Sprite roster cards with front/back flip interaction
- Stat bars with animated fills
- Ability cards
- Battle stat bars
- Pricing badge cards
- Install tutorial panel
- Provider tags
- Notify form
- Pixel alert modal
- Final CTA with Marina

### Motion/interaction language

From `js/main.js` and CSS:

- Typewriter dialogue on scroll/intro.
- Marina intro overlay with three stepped statements and changing portraits.
- Scroll-triggered fade/stagger entrance.
- Sprite card flip on click.
- Animated stat bars.
- Pixel alert for missing Stripe links.
- Active nav section highlighting.
- Water glow, wave, float, and pulse animations.

## Smeargle Design Guidance for the Future App

Smeargle should treat the static site as a brand and UX seed, not merely marketing.

### Command Center implications

The future Sprites Gym app should borrow these patterns:

- **Marina as operator:** She should coordinate workflows, summarize status, ask for approvals, and mark completion.
- **Sprite cards as live agents:** Each sprite should have a status card, current task, specialty, model/provider assignment, and recent message/activity.
- **Ability cards as launch buttons:** The ten Abilities should become guided workflow launchers.
- **Dialogue boxes for clarity:** Use short in-world system messages for setup, approvals, and review points.
- **Water-current metaphors:** Workflows should feel like currents moving through agents: Research → SEO → Draft → Repurpose → Schedule → Analyze → Marina approval.
- **Transparency as entertainment:** Users should see delegation paths and sprite-to-sprite reviews, not just final output.

### Suggested initial app panels

1. **Gym Overview**
   - Marina status
   - Active Ability run
   - Provider health
   - Social connection status
   - Recent team activity

2. **Ability Launcher / Pokemart**
   - Ten Ability cards from the site
   - Required inputs
   - Participating sprites
   - Output preview

3. **Team Tank / Sprite Roster**
   - Marina + sprites
   - Specialty, stats, role, status
   - Model/provider assignment
   - Recent messages

4. **Workflow Current**
   - Visual pipeline of the active run
   - Current owner sprite
   - Review/approval gates
   - Error/retry status

5. **Content Dock**
   - Drafts, generated assets, scheduled posts
   - Export markdown/HTML/social copy

6. **Provider Setup**
   - Single-provider default path
   - Advanced multi-provider assignment
   - Token/cost warnings

7. **Social Harbor**
   - Connected platforms
   - Scheduled queue
   - Analytics feed

### Style guidance

- Keep the existing water palette and gold badge highlights.
- Use pixel borders and labels, but avoid making dense work screens unreadable.
- Favor crisp panels and light animation; do not over-animate production workflows.
- Marina/Ripple illustrated assets are softer/anime-modern than the pixel UI; the app can combine illustrated portraits for hero/status moments with pixel UI for controls.
- Use Ripple’s glass-map visual language for trend and analytics screens.

## Open Questions / Product Risks

1. **Command Center tiering:** Current pricing reserves Command Center for Tsunami. If Command Center is central to product value and transparency, lower tiers may need limited access.
2. **Nintendo-adjacent wording:** The site uses Gym/badge/sprite language and 8-bit RPG cues. Before commercial launch, Kecleon should refine naming/visual language toward a legally safer non-Nintendo sprite universe.
3. **Social posting permissions:** Direct publishing across six platforms will require careful OAuth, review, scheduling, cancellation, and platform-policy handling.
4. **BYOK onboarding:** Must stay extremely simple. The current four-step flow is the north star: install, connect key, select provider, go.
5. **Workflow runs/month:** Meowth should validate whether 50/200/unlimited workflow run economics work under BYOK and hosted/support costs.

## Art Direction and Sprite Production Policy

Ian will create/source the full sprite illustration set. Smeargle should convert approved sprite images into matching app/pixel sprites and UI-ready avatar treatments.

Current image availability:

- Marina: available (`marina.png`, `Marina_smirk.png`, `Marina_Talking_Question.png`, `Marina_Talking_statement.png`)
- Ripple: available (`Ripple.png`, `ripple_talking_cute.jpg`)
- Tidebyte: pending image from Ian
- Squink: no approved image yet
- Waveform: no approved image yet
- Torrentail: no approved image yet
- Cascadex: no approved image yet

Sprite task rule:

- Only create/refresh sprites for characters with approved images.
- If no character image exists yet, leave the sprite task in backlog and do not invent the sprite design.
- Smeargle may infer simplified pixel proportions, color blocking, silhouette, and UI poses from approved images, but should preserve the sprite’s core visual identity.
- Sprite outputs should include at minimum: roster/avatar sprite, small chat icon, Ability card icon, and inactive/working/completed state variants when practical.

### Ripple art notes

Ripple now has two approved image references:

- `Ripple.png` — calm/focused trend-map pose.
- `ripple_talking_cute.jpg` — brighter, open-mouth talking expression.

Sprite implications:

- Preserve jellyfish silhouette: translucent aqua dome, long flowing tendrils, friendly blue eyes.
- Use aqua/cyan highlights, deep teal linework, white sparkle/bubble accents.
- Give Ripple UI affordances around trend currents, holographic map panels, and “breaking trend” signals.
- Talking/active state can use the cheerful open-mouth expression from `ripple_talking_cute.jpg`.

## Software Rollout / Dependency Strategy

This is now the first engineering priority. Art and sprite production should wait until the installer/runtime path is proven.

### Product requirement

A nontechnical user should experience the Sprites Gym as a **one-stop package**:

1. Download Sprites Gym.
2. Open/run the installer.
3. Paste an API key.
4. Pick a provider/model.
5. Installer automatically configures the Sprites Gym agents through OpenClaw.
6. Installer launches The Command Center UI.
7. User launches an Ability.

The user should **not** need to manually install/configure a pile of dependencies, edit environment files, understand OpenClaw internals, or run multiple terminal commands.

### Recommended technical direction

Build the rollout as an **installer/orchestrator first**, then build the app around that.

Decision: the commercial Sprites Gym package should ship with a bundled installer. Users should only go through Sprites Gym. They should not need to separately install Node, npm, OpenClaw, or command-line tools.

The installer should own:

- dependency detection
- bundled runtime startup
- OpenClaw availability check
- provider key capture/validation
- Sprites Gym agent creation/update
- local config generation
- Command Center launch
- health checks
- rollback/uninstall hooks

### Dependency posture

Prefer this order:

1. **Bundle what we can legally/practically bundle.**
   - App UI assets
   - Sprites Gym agent definitions
   - workflow templates
   - local config schema
   - launcher scripts

2. **Detect and install/fetch only what must be external.**
   - Node/OpenClaw runtime path, if not bundled
   - platform-specific launch helpers
   - optional local model integrations

3. **Avoid asking users to do manual setup.**
   - No “open terminal and run five commands” onboarding.
   - No environment-variable scavenger hunt.
   - No Kubernetes-shaped nonsense. Absolutely not. That is how joy goes to die.

### Installer architecture candidates

#### Candidate A — Desktop wrapper installer

A packaged desktop app/installer controls everything:

- ships The Command Center UI
- checks/installs/starts OpenClaw
- writes Sprites Gym config locally
- stores BYOK credentials securely if possible
- launches local webview/UI

Pros:
- closest to “download package, open, go”
- best user experience
- hides terminal complexity

Cons:
- more packaging complexity
- platform-specific testing required
- auto-update/uninstall needs real care

#### Candidate B — Local Node package installer

A package/CLI performs setup, then opens a local web UI:

- `water-gym setup`
- guided provider key flow
- creates OpenClaw agents
- starts Command Center

Pros:
- faster to prototype
- good stepping stone
- close to current OpenClaw/Pokecenter setup

Cons:
- still feels technical if exposed directly
- requires Node/npm unless bundled

#### Candidate C — Hybrid

Prototype as Candidate B, then wrap it in Candidate A.

Recommendation: **use Candidate C.** Build the deterministic setup engine first as a local Node orchestrator, then package it behind a bundled Sprites Gym installer. The Node script is internal plumbing; the final user-facing flow is a branded installer/app.

### First build target

Create a local **Sprites Gym Setup Orchestrator** that can run idempotently:

- Detect OpenClaw.
- Detect Node/runtime requirements.
- Ask for provider choice and API key.
- Validate the key with the selected provider.
- Create/update Marina + six sprite agents in OpenClaw.
- Write Sprites Gym config locally.
- Start/verify the Command Center route.
- Display a success/failure report.

Idempotent means running setup twice should update/check safely, not duplicate agents or corrupt config.

### Agent setup expectation

Installer should create/configure:

- Marina — Sprite Trainer / coordinator
- Ripple — Trend Monitor
- Tidebyte — SEO Optimizer
- Squink — Writer
- Waveform — Repurposer
- Torrentail — Analytics
- Cascadex — Scheduler

OpenClaw agent IDs should probably be lowercase stable IDs:

- `water-marina`
- `water-ripple`
- `water-tidebyte`
- `water-squink`
- `water-waveform`
- `water-torrentail`
- `water-cascadex`

Keep Gym-specific IDs namespaced to avoid colliding with the developer/coordinator agents in Pokecenter or with a user's existing local OpenClaw agents. Sprites Gym setup must add agents alongside existing OpenClaw config, not overwrite it. The dedicated Sprites Gym Command Center should read the Sprites Gym manifest/local config and show only Sprites Gym agents by default, not every local OpenClaw agent on the machine.

### Installer checklist

- [ ] Define target platforms for MVP installer: Windows first, then macOS/Linux later?
- [x] Decide whether OpenClaw is bundled, installed as dependency, or detected as prerequisite: final target is a bundled/bootstrapped installer so users only go through Sprites Gym.
- [x] Define local config path for Sprites Gym: `.water-gym/config.json` for package-local generated state.
- [x] Define OpenClaw config safety rule: backup existing `~/.openclaw/openclaw.json`, add namespaced agents alongside existing config, refuse workspace collisions.
- [ ] Define secure credential storage approach.
- [ ] Define agent manifest format.
- [ ] Define workflow/Ability manifest format.
- [ ] Create idempotent setup command.
- [ ] Create provider validation command.
- [x] Create OpenClaw agent creation/update command.
- [ ] Create Command Center launch command scoped to Sprites Gym agents only.
- [ ] Create health-check/report screen.
- [ ] Create bundled Windows installer proof-of-concept.
- [ ] Add rollback/uninstall notes.

### Delegation guidance

- **Digtrio** should own dependency/provider setup architecture, including bundled Node/OpenClaw bootstrap requirements.
- **Metagross** should implement the setup orchestrator and later the Windows installer proof-of-concept once health checks are stable.
- **Castform** should define the agent manifest and runtime wiring.
- **Smeargle** should pause heavy visual work until installer flow is proven, but can later design the setup wizard UI.
- **Mr. Mime** should review MVP install scope and avoid tier/feature creep.
- **Duskull** should QA setup by running it from a clean-ish environment and hunting failure cases.

### Recommended first coding checkpoint

Stop after this works locally on Ian's Windows machine:

1. `water-gym setup` or equivalent runs.
2. It detects OpenClaw.
3. It accepts a test provider/model configuration.
4. It creates/updates the seven Sprites Gym agents without duplicates.
5. It writes a local Sprites Gym config file.
6. It launches or verifies The Command Center UI.
7. It prints a readable setup report.

Do **not** build social integrations, auto-updates, marketplace, payment gates, or full workflow execution before this checkpoint.

## Sprites Gym Kickoff Checklist

### Source of truth

- [x] Existing marketing/static site inspected.
- [x] Foundation brief created.
- [x] Roster clarified: six sprites + Sprite Trainer Marina.
- [x] Marina image references identified.
- [x] Ripple image references identified.
- [ ] Tidebyte image reference added/confirmed.
- [ ] Remaining sprite image references added/confirmed.

### Design system

- [x] Current palette captured.
- [x] Current typography captured.
- [x] Pixel/GBA UI motifs captured.
- [x] Marina dialogue/onboarding pattern captured.
- [ ] Smeargle creates app UI design brief from this foundation.
- [ ] Smeargle creates sprite backlog from approved sprite images.

### Product architecture

- [x] Core Sprites Gym positioning captured.
- [x] Abilities list captured.
- [x] Pricing assumptions captured.
- [ ] Mr. Mime reviews MVP scope and tiering.
- [ ] Castform designs agent hierarchy/review loops.
- [ ] Unown expands Ability workflow specs.
- [ ] Digtrio designs BYOK/social/provider architecture.
- [ ] Kecleon reviews naming/lore/commercial safety.
- [ ] Meowth reviews pricing and unit economics.

### Build readiness checkpoint

Stop before production build until the following are complete:

- Smeargle UX/app brief
- Mr. Mime MVP scope confirmation
- Castform agent system map
- Unown first two Ability specs
- Digtrio BYOK setup path
- Approved sprite/art list for Marina and at least Ripple

## Immediate Next Use

Use this brief as input for:

- **Smeargle:** Command Center UX and visual system.
- **Mr. Mime:** Product boundary and tier review.
- **Castform:** Agent hierarchy and review loops.
- **Unown:** Detailed Ability workflow definitions.
- **Digtrio:** BYOK/social/provider architecture.
- **Kecleon:** Original ecosystem naming/lore pass.
- **Meowth:** Pricing/unit-economics review.
