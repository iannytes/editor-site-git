# Sprites Gym Software Rollout

_Last updated: 2026-05-09_

This is the first implementation pass for the Sprites Gym one-stop setup flow.

## Goal

A future user should be able to:

1. Download the Sprites Gym package.
2. Run/open setup.
3. Paste an API key.
4. Pick a provider/model.
5. Let setup create/configure the Sprites Gym agents in OpenClaw.
6. Open The Command Center.
7. Launch an Ability.

The MVP orchestrator is intentionally local and boring first. The commercial target is a bundled installer: users should only have to download/run the Sprites Gym installer, not separately install OpenClaw, Node, npm, or helper dependencies.

## Base app vs Gym-pack themes

The installer/downloader should be a reusable base app for multiple Gym packs. The base UI should use a broad Pokémon-clone / monster-collecting gym language, not a water theme. Specific Gym purchases can add theme packs: palette accents, logos, badges, sprite art, ability icons, flavor copy, and background motifs.

Rules:

- Shared installer, folder permissions, safety controls, health-check/repair, and navigation stay consistent across all packs.
- Gym-specific visuals live in pack/theme metadata and assets.
- Multiple installed packs should mesh in one app without visual conflict.
- Sprites Gym is the first pack/product, not proof that the whole base app should look water-themed.

## Command Center communication boundary

All user-agent communication must happen inside The Command Center.

Default product rule:

> No Telegram. No Discord. No external chat integrations. No scattered agent lanes. Sprites Gym is the one-stop shop.

Requirements:

- Every agent input starts from the app: Ability launch, direct sprite chat, trainer delegation, approvals, folder actions, and repair flows.
- Every agent output returns to the app: status, drafts, logs, questions, errors, approvals, and final deliverables.
- Agent-to-agent coordination should be visible in the Command Center when useful, not hidden in local Mission Control files.
- The local developer Mission Control comms are not the customer UX and should not be treated as production infrastructure.
- Provider/model/runtime details may be internal, but the user-facing collaboration loop must stay in-app.
- External message integrations are out of scope for the normal product.

Possible exception:

- A highest-paid/custom tier may allow users to edit/extend the build and code their own integrations. That is an advanced customization lane, not the default Sprites Gym product.

## Packaging decision

Sprites Gym should ship as a **one-stop installer**.

User-facing principle:

> Users install Sprites Gym. They do not install OpenClaw.

The installer should include or bootstrap everything required:

- bundled app/The Command Center UI
- embedded or bundled Node runtime if needed
- bundled setup engine
- OpenClaw install/bootstrap path
- Sprites Gym manifest, agents, and workflows
- local config/state directory
- provider key/model setup wizard
- launch shortcut
- uninstall/repair path

The existing Node setup script remains useful, but it should become an **internal setup engine** called by the packaged installer, not the main user experience.

Preferred packaging direction:

1. Keep building the setup engine as plain Node for now.
2. Add health-check/repair commands.
3. Wrap the setup engine in a desktop installer once stable.
4. The installer bundles or bootstraps Node + OpenClaw automatically.
5. The user only interacts with Sprites Gym branding/setup screens.

Installer candidates to evaluate later:

- Electron/Tauri desktop wrapper with bundled runtime.
- Platform installer builder such as NSIS/Wix/MSIX for Windows.
- Portable app bundle with embedded Node and local web UI.

Windows should be the first packaging target because current development and validation are on Ian's Windows machine.

## Current implementation

Files:

- `package.json` — npm scripts for setup/check commands.
- `water-gym.manifest.json` — Gym, agent, and Ability manifest.
- `scripts/water-gym-setup.mjs` — idempotent local setup orchestrator.
- `.water-gym/config.json` — generated local config; ignored by git.
- `.gitignore` — excludes local generated state and secrets.

## Commands

Dry run:

```bash
npm run setup:dry-run
```

Machine-readable dry run:

```bash
npm run check
```

Apply setup locally:

```bash
npm run setup:apply -- --skip-key-validation
```

Apply with provider/model:

```bash
npm run setup:apply -- --provider openai-codex --model openai-codex/gpt-5.5 --skip-key-validation
```

Apply and install OpenClaw if missing:

```bash
npm run setup:apply -- --install-openclaw --provider openai-codex --model openai-codex/gpt-5.5 --skip-key-validation
```

`--install-openclaw` runs `npm install -g openclaw` only in apply mode. Dry-run will never download packages.

Apply with an API key presence check:

```bash
WATER_GYM_API_KEY=your_key_here npm run setup:apply -- --provider openai --model gpt-5.1
```

Do not commit real keys. The current orchestrator does **not** write the raw API key into config.

## Existing OpenClaw config safety

Sprites Gym must behave as a guest in a user's existing OpenClaw install.

Rules:

- Never overwrite the user's existing OpenClaw configuration wholesale.
- Add Sprites Gym agents alongside existing agents using the dedicated `water-` namespace.
- Refuse to touch an existing `water-*` agent if its workspace does not match the Sprites Gym manifest. This prevents accidental takeover of an unrelated local agent with a colliding ID.
- Before apply-mode OpenClaw mutations, snapshot the user's existing `~/.openclaw/openclaw.json` into `.water-gym/backups/`.
- The Sprites Gym Command Center should scope itself to the Sprites Gym manifest/local config, not every local OpenClaw agent on the user's machine.

Dedicated Sprites Gym agent IDs:

- `water-marina`
- `water-ripple`
- `water-tidebyte`
- `water-squink`
- `water-waveform`
- `water-torrentail`
- `water-cascadex`

## What setup currently does

- Detects Node.
- Detects OpenClaw CLI.
- Can install OpenClaw when missing if explicitly run with `--install-openclaw` in apply mode.
- Validates that Sprites Gym agent IDs use the `water-` namespace.
- Backs up existing OpenClaw config before apply-mode mutations.
- Reads `water-gym.manifest.json`.
- Creates or updates Sprites Gym OpenClaw agents.
- Writes each agent workspace with starter `IDENTITY.md` and `AGENTS.md`.
- Sets OpenClaw identity metadata.
- Writes `.water-gym/config.json` with provider/model/agent/Ability metadata.
- Can optionally launch the static UI with `--launch-ui`.

## Agent IDs

The setup creates Gym-namespaced agents so they do not collide with Pokecenter's development/coordinator agents:

- `water-marina`
- `water-ripple`
- `water-tidebyte`
- `water-squink`
- `water-waveform`
- `water-torrentail`
- `water-cascadex`

## Current checkpoint status

Completed locally on Ian's Windows machine:

- [x] setup command exists
- [x] OpenClaw detection works
- [x] dry-run report works
- [x] local apply creates/updates Marina + six sprite agents
- [x] generated local config is written
- [x] setup is idempotent enough to resume after timeout/partial run
- [x] Sprites Gym agents use namespaced `water-*` IDs
- [x] setup refuses workspace mismatches for existing Sprites Gym IDs
- [x] setup backs up existing OpenClaw config before apply-mode changes
- [x] UI launch flag exists

Bundled installer POC files:

- `installer/main.cjs` — Electron main process; runs setup via Electron's bundled Node mode and bootstraps OpenClaw into app-local runtime when missing.
- `installer/preload.cjs` — safe IPC bridge for the wizard UI.
- `installer/wizard.html` — first Sprites Gym setup wizard UI.
- `package.json` — Electron/electron-builder scripts and NSIS packaging config.

Installer commands:

```bash
npm run installer:dev
npm run installer:dir
npm run installer:pack
npm run installer:dir:nosign
npm run installer:pack:nosign
```

POC behavior:

- Opens a Sprites Gym branded setup wizard.
- Can dry-run setup.
- Can install/repair Sprites Gym agents.
- Includes an initial The Command Center comms panel with persisted channels/messages/tasks.
- Lets users choose or drag/drop folders into an explicit Allowed Folders allowlist.
- Persists allowed folder paths in `.water-gym/config.json` with read access metadata and revoke support.
- Uses the setup engine internally.
- Attempts to bootstrap OpenClaw into Electron `userData/runtime` if bundled runtime is missing.
- Does not ask the user to manually run OpenClaw commands.

Important POC caveat: if the packaged app does not yet include a prebundled OpenClaw runtime, first-run bootstrap may still require npm/network access. Final packaging should prebundle the runtime so the user truly only goes through Sprites Gym.

Still pending:

- [ ] prebundle app-local OpenClaw runtime into installer resources
- [ ] bundle or install Node/npm runtime for setup/bootstrap paths that need it
- [ ] real provider API-key validation
- [ ] secure credential storage
- [x] packaged desktop wrapper POC scaffold
- [ ] packaged desktop wrapper production hardening
- [x] initial The Command Center comms data store and UI panel
- [ ] route real sprite runtime execution through The Command Center comms layer
- [ ] Command Center app integration scoped to Sprites Gym agents only
- [ ] clean uninstall/rollback command
- [ ] Duskull clean-environment QA
- [ ] model/provider routing beyond single-model MVP

## Known rough edges

- Setup currently shells out to OpenClaw once per agent operation, so a full apply can be slow.
- This is a prototype orchestrator, not yet a polished installer.
- Provider keys are intentionally not stored yet; secure storage needs a real decision.
- `--skip-key-validation` is acceptable for local plumbing tests only.

## Next engineering tasks

1. Add `--validate-provider` support for common providers without leaking keys.
2. Add a health-check command that verifies all Sprites Gym agents and config after setup.
3. Add a `water-gym launch`/Command Center entry point.
4. Decide whether the future app bundles OpenClaw or detects/installs it.
5. Have Duskull QA the setup from a clean-ish state.
