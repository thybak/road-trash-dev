# Road Trash project pack

This documentation pack turns the initial game-development plan into a working contract for humans and AI coding agents.

## Start here

1. Read [`AGENTS.md`](AGENTS.md) for the repository workflow.
2. Read [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md) for non-negotiable product and engineering rules.
3. Read [`docs/PHASE-0-GAME-CONTRACT.md`](docs/PHASE-0-GAME-CONTRACT.md) for the first playable design contract.
4. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) before changing simulation boundaries.
5. Follow [`docs/DEVELOPMENT-ENVIRONMENT.md`](docs/DEVELOPMENT-ENVIRONMENT.md) to create the Fedora-hosted Distrobox environment.
6. Select work from [`docs/roadmap/README.md`](docs/roadmap/README.md).

## Document roles

| Document | Purpose | Change frequency |
| --- | --- | --- |
| `AGENTS.md` | Concise operational instructions loaded by OpenCode | Occasionally |
| `docs/CONSTITUTION.md` | Stable constraints and quality gates | Rarely, deliberately |
| `docs/PHASE-0-GAME-CONTRACT.md` | Testable definition of one complete race | During discovery |
| `docs/ARCHITECTURE.md` | System boundaries and data flow | When design changes |
| `docs/DEVELOPMENT-ENVIRONMENT.md` | Reproducible container setup | When tooling changes |
| `docs/TESTING.md` | Verification strategy and browser matrix | As risks are discovered |
| `docs/DECISIONS.md` | Lightweight architectural decision log | Whenever a material decision is made |
| `docs/roadmap/phase-*.md` | Candidate scope and exit criteria for each phase | Frequently |

## Working principle

The roadmap is a hypothesis, not a promise. Complete one thin, playable increment at a time. Do not advance a phase merely because its code exists: its exit criterion must be demonstrated in Firefox and Chromium when browser behaviour is involved.

## Suggested repository shape

```text
road-trash/
├── AGENTS.md
├── README.md
├── docs/
│   ├── CONSTITUTION.md
│   ├── PHASE-0-GAME-CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT-ENVIRONMENT.md
│   ├── TESTING.md
│   ├── DECISIONS.md
│   └── roadmap/
├── public/assets/
├── src/
│   ├── app/
│   ├── content/
│   ├── presentation/
│   ├── services/
│   └── simulation/
├── tests/
│   ├── e2e/
│   └── unit/
├── package.json
├── pnpm-lock.yaml
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

