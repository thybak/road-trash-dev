# Road Trash agent instructions

Road Trash is a desktop-browser, local two-player, 2.5D arcade motorcycle game. It uses a pseudo-3D segmented road, sprite-based actors, and a custom deterministic kinematic simulation.

## Mandatory context

Before planning or implementing a task:

1. Read `docs/CONSTITUTION.md`.
2. Read the active phase document under `docs/roadmap/`.
3. Read `docs/ARCHITECTURE.md` when touching simulation, rendering, input, scenes, events, or persistence.
4. Read `docs/TESTING.md` when changing observable behaviour.
5. Check `docs/DECISIONS.md` before revisiting a settled architectural choice.

If the active phase is not stated, infer it from completed exit criteria and confirm the smallest next slice. Do not implement later-phase features merely because they are easy to add.

## Product constraints

- Target modern desktop Firefox and Chromium with WebGL enabled.
- Support two simultaneous local players on one keyboard from the first prototype.
- Keep the shared camera for the MVP; split-screen is a later fallback only.
- Use original placeholder or original final assets. Do not copy Road Rash names, art, audio, tracks, or characters.
- Exclude online multiplayer, accounts, backend services, mobile controls, progression systems, and final art until explicitly scheduled.

## Technical constraints

- TypeScript strict mode.
- Phaser `4.2.1`, pinned exactly until an explicit upgrade decision is recorded.
- Vite, pnpm, Vitest, and Playwright.
- Run project tooling inside the Distrobox environment described in `docs/DEVELOPMENT-ENVIRONMENT.md`.
- The authoritative game state is framework-independent TypeScript data, never Phaser sprites or physics bodies.
- Simulation uses a fixed 60 Hz step. Rendering may interpolate but must not change simulation outcomes.
- Core movement, collision, combat, and AI operate in road-space coordinates.
- Gameplay code consumes abstract player commands, not raw key codes.
- Content definitions must be data-driven and validated at their boundary.

## Working method

For each task:

1. State the relevant acceptance criterion and the files likely to change.
2. Inspect existing code and tests before editing.
3. Implement the smallest vertical change that satisfies the criterion.
4. Add or update tests at the lowest useful level.
5. Run focused checks, then the broader gate appropriate to the change.
6. Report what changed, evidence of verification, and remaining risks.

Do not claim browser compatibility from unit tests. Do not claim gameplay feel from automated tests; mark manual playtest requirements explicitly.

## Commands

Use repository scripts rather than invoking tools ad hoc. Once the project is scaffolded, maintain these scripts:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm verify
```

`pnpm verify` should run the normal local quality gate in a stable order. Browser-specific debugging may use focused Playwright projects, for example `pnpm exec playwright test --project=firefox`.

## Change discipline

- Preserve separation between simulation and presentation.
- Avoid speculative abstractions and dependencies.
- Never weaken or delete a failing test only to make the suite pass.
- Keep tuning constants named, centralized, and documented with units.
- Record material, hard-to-reverse decisions in `docs/DECISIONS.md`.
- Update the active phase checklist and evidence when an exit criterion is demonstrated.
- Ask before expanding scope beyond the active phase.

