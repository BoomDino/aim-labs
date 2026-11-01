# Progress log

## 2026-11-01 — first playable local trainer

### Completed
- Created offline browser trainer with Python launchers for Windows and Linux.
- Added perspective range, three respawning targets, pistol, muzzle flash,
  configurable crosshair, and hit feedback.
- Added 60-second sessions with pause/resume on mouse release and tab hiding.
- Added CS2 and Valorant yaw profiles, full-precision conversion, cm/360 readout,
  and raw-input request with labeled fallback.
- Added personal browser-local leaderboard with top 20 scores, accuracy, hits,
  player, sensitivity profile, and date. No fabricated leaderboard entries.
- Added settings persistence, input validation, safe text rendering, and storage
  failure handling.
- Preserved the previously requested automation module in `legacy/`; it is not
  part of the game's runtime or dependencies.
- Added README with setup, controls, scoring, sources and input limitations.

### Validation
- Four Node tests passed: rotation/conversion, ray/sphere hits, scoring, ranking.
- JavaScript syntax check and local HTTP response check passed.
- Chromium browser checks passed: sensitivity readout, pointer capture, pause,
  no JavaScript errors, and no horizontal overflow at 390px viewport width.
- Completed a session using browser virtual time; leaderboard save and reload passed.
- Published source to private GitHub repository `BoomDino/aim-labs` on `main`.

### Remaining before claiming complete cross-platform validation
- Run on an actual Windows computer and verify mouse capture and launcher.
- Measure physical cm/360 against CS2 and Valorant on both OSes. Mathematical
  scaling is implemented; perfect game parity is not yet established.
- Confirm raw-input behavior on each target browser/OS combination.

### Optional future work (not required for this simple local version)
- Other training modes, sound, and export/import of scores.
- Online leaderboard would require a backend, accounts, and score verification.
