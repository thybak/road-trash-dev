# Testing strategy

## Principle

Test rules at the lowest reliable layer and user-visible integration in real browser engines. Automated tests prove consistency; playtests evaluate feel and physical keyboard behaviour.

## Test layers

| Layer | Tool | Examples |
| --- | --- | --- |
| Pure unit | Vitest | Kinematics, segment lookup, collisions, hit windows, race rules, seeded AI |
| Contract/integration | Vitest | System order, content validation, event emission, storage migrations |
| Browser smoke | Playwright | Boot, start gesture, focus recovery, two-player inputs, race/restart loop |
| Visual diagnostics | Playwright screenshots selectively | Projection regressions and HUD ownership, with cautious baselines |
| Manual playtest | Real Firefox/Chromium and physical keyboards | Ghosting, camera comfort, combat readability, game feel, audio |

## Deterministic simulation tests

- Supply a fixed time step explicitly.
- Inject a seeded random source.
- Build small state fixtures rather than launching Phaser.
- Assert state transitions and emitted domain events.
- Include boundary cases: segment edges, equal progress, road limits, simultaneous collisions, finish crossings, recovery invulnerability.
- Add regression tests before fixing a reproducible simulation bug.

Avoid asserting private methods or every intermediate floating-point value. Use tolerances where continuous math is involved and assert meaningful outcomes.

## Browser projects

Playwright configuration must define at least:

```text
chromium
firefox
```

Critical smoke tests run in both. A passing Chromium test never substitutes for Firefox evidence.

## Phase-specific gates

| Phase | Required evidence |
| --- | --- |
| 1 | Simultaneous placeholder controls, no page scroll, focus loss clears keys, audio starts after gesture, both browser projects pass |
| 2 | Unit tests for projection inputs and movement; manual 60-second course in both real browsers |
| 3 | Automated start–race–result–restart smoke; two-person camera and ghosting playtest |
| 4 | Deterministic hit-window tests; recorded playtest observations for readability at speed |
| 5 | Seeded AI scenarios and content-schema failure tests |
| 6 | Settings persistence, audio suspend/resume, effects settings, manual presentation QA |
| 7 | Full compatibility matrix, performance measurements, context-loss and low-end hardware checks |

## Shared-keyboard laboratory

The input test screen should show every bound action and raw active `KeyboardEvent.code`, allow likely combinations to be held, flag binding conflicts, and clear visibly on focus loss. Test at least:

- Both players accelerating and steering in opposite directions.
- Both accelerating while either player attacks.
- Both steering while accelerating and one attacks.
- Pause and resume after held keys.
- Alt-tab or window blur while accelerating.
- Multiple physical keyboards if available.

Document failed combinations by keyboard model when known. Software cannot infer or repair a key signal the hardware never reports.

## Performance measurement

Use production builds for representative measurements. Record browser, OS, hardware, resolution, actor count, visible segment count, and whether developer tools were open. Track frame-time distribution rather than only average fps; visible stutter can hide behind a good average.

## Definition of verified

A task report states:

- Commands run and whether they passed.
- Browser projects or real browsers exercised.
- Manual steps performed.
- Known gaps and untested conditions.

Never use “works cross-browser” when only one engine was run.

