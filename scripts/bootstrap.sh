#!/usr/bin/env bash
# Bootstraps a reproducible Distrobox development environment for Road Trash.
#
# Creates (if absent) an Ubuntu 24.04 Distrobox named `road-trash-dev`, installs
# mise + Node 24 and activates pnpm via Corepack, installs the repo's
# dependencies, installs Playwright browsers with system deps, and runs
# `pnpm verify` as a final validation.
#
# Safe to re-run: existing boxes, mise installs, and corepack activations are
# not torn down or recreated.
#
# See docs/DEVELOPMENT-ENVIRONMENT.md for the underlying contract.

set -euo pipefail

BOX_NAME="road-trash-dev"
IMAGE="quay.io/toolbx/ubuntu-toolbox:24.04"
NODE_VERSION="24.18.0"
PNPM_VERSION="11.15.0"
PLAYWRIGHT_BROWSERS="chromium firefox"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

color() { printf '\033[%sm%s\033[0m' "$1" "$2"; }
info()  { printf '%s %s\n' "$(color '1;34' '[bootstrap]')" "$*"; }
ok()    { printf '%s %s\n' "$(color '1;32' '[bootstrap]')" "$*"; }
err()   { printf '%s %s\n' "$(color '1;31' '[bootstrap]')" "$*" >&2; }

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "host prerequisite missing: $1"
    err "install with: sudo dnf install $1"
    exit 1
  fi
}

require distrobox
require podman

info "checking host prerequisites"
if ! podman info >/dev/null 2>&1; then
  err "podman info failed; ensure rootless podman is set up on the host."
  exit 1
fi

info "checking for existing box: $BOX_NAME"
if distrobox list --no-heading 2>/dev/null | awk '{print $2}' | grep -qx "$BOX_NAME"; then
  ok "box already exists; reusing it"
else
  info "pulling image $IMAGE (non-interactive)"
  podman pull "$IMAGE" >/dev/null
  info "creating box $BOX_NAME from $IMAGE"
  distrobox create --name "$BOX_NAME" --image "$IMAGE"
  ok "box created"
fi

info "provisioning inside $BOX_NAME"

INNER_SCRIPT=$(cat <<'INNER'
set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"

REPO_DIR="__REPO_DIR__"
NODE_VERSION="__NODE_VERSION__"
PNPM_VERSION="__PNPM_VERSION__"
PLAYWRIGHT_BROWSERS="__PLAYWRIGHT_BROWSERS__"

cd "$REPO_DIR"

echo "[inner] apt base tools"
sudo apt-get update
sudo apt-get install -y \
  build-essential \
  ca-certificates \
  curl \
  git \
  unzip \
  xz-utils

echo "[inner] mise"
if ! command -v mise >/dev/null 2>&1; then
  curl -L https://mise.run | sh
fi
export PATH="$HOME/.local/bin:$PATH"
mise trust "$REPO_DIR"
mise install

set +u
. <(mise env -s bash)
set -u

echo "[inner] node: $(node --version)"

if ! command -v corepack >/dev/null 2>&1; then
  echo "[inner] corepack missing; aborting" >&2
  exit 1
fi
corepack enable
corepack install
echo "[inner] pnpm: $(pnpm --version)"

if [ -f pnpm-lock.yaml ]; then
  echo "[inner] pnpm install --frozen-lockfile"
  pnpm install --frozen-lockfile
else
  echo "[inner] pnpm install (no lockfile yet)"
  pnpm install
fi

echo "[inner] playwright install --with-deps $PLAYWRIGHT_BROWSERS"
pnpm exec playwright install --with-deps $PLAYWRIGHT_BROWSERS

echo "[inner] pnpm verify"
pnpm verify
INNER
)

INNER_SCRIPT="${INNER_SCRIPT//__REPO_DIR__/$REPO_DIR}"
INNER_SCRIPT="${INNER_SCRIPT//__NODE_VERSION__/$NODE_VERSION}"
INNER_SCRIPT="${INNER_SCRIPT//__PNPM_VERSION__/$PNPM_VERSION}"
INNER_SCRIPT="${INNER_SCRIPT//__PLAYWRIGHT_BROWSERS__/$PLAYWRIGHT_BROWSERS}"

distrobox-enter --name "$BOX_NAME" -- bash -lc "$INNER_SCRIPT"

ok "environment ready"
printf '%s\n' "  next: distrobox enter $BOX_NAME"
printf '%s\n' "  then: pnpm dev"
printf '%s\n' "  open the printed URL in Firefox or Chromium on the Fedora desktop."