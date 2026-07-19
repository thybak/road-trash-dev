# Decision log

Use this lightweight format for material choices. Append entries; do not rewrite history to make an earlier decision look inevitable. If a decision changes, add a new entry that supersedes it.

## ADR-001 — Use a pseudo-3D segmented road

- Status: accepted
- Date: 2026-07-19
- Decision: Render a perspective road from 2D segments and use sprite-based actors and scenery.
- Reason: It targets the desired arcade speed and traffic-weaving experience without the art and engine cost of full 3D.
- Consequences: Projection is custom; collision and gameplay use road space rather than screen-space physics.

## ADR-002 — Use Phaser with a framework-independent simulation

- Status: accepted
- Date: 2026-07-19
- Decision: Use Phaser 4.2.1 for browser presentation and services, while pure TypeScript state and systems remain authoritative.
- Reason: Phaser supplies useful 2D game infrastructure, while separation keeps rules testable and protects the design from renderer coupling.
- Consequences: Adapters and snapshot presentation add some structure; Phaser sprites cannot contain authoritative rules.

## ADR-003 — Shared camera for the MVP

- Status: accepted provisionally
- Date: 2026-07-19
- Decision: Begin with one camera following both riders, soft catch-up bands, and safe recovery at extreme separation.
- Reason: It preserves a shared co-op experience and avoids rendering and HUD duplication.
- Consequences: Separation tuning is a major Phase 3 risk. Split-screen remains a fallback only after playtest evidence.

## ADR-004 — Shared keyboard is first-class

- Status: accepted
- Date: 2026-07-19
- Decision: Two players must be playable on one keyboard, with action abstraction, rebinding, preset layouts, and an input laboratory.
- Reason: This is part of the product identity, not an optional input mode.
- Consequences: The first control set stays small. Physical ghosting must be measured; later gamepad support may complement but not replace it.

## ADR-005 — Use pnpm

- Status: accepted
- Date: 2026-07-19
- Decision: Use pnpm with a committed lockfile and an exact `packageManager` version.
- Reason: User preference, efficient dependency storage, and reproducible package-manager selection.
- Consequences: Agent instructions and scripts must use pnpm consistently; npm lockfiles must not be committed.

## ADR-006 — Develop in Ubuntu 24.04 Distrobox

- Status: accepted
- Date: 2026-07-19
- Decision: Use the versioned Ubuntu 24.04 toolbox image under rootless Podman on Fedora.
- Reason: It is a Distrobox-tested guest and a directly supported Playwright platform, minimizing browser dependency friction.
- Consequences: The project gains a clean dependency boundary but not a security boundary because Distrobox integrates the home directory and desktop session.

## ADR-007 — Use Mise for Node, Corepack for pnpm inside the Distrobox

- Status: accepted
- Date: 2026-07-19
- Decision: Pin Node 24 via `.mise.toml` and `.node-version` (exact patch release) and let mise manage Node inside the box. Activate pnpm from `package.json#packageManager` via Corepack (`corepack enable && corepack install`).
- Reason: Developer preference for mise as the unified Node version manager across hosts, combined with the existing `DEVELOPMENT-ENVIRONMENT.md` guidance to prefer Corepack for pnpm so the pnpm version stays coupled to the committed `package.json`.
- Consequences: `.mise.toml` and `.node-version` must stay in sync for the same Node version. Upgrading pnpm means editing `packageManager` and re-running `corepack install`, not a global install. The bootstrap script relies on both tools being present in the box (mise auto-installs itself; Corepack ships with Node 24).

## ADR-008 — Phase 1 ships one keyboard preset; gamepad preset deferred to Phase 6

- Status: accepted
- Date: 2026-07-19
- Decision: Phase 1 implements a single keyboard preset matching the Phase 0 contract defaults. The `BindingPreset` type carries a `deviceKind: "keyboard" | "gamepad"` discriminator so a gamepad preset can be added without restructuring the binding abstraction. The gamepad preset itself is scheduled for Phase 6.
- Reason: Phase 0 explicitly confirmed the "first preset" as a Phase 0 deliverable. The constitution §7 promises multiple presets and gamepad as "a later compatibility improvement, not a substitute for validating shared-keyboard play," so deferring the second preset to Phase 6 preserves both. Validating shared-keyboard simultaneity (Phase 1's primary risk) does not require a second preset.
- Consequences: Phase 1's exit criterion is met by data-model rebindability plus conflict detection plus the input laboratory, recorded in the Phase 1 evidence log. The constitution §7 wording is honored by deferral rather than amended. The Phase 6 roadmap gains a "Gamepad support" in-scope bullet and an associated task.

## ADR-009 — Phase 1 placeholder presenter is intentionally non-authoritative

- Status: accepted
- Date: 2026-07-19
- Decision: The placeholder presenter that moves two on-screen rectangles from `PlayerCommand` input in Phase 1 is disposable presentation code. It does not introduce `RiderState`, emits no simulation events, and may be replaced wholesale in Phase 2.
- Reason: Phase 1 validates shared-keyboard reliability, not gameplay truth. Building a partial authoritative state now risks the lab accidentally looking like simulation truth before the Vehicle system and `RiderState` exist in Phase 2.
- Consequences: Phase 2 introduces real `RiderState`, the Vehicle system, and a snapshot-based presenter, removing or rewriting `PlaceholderPresenter` without ceremony. Reviewers must not treat Phase 1 placeholder positions as authoritative state.

## ADR-010 — Routine changes run only the deterministic core suite; browser smoke moves to phase/release gating

- Status: accepted
- Date: 2026-07-19
- Decision: The default per-change merge gate runs formatting/linting, TypeScript type checking, the deterministic core (unit) test suite, and the production build. Playwright smoke tests across Chromium and Firefox, plus structured manual playtesting, run at phase boundaries and before playable releases rather than on every change.
- Reason: The MVP's primary regression risk is the small set of deterministic gameplay rules and state transitions. A small focused suite protects them. Running the full browser smoke and playtest matrix on every small change added noise and slowed iteration without catching proportionate defects, since rendering, audio, and game feel are validated through manual playtests anyway.
- Consequences: Constitution §8's routine gate is softened to core tests, type checks, build, and a quick manual try of the affected feature. `TESTING.md` documents the two-tier gate (routine vs release) and the 80/20 testing strategy. Smoke and manual playtest evidence still must be recorded before a phase exits or a release ships. Supersedes the per-change smoke wording previously in §8 only.

### Refinement 2026-07-19 — A boot tripwire rejoins the per-change gate

- Decision: A small, fast boot-only smoke (`pnpm test:e2e:boot`, the existing `tests/e2e/boot.spec.ts`) is added back to the per-change gate, running in Chromium and Firefox alongside the core suite, type checks, and build.
- Reason: Dropping all per-change browser coverage left no early signal when a change broke boot, asset loading, or Phaser/Vite integration. The boot tripwire is the cheapest deterministic-ish browser check and catches the regressions most likely to be silent until a phase gate.
- Consequences: Constitution §8 routine gate now lists the boot tripwire explicitly. `TESTING.md` splits browser smoke into "Boot tripwire (per change)" and "Full smoke (phase/release)". `package.json` gains `test:e2e:boot` and `verify:change`. The heavier smoke (`pnpm test:e2e`) and preview-production smoke (`pnpm test:e2e:preview`) still run only at phase/release gates via `pnpm verify`.

## ADR-011 — Phase 2 pseudo-3D road prototype scope and simplifications

- Status: accepted
- Date: 2026-07-19
- Decision: Phase 2 implements a single-rider pseudo-3D road slice using a fixed 60 Hz simulation, a current-snapshot renderer (no interpolation), a single chase camera, and a finish-line overlay only. Two riders, traffic, AI, combat, pickups, results scene, pause flow, and final art are explicitly deferred.
- Reason: The Phase 2 primary risk is whether the projection and movement feel convincing, so the slice must be the smallest vertical cut that answers that question. A single rider removes shared-camera and separation risk (Phase 3). Skipping interpolation avoids extra state history and alpha blending before the core feel is judged. A finish-line overlay (not a results scene) is enough to demonstrate a completable course.
- Consequences: `RaceSession` owns one `RiderState`; the renderer draws the current authoritative snapshot; the camera follows the single rider. `Phase 2` evidence is recorded in `docs/roadmap/phase-2-road-prototype.md`. Phase 3 will add the second rider, shared biased-average camera, separation rules, collisions, pause, and a proper results/restart flow. Phase 6 will add final art and interpolation if playtest evidence justifies it.

## ADR template

```markdown
## ADR-NNN — Short title

- Status: proposed | accepted | superseded
- Date: YYYY-MM-DD
- Decision: What is being chosen?
- Reason: Why does this best satisfy current constraints?
- Consequences: What costs, risks, and follow-up work result?
- Supersedes: ADR-NNN, if applicable
```

