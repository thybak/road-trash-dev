# Phase 3 — Co-op racing vertical slice

## Primary risk

A shared camera may become confusing or frustrating when riders separate.

## In scope

- Second human rider using the proven input abstraction.
- Shared biased-average camera.
- Separation bands, warnings, catch-up assistance, and safe recovery.
- Rider-to-rider and rider-to-traffic collisions.
- Three simple traffic or AI vehicles.
- Team start, finish, failure, results, restart, and pause flow.
- Clearly owned HUD information.

## Out of scope

Melee combat, sophisticated AI, multiple tracks or bikes, progression, and final art.

## Suggested vertical tasks

1. Render and simulate two riders with no leash.
2. Add camera smoothing and diagnostic separation display.
3. Introduce one separation band at a time and make thresholds data-driven.
4. Add basic actor overlap and collision responses.
5. Add complete race and clean session restart.
6. Add simple non-combat opponents or traffic.
7. Conduct two-person playtests focused on camera comfort and recovery fairness.

## Exit criterion

Two people can start, play, finish, view results, and restart one race using one keyboard. Separation is understandable, and most ordinary play does not trigger hard recovery.

## Decision gate

Retain the shared camera unless repeated observation shows frustration that tuning cannot resolve. Only then propose a split-screen experiment and record the decision.

## Evidence log

- [ ] End-to-end race loop passes in Chromium and Firefox projects.
- [ ] Two-person playtest completed.
- [ ] Camera threshold telemetry or observations recorded.
- [ ] Ghosting combinations retested with race controls.
- [ ] Shared-camera decision confirmed or revisited.

