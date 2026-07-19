# Road Trash constitution

Status: candidate v0.1  
Last reviewed: 2026-07-19

This file contains the project's stable product and engineering rules. It outranks roadmap convenience. A change requires a conscious decision, a reason, and an entry in `DECISIONS.md`.

## 1. Product identity

Road Trash is an original 2.5D arcade motorcycle action game for two people sharing one desktop computer. Its core promise is immediate co-operative racing: maintain speed, weave through hazards, stay together, and use readable close-range attacks.

It may be inspired by the broad arcade-road-combat genre, but it must not reproduce protected names, characters, artwork, audio, track layouts, dialogue, or other expressive content from Road Rash or any other game.

## 2. First-class player experience

- One desktop browser tab.
- Two local human players sharing one keyboard.
- A complete start, race, result, and restart loop.
- A shared behind-the-riders camera in the first playable version.
- Short sessions and arcade responsiveness over simulation realism.
- Clear feedback for acceleration, danger, collision, attacks, damage, separation, recovery, and finish state.

The game must remain understandable with placeholder graphics. Art polish cannot compensate for unclear mechanics.

## 3. Supported platform contract

The supported baseline is current modern desktop Firefox and Chromium with WebGL enabled. Linux is a first-class development and test platform; Windows browser testing is added before public release.

The project does not promise:

- Canvas-renderer visual parity.
- WebGPU support.
- Mobile or touch controls.
- Safari support in the initial phases.
- Compatibility with every keyboard's physical rollover limitations.

Audio begins only after a user gesture. Focus loss clears held input. Bound gameplay keys must not scroll the page.

## 4. Scope discipline

Work proceeds through the roadmap exit criteria. Until explicitly admitted into an active phase, exclude:

- Online multiplayer, networking, servers, accounts, telemetry services, or cloud saves.
- Shops, currencies, campaigns, skill trees, or persistent character progression.
- Realistic rigid-body motorcycle physics.
- Multiple weapons or a large content catalogue.
- Procedural worlds, complex narrative, mobile controls, WebGPU-only effects, and final-quality art.

When a feature does not validate the current phase's primary risk, defer it.

## 5. Architectural invariants

1. Framework-independent TypeScript state is authoritative.
2. Phaser presents state and collects platform input; it does not own gameplay truth.
3. The simulation advances at a fixed 60 Hz step.
4. Movement, traffic overlap, combat range, and race rules use road-space coordinates.
5. Rendering is allowed to interpolate but not to mutate authoritative state.
6. Human and AI riders pass commands through the same vehicle rules.
7. Side effects consume emitted gameplay events after simulation decisions.
8. Content is data-driven and validated at load boundaries.
9. Randomness that affects gameplay must be seedable and injected.
10. Browser APIs live behind small services so pure simulation tests do not need a DOM or Phaser.

## 6. Technology baseline

| Area | Baseline |
| --- | --- |
| Language | TypeScript with strict mode |
| Game framework | Phaser 4.2.1, exact pin |
| Renderer | WebGL through Phaser |
| Build and dev server | Vite |
| Package manager | pnpm with a committed lockfile and pinned `packageManager` |
| Unit tests | Vitest |
| Browser tests | Playwright projects for Chromium and Firefox |
| Persistence | `localStorage` behind a versioned storage service |
| Development OS | Ubuntu 24.04 LTS Distrobox guest on a Fedora host |
| Deployment | Static hosting |

Dependencies are added for demonstrated needs. Phaser upgrades are deliberate: read release notes, create a dedicated change, and run both browser projects before merging.

## 7. Input and accessibility baseline

- Consume `KeyboardEvent.code` through a binding layer.
- Expose actions such as accelerate, brake, steer, attack, and special.
- Track pressed, held, and released states without depending on repeated `keydown` events.
- Provide rebinding, conflict detection, multiple presets, and a simultaneous-key test screen.
- Keep the minimum viable control set small to mitigate keyboard ghosting.
- Provide settings for volume, controls, camera shake, flashes or intense effects where introduced.

Gamepad support is a later compatibility improvement, not a substitute for validating shared-keyboard play.

## 8. Quality gates

Every change must be proportionately verified. The default merge gate is:

- Formatting and linting pass.
- TypeScript type checking passes.
- The deterministic core test suite passes.
- Production build succeeds.
- The boot tripwire smoke (`pnpm test:e2e:boot`) passes in Chromium and Firefox.
- The affected feature is manually tried when applicable.

The broader Playwright smoke beyond boot, plus structured manual playtesting for feel, readability, shared-camera comfort, and physical key combinations, runs at phase boundaries and before playable releases rather than on every change.

A phase completes only when its exit criterion is demonstrated, not when its checklist is merely implemented.

## 9. Performance principles

- Target smooth 60 fps gameplay on an ordinary recent integrated-GPU desktop, then measure on actual hardware.
- Avoid per-frame allocation in hot simulation and render loops where practical.
- Pool or cap effects that can grow without bound.
- Define budgets for visible road segments, actors, particles, texture memory, draw calls, and audio voices during Phase 7.
- Profile before performing complex optimization.

## 10. Documentation and decisions

- `AGENTS.md` stays concise and operational.
- This constitution explains stable constraints.
- `ARCHITECTURE.md` explains boundaries and data flow.
- Roadmap documents describe candidate work and evidence.
- `DECISIONS.md` records important choices and their consequences.

If code and documentation disagree, stop and resolve the disagreement rather than silently choosing one.

