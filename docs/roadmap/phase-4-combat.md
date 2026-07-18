# Phase 4 — Combat prototype

## Primary risk

Close-range combat may be unreadable or feel arbitrary at racing speed.

## In scope

- One context-sensitive side attack.
- Anticipation, active, recovery, and cooldown states.
- Road-space target selection and hit window.
- Damage, temporary stun, lateral knockback, and crash threshold.
- Short recovery and visible invulnerability.
- Hit, miss, stun, knockback, and crash feedback.
- AI targets sufficient to test the mechanic.

## Out of scope

Weapons, combos, directional attack buttons, skill trees, complex enemy archetypes, and friendly fire.

## Suggested vertical tasks

1. Implement and unit-test the attack state machine with no rendering.
2. Implement deterministic target selection and boundary cases.
3. Emit hit, miss, damage, and crash events.
4. Add minimal readable animation and audio feedback.
5. Tune at low speed, then normal race speed.
6. Playtest without explaining the hit rules; ask players to predict why attacks connected or missed.

## Exit criterion

Players intentionally hit adjacent opponents, can usually explain hits and misses, and recover without remaining disengaged for too long.

## Evidence log

- [ ] Attack and targeting unit tests pass.
- [ ] Simultaneous-event edge cases tested.
- [ ] Combat readability playtest notes recorded.
- [ ] Recovery time and invulnerability values documented.

