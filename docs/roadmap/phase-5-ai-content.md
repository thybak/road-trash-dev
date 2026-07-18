# Phase 5 — AI and content system

## Primary risk

The game may work once but lack sufficient variation and maintainable content authoring for repeated sessions.

## In scope

- AI commands for steering, overtaking, avoidance, defense, and aggression.
- The same vehicle rules for AI and humans.
- Seeded randomness for repeatable scenarios.
- Obstacles and one pickup type.
- Validated data definitions for tracks, bikes, riders, opponents, and attacks.
- Difficulty presets expressed through data.
- Debug tools to reproduce a seed and inspect AI intent.

## Out of scope

Machine-learning AI, procedural world generation, large content catalogues, progression, and final balance.

## Suggested vertical tasks

1. Add AI that follows the road using `PlayerCommand` equivalents.
2. Add deterministic avoidance and overtaking scenarios.
3. Add aggression and attack decisions with cooldown discipline.
4. Introduce schema validation and actionable content errors.
5. Add one obstacle and one pickup end-to-end.
6. Create difficulty presets by tuning perception and decision parameters rather than alternate physics.
7. Run repeated seeded sessions and fix degenerate behaviours.

## Exit criterion

The game produces repeatable three-to-five-minute sessions with enough traffic, opponent, obstacle, and pickup variation to remain engaging across several consecutive plays.

## Evidence log

- [ ] Seeded AI scenarios pass.
- [ ] Invalid content fails safely with useful errors.
- [ ] AI and humans share movement rules.
- [ ] Repeated-session playtest observations recorded.

