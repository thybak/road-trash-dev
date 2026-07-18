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
- Rebinding data model, conflict detection, and at least two presets.
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

- [ ] `pnpm verify` passes.
- [ ] Chromium Playwright project passes.
- [ ] Firefox Playwright project passes.
- [ ] Real Firefox manual test recorded.
- [ ] Real Chromium manual test recorded.
- [ ] Physical keyboard combinations recorded.

