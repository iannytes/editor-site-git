# Theme Architecture

Sprites Gym should treat visuals as layered theme packs, not hard-coded product identity.

## Product hierarchy

- **Sprites Gym**: product/ecosystem: installer, runtime, sprites, abilities, themes, and The Command Center.
- **The Command Center**: user-facing app/interface where all sprite communication happens.
- **Gym themes**: optional visual/content layers. Water Gym is one theme layer, not the base UI.

## Layers

1. **Base Command Center shell**
   - Neutral monster-collecting/gym language.
   - Provides layout, accessibility, task/status patterns, approval cards, roster, ability cards, logs/details drawers.
   - Must not depend on a specific gym type such as water.

2. **Product pack metadata**
   - Sprites, abilities, roles, trainer copy, manifest IDs.
   - Example: `water-gym.manifest.json` currently defines the first roster.

3. **Theme pack**
   - Color tokens, accent language, background effects, icons, sprite art, badges.
   - Can be swapped or combined when users own multiple packs.

## Theme file contract

Theme JSON should stay declarative:

```json
{
  "schema": "sprites-gym.theme.v0",
  "id": "sprites-gym-water",
  "name": "Sprites Gym: Water Theme",
  "extends": "base-command-center",
  "tokens": {
    "surface": "#0a1628",
    "accent": "#ffd700"
  },
  "assets": {
    "logo": "installer/assets/sprites-gym-logo.png"
  }
}
```

## Rules

- Never bake external communication lanes into a theme.
- Never make a theme responsible for runtime permissions or file access.
- Theme packs may style approval cards, but approval behavior belongs to The Command Center.
- Gym-specific words/colors/assets should be additive. Removing a Gym theme should leave a functional base Command Center.

## Current status

- Initial theme descriptors live in `installer/themes/`.
- The current installer UI still contains some water-styled CSS tokens; next UI cleanup should map those to neutral Command Center tokens and load Gym accents separately.
