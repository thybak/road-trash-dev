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

