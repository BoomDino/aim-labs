# Aim Labs — Local Range

A small, original aim trainer inspired by Gridshot. No affiliation with Aimlabs,
Valve, or Riot. Runs offline after downloading; bundled frontend dependencies and model assets, no
accounts, or external requests.

## Run locally on Windows, macOS, or Linux

You need **Python 3.9 or newer** and a desktop browser with **WebGL2** and
**Pointer Lock** support. No Python packages, Node.js, npm install, account, or
internet connection is needed to play once the project is downloaded.

### 1. Download the project

Download and extract the ZIP from the GitHub branch you want to use, or clone it:

```sh
git clone --branch feature/real-models https://github.com/BoomDino/aim-labs.git
cd aim-labs
```

If you downloaded a ZIP, open a terminal in the extracted folder containing
`run.py`. Keep the entire `web/` folder, including its model and texture assets.

### 2. Start the local server

**Windows (PowerShell or Command Prompt)**

Install Python from [python.org](https://www.python.org/downloads/) if needed;
enable **Add Python to PATH** during installation. Double-click `start.bat`, or run:

```powershell
py -3 run.py
```

If the `py` launcher is unavailable, use `python run.py` instead.

**macOS (Terminal)**

Install Python 3 from [python.org](https://www.python.org/downloads/) if
`python3 --version` is unavailable or older than 3.9. Run:

```sh
python3 run.py
```

**Linux (Terminal)**

Check `python3 --version`. If needed, install Python 3 through your distribution's
package manager (for example, `sudo apt install python3` on Debian/Ubuntu). Run:

```sh
python3 run.py
```

On macOS and Linux, `sh start.sh` also works, including when the extracted script
is not executable. Both launchers accept the same options as `run.py`.

### 3. Open and play

The server opens your default browser automatically. If it does not, visit
**http://127.0.0.1:8765**. Keep the terminal running while playing; press **Ctrl+C**
in that terminal to stop the server. The server listens only on your own computer.
Do not double-click `web/index.html`: browser modules and assets need the HTTP server.

### Options and troubleshooting

- **Port already in use:** run `python3 run.py --port 8766` on macOS/Linux or
  `py -3 run.py --port 8766` on Windows, then visit http://127.0.0.1:8766.
- **Do not open a browser automatically:** add `--no-browser` to the command.
- **Python not found:** install Python, then close and reopen your terminal.
- **Old graphics after updating:** refresh with Ctrl+Shift+R (Windows/Linux) or
  Cmd+Shift+R (macOS).
- **Blank range or graphics errors:** use a browser with WebGL2 enabled and check
  that hardware acceleration is available. Check the browser console for errors.
- **Mouse does not move the view:** click **Enter the range** and allow pointer
  capture. Press Esc to release it.
- **Connection refused:** check that the terminal still shows the running server
  and that the browser URL uses the port printed there.

Use the same address and port each time to keep the same saved settings and scores.
`localhost` and `127.0.0.1` have separate browser storage.

## Play

Enter your player name, sensitivity scale, in-game sensitivity, and actual mouse
DPI. Click **Enter the range** to capture the mouse. Shoot with left click; Esc
pauses and releases the cursor. Resume using the button. Settings stay locked
during a session to keep results consistent. Complete 30 seconds to save a score.

## Features

- Three perspective-projected targets; new target appears after each hit.
- Imported, textured Glock FBX model,
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
- `src/viewmodel.js`: WebGL handgun renderer and FBX loading.
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
Three.js renders the handgun with real depth testing, texture mapping and
lighting. The hand model has been removed. All required assets are bundled for
offline play on Windows, macOS, and Linux.
A browser with WebGL2 support is required. The renderer bundle is generated from
`src/`; this avoids loading dependencies from a CDN.

Model by **Creazilla.com**. See [model credits](web/assets/glock/CREDITS.md) and
[original license](web/assets/glock/license.txt). Three.js MIT license is included
in `web/vendor/THREE-LICENSE.txt` (bundle also retains third-party notices).
