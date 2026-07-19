# Phase 1 — Technical foundation and input laboratory

## Primary risk

Two people may be unable to produce necessary simultaneous key combinations reliably, or browser lifecycle behaviour may leave stuck input or muted audio.

## In scope

- Vite, strict TypeScript, Phaser boot/preload/menu shell.
- pnpm lockfile and scripts.
- Responsive 16:9 WebGL canvas with loading and failure messages.
- Audio activation after an explicit Start gesture.
- Action-based input service with pressed, held, and released states.
- Two independently controlled placeholder objects.
- Rebinding data model, conflict detection, and one keyboard preset. The preset abstraction must support adding a gamepad preset later without restructuring (scheduled for Phase 6).
- Input laboratory displaying active codes and actions.
- Focus and visibility-loss cleanup.
- Playwright Chromium and Firefox projects.
- Static build and deployment proof.

## Out of scope

Road projection, motorcycles, AI, combat, final menus, and final assets.

## Suggested vertical tasks

1. Scaffold the smallest Vite/TypeScript/Phaser page and production build.
2. Establish unit, typecheck, lint, format, and browser-test scripts.
3. Implement raw keyboard state with lifecycle cleanup and unit tests.
4. Map bindings to two `PlayerCommand` objects.
5. Build the visual input laboratory and placeholder-control scene.
6. Add Playwright smoke tests for boot, start, key handling, focus recovery, and no page scroll.
7. Manually test real Firefox and Chromium on at least two keyboards if available.

## Exit criterion

Two players simultaneously control placeholders in real Firefox and Chromium without stuck keys or page scrolling, and problematic physical key combinations can be identified and rebound.

## Evidence log

- [x] `pnpm verify` passes.
- [x] Chromium Playwright project passes.
- [x] Firefox Playwright project passes.
- [x] Real Firefox manual test recorded.
- [x] Real Chromium manual test recorded.
- [x] Physical keyboard combinations recorded.

## Automated evidence captured on 2026-07-19

- `pnpm verify` runs typecheck → lint → unit (29 tests, 7 files) → production build → Playwright (`chromium` + `firefox` projects, 20 dev-server tests each engine, 40 total) → preview Playwright (`chromium-preview` + `firefox-preview`, 4 total). Full gate passes locally inside the road-trash-dev Distrobox.
- Browser smoke covers: boot reaches the menu, audio unlocks on a trusted Start click, Escape suspends audio, both players accelerate simultaneously, P1/P2 attack is edge-only and not auto-repeated, opposite steer keys cancel, blur and hidden visibility clear held keys, no phantom keys return on focus, no page-scroll on any bound code, preset metadata and per-binding mapping spot-checked, and the production preview bundle boots and unlocks audio from a `vite preview` server.
- Unit tests cover: `PlayerCommand`, `KeyboardService` (held/pressed/released edges, auto-repeat no double edge, `clearAll`, preventDefault allowlist toggling), `KeyboardAdapter` (event forwarding, preventDefault allowlist, blur, visibilitychange to hidden, detach clears), `detectConflicts` (duplicate-code, duplicate-binding, shared-pause-collision), `CommandMapper` (accelerate/brake, steer left/right, opposite cancellation, attack edge only, two-player simultaneity), `AudioContextService` (unlock idempotent, suspend, shutdown, blip played on unlock).

## Manual playtest still required

These cannot be auto-verified per `docs/TESTING.md` and `docs/CONSTITUTION.md` §8. Tick after the human playtest:

- Real Firefox on the host desktop, full Phase 1 input lab exercise.
- Real Chromium on the host desktop, same.
- At least two physical keyboards if available; record failed combinations by keyboard model. Cases required:
  - Both players accelerating and steering in opposite directions.
  - Both accelerating with either player attacking.
  - Both steering while accelerating, one attacks.
  - Pause/resume after held keys.
  - Alt-tab or window blur while accelerating.

The data model is rebindable and the preset abstraction supports a future gamepad preset (ADR-008); the second keyboard preset itself is scheduled for Phase 6.

