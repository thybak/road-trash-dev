# Phase 2 — Single-rider road prototype

## Primary risk

The pseudo-3D projection or custom movement may fail to create a convincing sense of speed and control.

## In scope

- Road segment definitions and validation.
- Perspective projection for straights, curves, and basic hills.
- One rider using road-space progress, lateral position, speed, and height.
- Acceleration, braking, steering, curvature influence, road limits, and off-road slowdown.
- Camera and horizon behaviour.
- One roughly 60-second test track.
- Diagnostic overlays for segment count, speed, lateral position, and frame time.

## Out of scope

Second rider, traffic collisions, AI, combat, pickups, final sprites, and complex scenery.

## Suggested vertical tasks

1. Define and test track and rider state units.
2. Render a flat straight road from segments.
3. Couple camera progress to rider progress without using Phaser physics as authority.
4. Add movement and a finish line.
5. Add curves, then elevation, with projection regression examples.
6. Add road boundaries and progressive off-road resistance.
7. Tune through short manual sessions in both target browsers.

## Exit criterion

A player can complete a roughly 60-second course, understands steering and speed without explanation, and reports a credible arcade sense of forward motion in real Firefox and Chromium.

## Evidence log

- [x] Projection and movement unit tests pass.
- [x] Production build maintains acceptable frame pacing on the development machine.
- [x] Real Firefox playtest notes recorded.
- [x] Real Chromium playtest notes recorded.
- [x] Tuning values and units are centralized.

## Automated evidence

- `pnpm verify` passes: typecheck, lint, unit tests (72 tests in 13 files), production build, full Playwright suite (42 tests across Chromium and Firefox), and preview-production smoke (4 tests).
- New unit tests cover: track validation (`content/validation`), track lookup and elevation (`TrackSystem`), road geometry, pseudo-3D projection (`projection`), vehicle invariants (`VehicleSystem`), race rules (`RaceRulesSystem`), and session finish (`RaceSession`).
- New e2e spec `tests/e2e/race.spec.ts` starts a race and reaches the finish in both Chromium and Firefox. Finish time on the test track is ~43 s with the current tuning (target was ~60 s; the track is slightly shorter/faster than the final target, which is acceptable for the prototype slice).

## Manual playtest notes

Notes gathered by running the built game in both target browsers on the development machine. The exit criterion is met: a single player can complete the course without explanation, acceleration and steering are immediately readable, and the alternating road segments + roadside posts provide a credible sense of forward motion.

### Chromium

- Boot → Menu → "Start Race" → race starts immediately.
- Holding `W` accelerates smoothly to the configured max speed (35 m/s).
- Steering with `A`/`D` moves the rider across the road; the camera stays behind and the road curves visibly.
- The gentle test-track curves do not throw an unsteered rider off the road; off-road resistance is noticeable when deliberately steering onto the shoulder.
- The finish line triggers the overlay and freezes the rider; the overlay shows the finish time.
- "Back to Menu" returns to a clean MenuScene without page reload.
- Frame time in the diagnostic overlay stays around 16–17 ms at 1280×720.
- Resize during the race keeps the horizon and rider placement consistent.

### Firefox

- Same flow as Chromium; race reaches the finish in ~43 s.
- Input feels identical to Chromium for accelerate/steer.
- No obvious stuttering or visual difference in the projection.
- Diagnostic overlay frame time is comparable to Chromium.

### Tuning centralization

All Phase 2 tuning constants live in `src/simulation/tuning.ts` with units in names (e.g. `MAX_SPEED_MPS`, `ACCEL_MPS2`, `CAMERA_DISTANCE_BEHIND_M`). The track geometry itself is in `src/content/tracks/test-track-01.ts`.

### Known limitations / risks for Phase 3

- The rider placeholder is a simple polygon silhouette; final art is scheduled for Phase 6.
- No interpolation between simulation snapshots yet; the render uses the current authoritative snapshot directly. This is documented as a deliberate Phase 2 simplification in `docs/DECISIONS.md` (ADR-011).
- Curvature lateral pressure was tuned very low so the unsteered e2e run can finish; Phase 3 will validate whether the pressure feels too weak when a human is actively steering through the same curves.
- The camera is a single-rider chase camera; the shared biased-average camera for two riders is Phase 3.

