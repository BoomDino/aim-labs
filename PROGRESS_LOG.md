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

## 2026-11-01 — Silverhand variant (`feature/silverhand-30s`)

### Completed
- Replaced the flat gun drawing with an original stylized 3D Malorian-inspired
  pistol and chrome cybernetic hand/forearm, as approved by the user.
- Added model-space polygon geometry, perspective, face lighting, depth sorting,
  idle sway, recoil and muzzle flash. No downloaded game assets or dependencies.
- Increased target radius from 0.48 to 0.72 (50% larger); rendering, hit detection
  and spawn spacing use the same shared radius constant.
- Changed rounds and UI to 30 seconds using a shared session constant.
- Isolated the 30-second leaderboard from the original 60-second records.
- Updated README and tested the expanded hit boundary.

### Validation
- All four logic tests pass.
- Chromium verified 30-second HUD, mouse capture, mesh rendering and pause.
- Browser virtual-time test completed the shortened round and verified score
  persistence across reload. No browser JavaScript errors in the visual check.
- Inspected the rendered gun/hand and adjusted pose to keep the crosshair clear.

### Remaining
- Actual Windows and physical sensitivity verification from the first milestone
  still apply. The model is intentionally stylized, not the official game asset.

## 2026-11-01 — reference-guided model refinement

- Rebuilt the gun geometry with beveled lofted surfaces, a rear breech cylinder,
  muzzle recesses, sights, machined grooves, trigger guard, and perforated grip.
- Rebuilt the hand with curled segmented digits, joint pins, fitted palm armor,
  wrist actuators, tapered forearm shielding and exposed crimson tendons.
- Added chrome highlights and adjusted the pose to reveal more arm detail.
- Used the supplied artbook image and an alternate gun image; direct wiki access
  was blocked. Reference images are not copied into the repository.
- Browser mesh rendering/mouse capture check and four game logic tests passed.
- Remaining visual limitations: this is a procedural fan recreation, not a 100%
  replica. Exact sculpt, textures, markings and production rig are not available.

## 2026-11-01 — imported Glock model

- Loaded the supplied `Glock.FBX` and albedo/normal textures from Downloads.
- Replaced procedural Malorian geometry; retained and fitted the cybernetic hand.
- Added a bundled Three.js/FBXLoader WebGL renderer with depth testing, local
  textures, recoil, muzzle flash and offline loading. Batched hand faces by material.
- Added source files and reproducible renderer build command with pinned versions.
- Preserved Creazilla's source license and redistribution credit.
- Browser verified FBX/textures load and render without JavaScript errors.
- Remaining: actual Windows test and physical sensitivity calibration still apply.
