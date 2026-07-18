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

- [ ] Projection and movement unit tests pass.
- [ ] Production build maintains acceptable frame pacing on the development machine.
- [ ] Real Firefox playtest notes recorded.
- [ ] Real Chromium playtest notes recorded.
- [ ] Tuning values and units are centralized.

