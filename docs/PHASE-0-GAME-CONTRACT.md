# Phase 0 game contract

Status: candidate for playtest-driven refinement

This is a deliberately small, testable definition of one complete Road Trash race. Numeric values are initial tuning hypotheses, not promises.

## One-sentence pitch

Two riders share a keyboard and camera, race together through traffic for roughly 60 seconds, and must both reach the finish while using a single close-range attack against AI opponents.

## Race contract

| Property | Candidate rule |
| --- | --- |
| Players | Exactly two local human riders for co-op mode |
| Duration | Target 60–90 seconds for the prototype; 3–5 minutes after content expansion |
| Start | Both riders spawn side-by-side after a visible countdown |
| Success | Both human riders cross the finish line |
| Failure | A configurable race timer expires before both finish, or the team exhausts its shared recovery allowance |
| Result | Show team outcome plus each rider's finish time, crashes, and hits landed |
| Restart | One action returns both players to a clean countdown without reloading the page |

For the earliest technical slices, the timer and recovery allowance may be disabled. They become authoritative in the Phase 3 complete race.

## Minimum controls

| Action | Player 1 default | Player 2 default | Semantics |
| --- | --- | --- | --- |
| Accelerate | `W` | `ArrowUp` | Held |
| Brake | `S` | `ArrowDown` | Held |
| Steer | `A` / `D` | `ArrowLeft` / `ArrowRight` | Held axis |
| Attack | `F` | `ShiftRight` | Pressed edge |
| Pause | `Escape` | Shared | Pressed edge |

`Special` is removed from the first playable control set. Add it only when a scheduled mechanic requires it; fewer simultaneous keys reduce ghosting risk.

## Shared-camera contract

The shared camera follows a biased average of the human riders' progress. Both riders remain visible during ordinary play.

Initial tuning bands, measured along the road:

| Separation | Candidate behaviour |
| --- | --- |
| 0–30 m | No assistance |
| 30–45 m | UI warning; mild trailing-rider acceleration assistance |
| 45–60 m | Stronger catch-up and small leader acceleration reduction |
| Over 60 m for 1 second | Safe trailing-rider recovery near the camera, with brief invulnerability |

These thresholds must be centralized as named tuning data. Phase 3 playtesting may change or replace them. The camera must not oscillate sharply when riders exchange the lead.

## Movement and crash contract

- Acceleration, braking, and steering should feel immediate and arcade-like.
- Curves create lateral pressure that the rider counters through steering.
- Leaving the road causes progressive slowdown and reduced traction.
- A normal collision costs speed and control briefly; it does not always cause a crash.
- A sufficiently strong impact or depleted health causes a crash.
- Recovery must be short enough to keep both players engaged; the initial target is 1–2 seconds before control resumes.
- A recovered rider receives brief collision invulnerability, visibly communicated.

## Combat contract

- One context-sensitive attack chooses the nearest valid side target.
- The attack has anticipation, a short active hit window, recovery, and cooldown.
- A valid hit requires overlap in progress and lateral range during the active window.
- Feedback must distinguish hit, miss, damage, stun, knockback, and crash.
- Friendly fire is disabled in the first vertical slice so co-op remains legible; revisit only as an explicit design decision.

## Content contract for the first vertical slice

- One track.
- Two human riders.
- Three AI opponents.
- One bike type.
- One attack.
- One obstacle type.
- One pickup type.
- Placeholder visuals and original temporary audio.
- Start, race, result, and restart flow.

## Presentation contract

- Desktop-first responsive 16:9 play area, letterboxed when necessary.
- Sprites and a segmented pseudo-3D road rendered through WebGL.
- Individual health and speed information that can be read without confusing ownership.
- Separation, finish, crash, invulnerability, and paused states are unmistakable.

## Questions that require playtesting

1. Is biased-average camera progress comfortable, or should it favor the trailing rider more strongly?
2. Are recovery teleports acceptable, or does an automatic rapid catch-up look and feel better?
3. Does team failure from a shared recovery allowance add useful stakes to a short arcade race?
4. Is `ShiftRight` reliable across the physical keyboards available for testing?
5. Should the attack automatically choose left or right, or should steering influence its side?

Record answers as decisions only after observing players, not from implementation convenience.

