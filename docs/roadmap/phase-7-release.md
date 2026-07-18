# Phase 7 — Compatibility, performance, and release

## Primary risk

The game may fail under different browser, focus, display, keyboard, driver, or low-performance conditions despite working on the main development setup.

## Compatibility matrix

- Firefox on Linux.
- Chromium on Linux.
- Firefox and Chrome on Windows when available.
- Multiple resolutions, device-pixel ratios, and display scaling settings.
- Several keyboard models and known ghosting combinations.
- Tab switching, window blur, and visibility changes.
- Audio suspension and recovery.
- WebGL context loss and restoration where feasible.
- Low-performance integrated graphics.

## Performance budgets to define

- Visible road segments.
- Active riders and traffic actors.
- Concurrent particles and effects.
- Texture memory.
- Draw calls.
- Simultaneous audio voices.
- Frame-time and long-frame thresholds on named test hardware.

## Suggested vertical tasks

1. Freeze a release-candidate content scope.
2. Define measurable budgets using a production build.
3. Add automated lifecycle and smoke coverage where stable.
4. Execute and record the manual compatibility matrix.
5. Profile representative worst cases and fix measured bottlenecks.
6. Verify clean install, frozen lockfile, build, static deployment, and rollback procedure.
7. Prepare release notes with known limitations and control guidance.

## Exit criterion

A clean environment produces a stable static release build; no critical browser-specific failures remain; measured performance meets the recorded budgets on target hardware; and the deployment is reproducible.

## Evidence log

- [ ] `pnpm install --frozen-lockfile` succeeds in a clean Distrobox.
- [ ] Full `pnpm verify` passes.
- [ ] Compatibility matrix completed.
- [ ] Performance report recorded.
- [ ] Static deployment smoke-tested from its real public path.
- [ ] Known limitations documented.

