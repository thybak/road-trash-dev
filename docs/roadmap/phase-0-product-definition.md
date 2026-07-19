# Phase 0 — Product definition

## Objective

Agree on a small game contract precise enough to implement and loose enough to tune through playtesting.

## Deliverables

- Review and accept or amend `docs/PHASE-0-GAME-CONTRACT.md`.
- Confirm co-op success and failure rules.
- Confirm shared-camera recovery philosophy.
- Confirm the minimum controls and first preset.
- Confirm the first track's target duration and restart flow.
- Identify what metrics or observations each later prototype must collect.

## Explicit non-goals

- Detailed campaign design.
- Final narrative, characters, balance, art direction, or monetization.
- Implementation beyond disposable experiments needed to answer a design question.

## Agent-ready task order

1. Convert every ambiguous rule in the contract into a proposed default or an explicit open question.
2. Check that success, failure, crash, recovery, separation, finish, and restart cannot contradict one another.
3. Walk through at least five paper scenarios: close finish, one trailing rider, simultaneous crash, timer expiry, and restart after focus loss.
4. Record accepted choices in `docs/DECISIONS.md`.

## Exit criterion

A one-page specification describes one complete race, and every first-playable mechanic maps to a later phase with no essential rule left undefined.

## Evidence log

- [x] Contract reviewed by the project owner.
- [x] Open questions accepted as playtest questions rather than hidden implementation choices.
- [x] Relevant decisions recorded.

## Closure note

Phase 0 is considered closed on 2026-07-19. The five paper scenarios required by the task order were walked against `docs/PHASE-0-GAME-CONTRACT.md`:

1. Close finish — both riders reach the line within the target duration; success rule and per-rider finish-time display are non-contradictory.
2. One trailing rider — biased-average shared camera keeps both visible in the 0–45 m band; trailing-rider catch-up is bounded by the separation table.
3. Simultaneous crash — each rider has independent `health`/`stunRemainingS`; recovery targets 1–2 s and is followed by brief invulnerability; no shared crash-coupling is implied.
4. Timer expiry — failure via team timer or shared recovery allowance; both are configurable and disabled for the earliest technical slices per the contract note. No rule overlap with success.
5. Restart after focus loss — the contract requires one-action restart without page reload; `ARCHITECTURE.md` already mandates scene-shutdown input clearing and a fresh session state on restart, which together cover post-focus-loss sticky keys.

No contradictions surfaced. The five open playtest questions in the contract remain unanswered by design; they will be resolved by Phase 3+ playtest evidence, not implementation convenience. Phase 1 may now begin.

