# Testing strategy

## Principle

Automated tests protect only systems where the result is deterministic, a regression could silently damage many parts of the game, the behaviour can be checked without rendering or reproducing a complete race, and the test is cheaper to maintain than repeatedly checking the behaviour manually.

The objective is not coverage. It is preserving the small number of rules upon which the rest of the game depends. This is a deliberate 80/20 strategy: automated protection for rules and state transitions, plus human evaluation for the parts that make the game enjoyable. The suite should stay small enough that it accelerates development instead of becoming a second product we have to maintain.

## What we should automate

| System | Examples worth testing | Priority |
| --- | --- | --- |
| Race progression | Checkpoints, lap completion, finishing order, race state transitions | Essential |
| Road mathematics | Segment lookup, curves, slopes, lane boundaries, distance wrapping | Essential |
| Vehicle rules | Acceleration limits, braking, off-road penalties, damage calculations | Essential |
| Combat rules | Hit eligibility, cooldowns, damage, knockdown thresholds | Essential |
| Pickups and scoring | Pickup effects, score changes, duration and stacking rules | High |
| Input interpretation | Action mapping and simultaneous-key conflict rules | High |
| Deterministic spawning | Valid spawn positions, minimum distances, seeded generation | High |
| Save/config data | Serialization, defaults, version migration when introduced | Later |
| AI decisions | Only isolated deterministic decisions, not complete AI races | Selective |

These should mostly be fast unit tests operating on plain TypeScript functions and state objects, without starting Phaser, WebGL, audio, or the browser.

## What we should generally not automate

We avoid automated assertions for:

- Whether steering, drifting, or combat "feels good".
- Exact sprite positions across complete races.
- Animation appearance and timing nuances.
- Particle effects, screen shake, and camera composition.
- Pixel-perfect screenshots.
- Audio mixing and perceived synchronization.
- Complete AI races with large sequences of expected movements.
- Every possible interaction between gameplay systems.
- Phaser behaviour already covered by Phaser itself.
- Browser differences that are better detected with a short smoke test.

These areas are evaluated through playtesting. Tests attempting to formalize them become brittle and discourage balancing changes.

## Three-level approach

### 1. Deterministic unit tests

This is where most automation belongs. Gameplay rules are extracted into small functions or system classes that receive state and return a result:

```ts
const result = resolveAttack({
  attacker,
  target,
  attack,
  distance: 38,
  currentTime: 1200,
});
```

This architecture keeps important rules testable without forcing the whole game to become test-oriented.

- Supply a fixed time step explicitly.
- Inject a seeded random source only where reproducibility provides real value.
- Build small state fixtures rather than launching Phaser.
- Assert state transitions and emitted domain events.
- Include boundary cases: segment edges, equal progress, road limits, simultaneous collisions, finish crossings, recovery invulnerability.
- Add a regression test before fixing a reproducible deterministic bug.

Tests favour properties and invariants over long scripted scenarios:

- Speed never exceeds the effective maximum.
- Damage never becomes negative.
- A racer cannot finish without completing the required checkpoints.
- Spawns never appear outside valid road bounds.
- One pickup cannot be collected twice.
- An attack outside its range cannot hit.

Avoid asserting private methods or every intermediate floating-point value. Use tolerances where continuous math is involved and assert meaningful outcomes. Balance values should not be asserted exactly unless the value represents a genuine invariant.

### 2. Minimal browser smoke tests

Keep only a few end-to-end checks, split into two tiers.

**Boot tripwire (per change).** Fast, runs on every change in both engines via `pnpm test:e2e:boot`:

- The game boots and mounts a visible WebGL canvas.
- It reaches the menu and the debug probe is installed.
- Bound keys do not page-scroll.
- The boot-failure banner stays hidden on a successful boot.

This is the tripwire that catches a broken boot, a missing asset, or a Phaser/Vite regression before the next phase gate. It is the only browser smoke on the routine path.

**Full smoke (phase boundaries and before playable releases).** `pnpm test:e2e` runs every e2e spec in Chromium and Firefox:

- The game loads in Chromium.
- The game loads in Firefox.
- A race can be started.
- Both local players can be created and receive independent input.
- Pausing and returning to the menu do not crash.
- A race can reach its results state.

Playwright configuration must define both `chromium` and `firefox` projects. A passing Chromium test never substitutes for Firefox evidence. These checks verify that the application is functional, not that the gameplay is good.

### 3. Structured manual playtesting

Manual testing remains the primary validation method for:

- Control responsiveness.
- Sense of speed.
- Combat readability.
- Difficulty and traffic density.
- Shared-camera behaviour.
- Visual and audio quality.
- Keyboard ghosting and uncomfortable key combinations.
- Firefox/Chromium differences.
- Performance on representative hardware.

A short repeatable checklist provides more value than trying to encode these qualities into automated assertions.

## Practical 80/20 rules

- No coverage-percentage target.
- No test required merely because a function exists.
- New tests are added mainly for core rules or confirmed regressions.
- Every fixed deterministic gameplay bug normally receives a regression test.
- A test that frequently breaks during legitimate balancing changes should be simplified or removed.
- Balance values are not asserted exactly unless the value represents a genuine invariant.
- Browser tests remain few and coarse.
- Visual snapshot testing is not introduced initially.
- Performance uses occasional profiling and explicit budgets, not fragile timing assertions in the regular suite.

## Recommended release gate

Before merging routine changes:

- The deterministic core test suite passes.
- Type checking and build pass.
- The boot tripwire smoke passes in Chromium and Firefox (`pnpm test:e2e:boot`).
- The affected feature is manually tried when applicable.

`pnpm verify:change` runs this routine gate in a stable order. `pnpm verify` remains the full release gate, including the full browser smoke and preview-production smoke.

Before a playable release:

- Core test suite passes.
- Chromium and Firefox smoke checks pass.
- A complete two-player race is played manually.
- Controls, audio startup, pause/focus behaviour, and performance are checked.
- Any known problems are recorded rather than blocking the release for non-critical polish defects.

## Shared-keyboard laboratory

The input test screen should show every bound action and raw active `KeyboardEvent.code`, allow likely combinations to be held, flag binding conflicts, and clear visibly on focus loss. Test at least:

- Both players accelerating and steering in opposite directions.
- Both accelerating while either player attacks.
- Both steering while accelerating and one attacks.
- Pause and resume after held keys.
- Alt-tab or window blur while accelerating.
- Multiple physical keyboards if available.

Document failed combinations by keyboard model when known. Software cannot infer or repair a key signal the hardware never reports.