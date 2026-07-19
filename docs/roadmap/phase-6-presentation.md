# Phase 6 — Presentation and game feel

## Primary risk

Mechanically valid systems may still feel disconnected or fail to communicate their state.

## In scope

- Original riders, motorcycles, environments, and coherent placeholder-to-production asset replacement.
- Sprite animation and depth ordering.
- Engine pitch linked to simulated speed.
- Impact, road, wind, and ambience audio.
- Bounded particles, controlled shake, hit pause, and brief slow motion where useful.
- Menus, results, settings, control rebinding, and effects options.
- Audio suspension/resume and persistence hardening.
- Gamepad support as a second input preset behind the existing binding abstraction, complementing the shared-keyboard baseline.

## Out of scope

Large campaign, multiple progression systems, expensive content breadth, and effects that compromise readability or browser targets.

## Suggested vertical tasks

1. Establish a small original visual and audio style guide.
2. Replace assets one gameplay role at a time while retaining debug shapes.
3. Drive feedback from gameplay events rather than embedding rules in animation callbacks.
4. Add audio mixing and lifecycle handling.
5. Add effects conservatively with user controls and hard caps.
6. Complete menu, settings, results, and failure-state presentation.
7. Run accessibility, readability, and sensory-comfort passes.
8. Add a gamepad preset behind the existing binding abstraction and Playwright-cover its commands without weakening the shared-keyboard baseline.

## Exit criterion

The vertical slice feels like one coherent game, and players understand critical state without relying on debug overlays.

## Evidence log

- [ ] All included assets are original or appropriately licensed and attributed.
- [ ] Audio starts, suspends, and resumes correctly in both target browsers.
- [ ] Screen-effects settings work and persist safely.
- [ ] Presentation playtest notes recorded.
- [ ] Gamepad preset plays alongside the keyboard preset in both target browsers, with shared-keyboard play still passing its Phase 1 evidence.

