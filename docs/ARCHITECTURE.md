# Architecture

## Design goal

Keep game rules deterministic, testable, and independent from Phaser while letting Phaser handle the browser-facing work it is good at: scenes, rendering, sprites, asset loading, audio plumbing, and low-level input events.

## Dependency direction

```text
app/scenes ───────────────┐
presentation ─────────────┼──> simulation API and snapshots
services/input ─> commands│
content ───────> validated│
                         simulation core
services/audio <── events │
services/storage <── state┘
```

The simulation core imports no Phaser, DOM, Web Audio, storage, or wall-clock APIs.

## Proposed source layout

```text
src/
├── app/
│   ├── game-config.ts
│   └── scenes/
├── content/
│   ├── schemas/
│   ├── tracks/
│   └── repository.ts
├── presentation/
│   ├── road/
│   ├── riders/
│   ├── effects/
│   ├── camera/
│   └── hud/
├── services/
│   ├── input/
│   ├── audio/
│   ├── settings/
│   └── storage/
└── simulation/
    ├── model/
    ├── commands/
    ├── systems/
    ├── events/
    ├── session/
    └── math/
```

## Authoritative model

```ts
interface RiderState {
  id: string;
  progressM: number;
  lateral: number;
  speedMps: number;
  heightM: number;
  health: number;
  stunRemainingS: number;
  attackCooldownRemainingS: number;
}

interface PlayerCommand {
  accelerate: boolean;
  brake: boolean;
  steer: -1 | 0 | 1;
  attackPressed: boolean;
}
```

Use units in names when ambiguity is plausible. Avoid embedding presentation fields such as sprite scale or screen coordinates in authoritative state.

## Track model

The track is an ordered sequence of road segments. A segment carries geometry and references to content; it does not contain live Phaser objects.

```ts
interface RoadSegmentDefinition {
  lengthM: number;
  curvature: number;
  elevationDeltaM: number;
  halfWidthM: number;
  surfaceId: string;
  scenery: readonly SceneryPlacement[];
  hazards: readonly HazardPlacement[];
}
```

Validate positive lengths and widths, known content identifiers, legal placement ranges, and total track length when loading content.

## Simulation step

The authoritative step is `1 / 60` second:

1. Sample player and AI commands.
2. Apply acceleration, braking, steering, curvature, traction, and off-road resistance.
3. Resolve road-space collisions.
4. Resolve attack state and hit windows.
5. Apply race rules and separation rules.
6. Emit ordered gameplay events.
7. Publish the new immutable-or-logically-isolated snapshot for presentation.

Keep previous and current presentation snapshots so rendering can interpolate. Never feed interpolated values back into simulation.

## Systems

| System | Responsibility | Must not own |
| --- | --- | --- |
| Vehicle | Kinematic movement and traction | Keyboard bindings or sprites |
| Track | Segment lookup and road properties | Projection to pixels |
| Collision | Road-space overlap and resolution | Sound or particles |
| Combat | Attack state, targeting, hits, damage | Animation playback |
| AI | Producing rider commands | Alternative vehicle physics |
| Race rules | Start, finish, timer, team outcome | Results-scene rendering |
| Separation | Assistance, warnings, safe recovery | HUD widgets |

Use a stable system order because collision and combat outcomes may depend on it. Test that order through observable state, not private implementation details.

## Events and side effects

Simulation events are facts that already happened, for example:

```text
RiderHit
RiderCrashed
BikeCollision
PickupCollected
SeparationBandChanged
RiderRecovered
RaceFinished
```

Events carry identifiers and simulation values, not Phaser objects. Audio, particles, camera shake, HUD messages, and analytics-like debug counters consume them after the step.

## Input boundary

The keyboard service tracks `KeyboardEvent.code` values and derives per-frame action states. It must:

- Distinguish pressed, held, and released.
- Clear state on `blur`, visibility loss, scene shutdown, and binding changes.
- Prevent default browser behaviour only for active gameplay bindings.
- Detect binding conflicts.
- Support a test screen that visualizes simultaneous codes.

The command mapper is the only layer that converts bindings into `PlayerCommand`.

## Scene responsibilities

| Scene | Responsibility |
| --- | --- |
| Boot | Minimal configuration and failure-safe startup |
| Preload | Asset loading and visible progress/error state |
| Menu | Start gesture, settings, bindings, input laboratory |
| Race | Own session lifetime, call simulation, present snapshots |
| Results | Show outcome and start a clean restart |

Scene transitions must dispose listeners and clear input. Restart creates a new session state rather than partially resetting the old one.

## Persistence

Wrap `localStorage` with a versioned schema and safe defaults. Corrupt, missing, or newer-than-supported data must not prevent the game from starting. Persist settings, bindings, progress, and scores separately so one invalid category can be reset without erasing all data.

## Future compatibility

This architecture makes replay, split-screen, and possible networking less costly, but none should be implemented early. Determinism is a debugging and testing benefit now; it is not a commitment to online multiplayer.

