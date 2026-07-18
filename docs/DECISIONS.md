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

