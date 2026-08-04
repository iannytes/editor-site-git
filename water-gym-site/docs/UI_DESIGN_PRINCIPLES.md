# Sprites Gym UI Design Principles

Audience: Smeargle/UI work, Marina coordination, future implementation agents.

## Core thesis

Sprites Gym should feel like a playful sprite-powered command center, but behave like a trustworthy local-first productivity app. Charm is the wrapper; clarity, safety, and control are the product.

Important theme rule: the base application is **not water-themed**. It should use a broad “Pokémon clone / monster-collecting gym” foundation that can host multiple Gym packs. Individual Gym packs may bring their own theme accents, sprites, colors, badges, and flavor, but those should be layered as separate theme packs over a neutral base UI.

## Principles to build by

### 1. Progressive disclosure over dashboard sprawl

Start each screen with the few choices users need right now. Hide advanced settings, logs, agent internals, and power-user controls behind explicit expansion.

Apply this to:

- Setup wizard: provider/model/key -> folder access -> agent setup -> done.
- Command Center: today's recommended actions first; advanced abilities in a secondary panel.
- Agent details: short role card first; prompts, logs, and config behind “details.”

Source: Nielsen Norman Group describes progressive disclosure as initially showing only key options and revealing specialized options on request, making complex apps easier to learn and less error-prone: https://www.nngroup.com/articles/progressive-disclosure/

### 2. Command Center is the only communication surface

The Command Center is the user’s one-stop shop. All communication with sprites/agents must route through the Command Center: user prompts, Ability launches, sprite questions, drafts, approval requests, errors, progress, and final output.

Design implications:

- Build first-class in-app chat/workflow surfaces, not bolt-on logs.
- Show sprite-to-sprite coordination when it helps the user trust the work.
- Keep questions and approvals in context with the Ability/task that caused them.
- Do not depend on Telegram, Discord, or external message surfaces for normal users.
- Local developer Mission Control comms are not production UX.
- Advanced/custom tiers may someday expose build-editing or custom integration hooks, but default product communication remains in-app.

### 3. Dashboard = decisions, not decoration

A dashboard should answer: “What needs my attention?” not “How much information can we fit?”

Use:

- One primary recommended next action.
- Small status summaries for agents.
- Clear task state: queued, running, needs approval, done, blocked.
- Ability cards grouped by user outcome, not internal agent architecture.

Avoid:

- Showing all logs by default.
- Exposing every agent metric on the home screen.
- Making users understand OpenClaw before they can use Sprites Gym.

### 4. Folder access must be explicit, reversible, and visible

Users should be able to drag folders into the app to grant Sprites Gym permission to look at/organize content outside its installed workspace.

UX requirements:

- Drop zone language: “Drop a folder to let Sprites Gym use it.”
- Show the exact folder path after drop.
- Explain what Sprites Gym can do: read/index/organize, and what requires approval before writing/moving/deleting.
- Provide remove/revoke buttons per folder.
- Keep an “Allowed Folders” panel in settings/onboarding.
- Never imply full-disk access.

Implementation direction:

- In Electron, use OS file/folder dialogs and drag/drop path handling from the desktop app shell.
- Store allowed paths in Sprites Gym local config/state.
- Treat dropped folders as an allowlist. Agents/tools only operate inside the folded-out workspace plus these explicitly granted paths.

Relevant references:

- MDN File System API: local file access capabilities and file management concepts: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
- Chrome/File System Access API docs emphasize user-granted local file/folder access: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access

### 5. Trust is a UI feature

Because Sprites Gym touches user content, safety has to be visible.

Patterns:

- “Preview before changes” for organization actions.
- Diff/summary before moving, renaming, deleting, or rewriting files.
- Default read-only indexing until user approves an action.
- Clear local/private language: where data lives, what gets sent to model providers, and what does not.
- Backup/undo path for file operations.

Local-first reference: Ink & Switch frames local-first software around user ownership, offline usefulness, privacy, preservation, and control: https://www.inkandswitch.com/essay/local-first/

### 6. Pokémon-clone foundation, not one-gym theming

The base UI should feel like a familiar monster-collecting/gym-management interface: party roster, badges, abilities, trainer guidance, routes/quests, and clear battle-card style status. It should **not** be hardcoded as a water UI, even if the first shipped Gym has water/sprite content.

Architecture direction:

- Base UI owns layout, navigation, accessibility, safety controls, installer flow, folder permissions, and shared interaction patterns.
- Gym packs own optional theme accents: palette, logo, badge, sprite roster art, ability icons, background motifs, and copy.
- A user may own multiple Gym packs. The app should be able to show multiple packs without clashing visual systems.
- Theme data should be declarative where possible: `themeId`, colors, assets, terminology overrides, and pack metadata.
- Safety-critical controls should remain visually consistent across all themes.

### 7. Game-inspired, not game-obscured

The GBA/sprite style should create warmth and identity, not hide controls.

Use game language where it maps cleanly:

- Ability = user-facing workflow.
- Party/Team = agents involved in an ability.
- Quest/Task = work item.
- Badge/Progress = setup/completion milestone.
- Command Center = dashboard.

Avoid game language for safety-critical controls:

- Use “Delete,” not “Release.”
- Use “Move files,” not “Surf.”
- Use “Grant folder access,” not “Open portal.”

### 8. Accessibility is non-negotiable

Retro UI often fails because it leans on tiny text, low contrast, color-only state, and decorative controls.

Baseline rules:

- Text must stay readable at mobile/tablet sizes.
- Color is never the only status indicator.
- Keyboard focus states must be obvious.
- Buttons must look clickable.
- Keep contrast high, especially on aqua/blue backgrounds.
- Animation should be optional/subtle.

References:

- W3C WAI design accessibility tips: https://www.w3.org/WAI/tips/designing/
- WebAIM contrast overview: https://webaim.org/articles/contrast/

### 9. Onboarding should end in a useful first win

The setup flow should not stop at “installed.” It should end with a small, safe result.

Ideal first-run flow:

1. Welcome to Sprites Gym.
2. Configure model/provider.
3. Install/repair agents.
4. Drag in a content folder or skip.
5. If folder provided: run read-only scan and show content inventory.
6. Recommend one first ability, e.g. “Create content calendar from this folder.”

## Smeargle UI checklist

Before shipping a screen, ask:

- Is the primary action obvious within 3 seconds?
- Can a nontechnical user continue without understanding OpenClaw?
- Can the user complete the whole agent communication loop inside Sprites Gym?
- Are advanced controls hidden until requested?
- Does every file/folder permission show exactly what was granted?
- Is there a safe preview before destructive or external actions?
- Does the playful styling clarify the workflow, or just decorate it?
- Is this styling part of the base app, or should it belong to a Gym theme pack?
- Can the screen be used with keyboard and high contrast?

## Immediate UI backlog

1. [x] Add an “Allowed Folders” onboarding/settings panel in the installer wizard.
2. [x] Add drag-and-drop folder zone in installer wizard.
3. [x] Persist allowed folders in `.water-gym/config.json` as `allowedFolders`.
4. [x] Add permission copy and revoke/remove controls.
5. [ ] Add read-only content inventory preview.
6. [ ] Build Ability cards around outcomes, not agent internals.
7. [ ] Add approval preview for file organization actions.
8. [ ] Enforce allowed-folder checks in every future file operation/agent tool.
9. [ ] Split base UI styling from Gym-pack theming so water/specific-pack visuals do not leak into the shared app shell.
10. [x] Build initial in-app The Command Center communication surface for persisted channels/messages/tasks.
11. [ ] Route real sprite runtime execution through The Command Center for prompts, progress, approvals, questions, and final outputs.
