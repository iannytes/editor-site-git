# Sprites Gym QA Matrix

Use this before calling an installer build consumer-ready.

## Install states

- **Clean machine / clean user profile**
  - No prior OpenClaw config.
  - No local Sprites Gym config.
  - Expected: installer opens, health screen shows bundled runtime status, setup can create namespaced `water-*` agents.

- **Existing OpenClaw install**
  - Existing unrelated agents/config.
  - Expected: setup backs up config, adds/updates only `water-*`, does not overwrite unrelated agents.

- **Partial Sprites Gym install**
  - Some `water-*` agents missing.
  - Expected: Install/Repair restores missing roster and keeps existing allowed folders.

- **Legacy Fluink state**
  - `water-fluink` exists, `water-squink` may or may not exist.
  - Expected: setup creates/updates `water-squink`; legacy `water-fluink` is left untouched until explicit migration/removal flow exists.

- **Missing runtime / offline machine**
  - Bundled OpenClaw runtime absent; npm/network unavailable.
  - Expected: health check flags runtime issue; setup fails clearly without corrupting config. Final product should prebundle runtime.

## Command Center comms

- Send message to Command Center.
  - Expected: routes to Marina, creates running task, stores output in Command Center only.

- Send message to a sprite channel.
  - Expected: routes to matching `water-*` sprite, uses stable internal session ID, stores output in selected channel.

- Runtime failure/timeout.
  - Expected: blocked task, clipped error message in Command Center, no external delivery.

- Approval marker.
  - Expected: `NEEDS_APPROVAL:` output renders as approval card/actions and task status `needs-approval`.

- Duplicate click/concurrent sends.
  - Expected: second send is rejected while sprite/ability is running in that channel.

## Folder permissions

- Add folder by dialog.
  - Expected: valid directory only, stored as read/user-granted.

- Drag/drop folder.
  - Expected: same validation as dialog; no file contents are read until inventory/ability requests.

- Revoke folder.
  - Expected: removed from allowlist and absent from later inventory scans.

- Inventory scan.
  - Expected: read-only summary, bounded depth/file count, ignores node_modules/.git/dist/state folders.

## Credential storage

- Secure storage available.
  - Expected: API key saves via Electron safeStorage, status says saved, key is never displayed back.

- Secure storage unavailable.
  - Expected: UI reports unavailable and refuses to save key.

- Clear key.
  - Expected: credential file removed; local config marks API key unconfigured.

## Packaging

- `npm run check`
- `npm run installer:dir:nosign`
- `npm run installer:pack:nosign`

Known warnings for prototype:

- `asar` disabled.
- `author` missing from package.json.
- Runtime is still not prebundled for final offline install behavior.
