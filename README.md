# Aim Labs — Local Range

A small, original aim trainer inspired by Gridshot. No affiliation with Aimlabs,
Valve, or Riot. Runs offline after downloading; bundled frontend dependencies and model assets, no
accounts, or external requests.

## Play

Install Python 3.9+ and a current desktop browser (Chrome or Edge recommended).

- **Windows:** double-click `start.bat`, or run `py -3 run.py`.
- **Linux:** run `./start.sh`, or `python3 run.py`.
- Open http://127.0.0.1:8765 if the browser does not open automatically.
- Stop the local server with Ctrl+C. Use `python run.py --port 8766` if busy.

Enter your player name, sensitivity scale, in-game sensitivity, and actual mouse
DPI. Click **Enter the range** to capture the mouse. Shoot with left click; Esc
pauses and releases the cursor. Resume using the button. Settings stay locked
during a session to keep results consistent. Complete 30 seconds to save a score.

## Features

- Three perspective-projected targets; new target appears after each hit.
- Imported, textured Glock FBX model and original chrome cybernetic hand,
  muzzle flash, recoil, crosshair color, and hit marker.
- CS2 / CS:GO and Valorant hip-fire sensitivity profiles.
- Score, accuracy, hits, countdown, pause/resume, and personal top-20 leaderboard.
- Local browser persistence for settings and completed sessions.

Score = round(hits × 100 × accuracy fraction). Misses reduce the score.
Leaderboard ties use accuracy, then the earlier session. Records belong to the
browser profile and origin (including port). They are not global, synced, or
cheat-resistant. Clearing browser storage removes them.

## Sensitivity: exact formula, platform-dependent input

Rotation in degrees = mouse delta × sensitivity × yaw.

| Profile | Yaw (degrees/count at sensitivity 1) | Reference field of view |
| --- | --- | --- |
| CS2 / CS:GO | 0.022 | 90° horizontal at 4:3 |
| Valorant | 0.07 | 103° horizontal at 16:9 |

Conversion uses the full ratio `oldSensitivity * oldYaw / newYaw`, without a
rounded 3.18 multiplier. `cm/360 = 360 * 2.54 / (DPI * sensitivity * yaw)`.
DPI only informs the distance readout; it does not multiply input a second time.
These profiles assume default yaw/pitch, hip fire, no acceleration, and unchanged
hardware DPI. Scoped sensitivity and stretched resolutions are not simulated.
The renderer maintains the profile's vertical FOV as the canvas aspect changes.

The app requests `unadjustedMovement` through Pointer Lock. If rejected as
unsupported it falls back to ordinary pointer input and labels that state.
An accepted request is not hardware calibration; some browsers ignore options.
Browser/OS mouse deltas, scaling, and acceleration may prevent an exact physical
match. **Perfect parity with the actual games has not been verified.** Compare a
measured mouse-pad 360° turn against the selected game before relying on it.

Sources:
- [KovaaK developer announcement: Valorant 0.07 yaw](https://store.steampowered.com/news/posts/?appids=824270&enddate=1596483651&feed=steam_community_announcements)
- [Valve Source SDK input implementation](https://github.com/ValveSoftware/source-sdk-2013/blob/master/src/game/client/in_mouse.cpp)
- [MDN Pointer Lock API and raw-input limitations](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API)

## Development

Runtime: Python standard library plus browser Canvas 2D / WebGL2 / ES modules. Optional
Node.js runs the math tests with `npm test`; no npm install needed to play.
The bundled Three.js renderer and FBXLoader run offline. To rebuild after editing
`src/`, run `npm ci` then `npm run build` (modern Node.js required).

- `web/app.js`: rendering, input, session lifecycle, browser storage and UI.
- `src/viewmodel.js`: WebGL gun/hand renderer and FBX loading.
- `src/hand.js`: original cybernetic hand mesh.
- `web/viewmodel.js`: generated offline renderer bundle; do not edit directly.
- `web/assets/glock/`: supplied model, textures, credits and license.
- `web/core.js`: sensitivity math, ray/sphere hits, scoring and ranking.
- `run.py`: loopback-only static file server for `web/`.
- `tests/`: deterministic game logic tests.
- `PROGRESS_LOG.md`: completed work, validation, and remaining verification.

The earlier desktop automation prototype is preserved under `legacy/` for
reference. It is not imported by or required for this game.

This branch uses targets with radius 0.72 (50% larger than the original 0.48).
Its 30-second leaderboard has a separate storage key so previous 60-second
scores remain intact and are not ranked alongside the shorter sessions.

## Glock viewmodel

The supplied Glock FBX and textures replace the previous procedural Malorian.
The original cybernetic hand is retained. Three.js renders the viewmodel with
real depth testing, texture mapping and lighting; hand polygons are batched by
material. All required assets are bundled for offline play on Linux and Windows.
A browser with WebGL2 support is required. The renderer bundle is generated from
`src/`; this avoids loading dependencies from a CDN.

Model by **Creazilla.com**. See [model credits](web/assets/glock/CREDITS.md) and
[original license](web/assets/glock/license.txt). Three.js MIT license is included
in `web/vendor/THREE-LICENSE.txt` (bundle also retains third-party notices).

The hand remains a reference-guided fan recreation, not an official game asset.
