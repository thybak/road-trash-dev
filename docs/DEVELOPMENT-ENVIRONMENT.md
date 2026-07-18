# Development environment

## Decision

Use an Ubuntu 24.04 LTS Distrobox guest on the Fedora host, with rootless Podman as the container manager.

Ubuntu 24.04 is chosen because current Playwright supports it directly and supplies browser dependency installation for it. This reduces friction for automated Chromium and Firefox testing. Distrobox officially lists the Ubuntu 24.04 toolbox image as a tested guest. Alpine is intentionally avoided because Playwright's Firefox and WebKit builds depend on glibc.

The source tree remains in the Fedora user's home directory and is visible inside Distrobox. Runtime packages, pnpm, Node, Playwright browser binaries, and build dependencies are installed from inside the guest. Distrobox is integrated rather than strongly isolated, so do not treat it as a security sandbox.

## Host prerequisites on Fedora

```bash
sudo dnf install distrobox podman
podman info
```

Use rootless Podman. Do not run project package commands with `sudo`.

## Create the box

```bash
distrobox create \
  --name road-trash-dev \
  --image quay.io/toolbx/ubuntu-toolbox:24.04

distrobox enter road-trash-dev
```

Using a versioned image tag is intentional. Avoid `latest`, which can change the environment unexpectedly.

## Install base tools inside the box

```bash
sudo apt update
sudo apt install -y \
  build-essential \
  ca-certificates \
  curl \
  git \
  unzip \
  xz-utils
```

Install Node 24 LTS with a user-scoped version manager such as `fnm` or `mise`; do not use Ubuntu's potentially older Node package for the project. Record the exact Node release in `.node-version` once the repository is scaffolded.

After Node is available, install and activate the pnpm version declared by the repository. Prefer Corepack when supplied by that Node distribution:

```bash
corepack enable
corepack install
pnpm --version
```

If Corepack is not present, install the exact pnpm version named in `package.json` using pnpm's documented standalone installer or a trusted user-scoped method, then verify it. Do not silently use an arbitrary global pnpm version.

## Project version pins

The scaffolded repository should contain:

```text
.node-version             exact Node 24.x release
package.json              "packageManager": "pnpm@<exact-version>"
pnpm-lock.yaml            committed
```

Use exact versions for Phaser and the package manager. Use deliberate dependency updates through a dedicated change with test evidence.

## First install

From the project directory inside Distrobox:

```bash
pnpm install
pnpm exec playwright install --with-deps chromium firefox
pnpm verify
```

`playwright install --with-deps` changes the guest only. Run it again after a Playwright upgrade if its browser revision changes.

## Run the game

```bash
pnpm dev --host 0.0.0.0
```

Open the printed local URL in Firefox or Chromium on the Fedora desktop. Distrobox normally shares host networking, display integration, and the home directory, so no port publishing should be required.

Use the host's real Firefox for manual compatibility checks in addition to Playwright's bundled Firefox build. Playwright's Firefox is patched for automation and is not identical to the user's stable Firefox package.

## OpenCode placement

The cleanest dependency boundary is to install and run OpenCode inside `road-trash-dev` so its shell tools naturally use the container's Node and pnpm. Personal credentials and configuration require normal care because Distrobox shares the home directory.

From the repository root, OpenCode automatically loads the committed `AGENTS.md`. The project may later add `opencode.json` with an `instructions` array if automatic loading of multiple documentation files is worth the added context; the current `AGENTS.md` instead instructs agents to read only the documents relevant to a task.

## Updating or recreating the environment

- Prefer rebuilding a box over accumulating undocumented manual fixes.
- When a new system package is required, add it to this document in the same change.
- Keep project-generated dependencies out of Git (`node_modules`, Playwright reports, builds, coverage).
- To prove reproducibility, periodically create a second temporary box from this document and run `pnpm install --frozen-lockfile` plus `pnpm verify`.

## Troubleshooting checkpoints

| Symptom | First check |
| --- | --- |
| Vite is unreachable | Start with `--host 0.0.0.0` and inspect the printed address |
| Headed browser fails | Confirm Distrobox display/session integration; run headless tests first |
| Browser libraries missing | Re-run the pinned Playwright install with `--with-deps` |
| Files owned by root | Stop using `sudo` for pnpm, Node, or project commands |
| Stale key behaviour | Test window focus and visibility handling; it is usually application input state |
| SELinux denial | Inspect the denial before changing policy; do not disable SELinux globally |

## References

- [Distrobox compatibility and tested guest images](https://distrobox.it/compatibility/)
- [Playwright installation and supported operating systems](https://playwright.dev/docs/intro)
- [Playwright browser installation](https://playwright.dev/docs/browsers)
- [pnpm installation](https://pnpm.io/installation)
- [OpenCode project rules](https://opencode.ai/docs/rules/)

