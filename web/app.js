import { drawViewmodel } from "./viewmodel.js";
import {
  SESSION_SECONDS,
  TARGET_RADIUS,
  rotation,
  cm360,
  convert,
  score,
  direction,
  hitSphere,
  rank,
} from "./core.js";
const $ = (id) => document.getElementById(id),
  canvas = $("arena"),
  ctx = canvas.getContext("2d");
const fields = ["name", "game", "sensitivity", "dpi", "color"];
let settings = {
    name: "Player",
    game: "cs2",
    sensitivity: 1,
    dpi: 800,
    color: "#a9ff58",
  },
  records = [];
try {
  const saved = JSON.parse(localStorage.getItem("aim-settings"));
  if (saved)
    for (const k of fields) if (saved[k] != null) settings[k] = saved[k];
  records =
    JSON.parse(localStorage.getItem("aim-records-gridshot-30s-large")) || [];
  if (!Array.isArray(records)) records = [];
  records = records.filter(
    (r) =>
      r &&
      typeof r.name === "string" &&
      Number.isFinite(r.score) &&
      Number.isFinite(r.accuracy) &&
      Number.isFinite(r.hits) &&
      typeof r.date === "string",
  );
} catch {
  $("storage").textContent =
    "Storage unavailable. Scores will last for this visit only.";
}
if (!["cs2", "valorant"].includes(settings.game)) settings.game = "cs2";
if (!(settings.sensitivity >= 0.001 && settings.sensitivity <= 100))
  settings.sensitivity = 1;
if (!(settings.dpi >= 50 && settings.dpi <= 50000)) settings.dpi = 800;
if (!/^#[0-9a-f]{6}$/i.test(settings.color)) settings.color = "#a9ff58";
for (const k of fields) $(k).value = settings[k];
function save() {
  try {
    localStorage.setItem("aim-settings", JSON.stringify(settings));
    localStorage.setItem(
      "aim-records-gridshot-30s-large",
      JSON.stringify(records),
    );
  } catch {
    $("storage").textContent =
      "Could not save to browser storage. This session remains visible.";
  }
}
function setup() {
  for (const k of fields)
    settings[k] = ["dpi", "sensitivity"].includes(k)
      ? Number($(k).value)
      : $(k).value;
  const valid =
    $("sensitivity").checkValidity() &&
    $("dpi").checkValidity() &&
    settings.sensitivity > 0 &&
    settings.dpi > 0;
  $("start").disabled = !valid;
  $("distance").textContent = valid
    ? cm360(settings.sensitivity, settings.dpi, settings.game).toFixed(2)
    : "—";
  $("equivalent").textContent = valid
    ? `Equivalent ${settings.game === "cs2" ? "Valorant" : "CS2"}: ${convert(settings.sensitivity, settings.game, settings.game === "cs2" ? "valorant" : "cs2").toFixed(6)}`
    : "Enter valid sensitivity and DPI.";
  if (valid) save();
}
fields.forEach((k) => $(k).addEventListener("input", setup));
setup();
function board() {
  const body = $("records");
  body.replaceChildren();
  rank(records).forEach((r, i) => {
    const tr = document.createElement("tr");
    [
      String(i + 1).padStart(2, "0"),
      r.name,
      r.score.toLocaleString(),
      `${r.accuracy.toFixed(1)}%`,
      r.hits,
      `${r.game === "cs2" ? "CS2" : "VAL"} · ${r.sensitivity}`,
      new Date(r.date).toLocaleDateString(),
    ].forEach((v) => {
      const td = document.createElement("td");
      td.textContent = v;
      tr.append(td);
    });
    body.append(tr);
  });
  if (!records.length) {
    const tr = document.createElement("tr"),
      td = document.createElement("td");
    td.colSpan = 7;
    td.textContent =
      "Your first score belongs here. Complete a session to get ranked.";
    tr.append(td);
    body.append(tr);
  }
}
board();
let yaw = 0,
  pitch = 0,
  hits = 0,
  shots = 0,
  remaining = SESSION_SECONDS,
  playing = false,
  started = false,
  last = performance.now(),
  flash = 0,
  hitFlash = 0,
  targets = [],
  pending = false;
function spawn(index) {
  let t;
  do {
    t = [(Math.random() - 0.5) * 13, (Math.random() - 0.5) * 6, 15];
  } while (
    targets.some(
      (other, i) =>
        i !== index &&
        Math.hypot(other[0] - t[0], other[1] - t[1]) < TARGET_RADIUS * 2 + 0.2,
    )
  );
  targets[index] = t;
}
for (let i = 0; i < 3; i++) spawn(i);
function hud() {
  $("score").textContent = score(hits, shots).toLocaleString();
  $("hits").textContent = hits;
  $("accuracy").textContent = shots
    ? `${Math.round((hits / shots) * 100)}%`
    : "—";
  $("timer").textContent = remaining.toFixed(1);
}
function finish() {
  playing = false;
  started = false;
  records.push({
    name: String(settings.name).trim().slice(0, 24) || "Player",
    score: score(hits, shots),
    accuracy: shots ? (hits / shots) * 100 : 0,
    hits,
    game: settings.game,
    sensitivity: settings.sensitivity,
    date: new Date().toISOString(),
  });
  records = rank(records);
  save();
  board();
  document.exitPointerLock();
  $("headline").textContent =
    `${score(hits, shots).toLocaleString()} points. Keep climbing.`;
  $("message").textContent =
    `${hits} hits · ${shots} shots · ${shots ? ((hits / shots) * 100).toFixed(1) : 0}% accuracy`;
  $("start").textContent = "PLAY AGAIN ↗";
  $("overlay").hidden = false;
  fields.forEach((k) => ($(k).disabled = false));
}
$("start").onclick = async () => {
  if (pending) return;
  pending = true;
  try {
    const result = canvas.requestPointerLock({ unadjustedMovement: true });
    if (result && typeof result.then === "function") {
      await result;
      $("inputStatus").textContent = "Raw input request accepted";
    } else $("inputStatus").textContent = "Raw input support unverified";
  } catch (error) {
    if (error.name === "NotSupportedError") {
      try {
        await canvas.requestPointerLock();
        $("inputStatus").textContent = "Standard input · scaling may differ";
      } catch {
        $("message").textContent =
          "Mouse capture failed. Click again or try Chrome / Edge.";
      }
    } else
      $("message").textContent =
        "Mouse capture failed. Click again or try Chrome / Edge.";
  } finally {
    pending = false;
  }
};
document.addEventListener("pointerlockchange", () => {
  playing = document.pointerLockElement === canvas;
  if (playing) {
    if (!started) {
      yaw = pitch = hits = shots = 0;
      remaining = SESSION_SECONDS;
      targets = [];
      for (let i = 0; i < 3; i++) spawn(i);
      started = true;
    }
    last = performance.now();
    $("overlay").hidden = true;
    fields.forEach((k) => ($(k).disabled = true));
  } else if (started) {
    $("overlay").hidden = false;
    $("headline").textContent = "Take a breath.";
    $("message").textContent = "Session paused. Resume when you’re ready.";
    $("start").textContent = "RESUME ↗";
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing) document.exitPointerLock();
});
document.addEventListener("mousemove", (e) => {
  if (!playing) return;
  yaw += rotation(e.movementX, settings.sensitivity, settings.game);
  pitch = Math.max(
    -1.5,
    Math.min(
      1.5,
      pitch - rotation(e.movementY, settings.sensitivity, settings.game),
    ),
  );
});
canvas.addEventListener("mousedown", (e) => {
  if (!playing || e.button !== 0 || remaining <= 0) return;
  shots++;
  flash = 0.09;
  const ray = direction(yaw, pitch);
  const index = targets.findIndex((t) => hitSphere(ray, t));
  if (index >= 0) {
    hits++;
    hitFlash = 0.12;
    spawn(index);
  }
  hud();
});
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
function project(point, w, h) {
  const cy = Math.cos(yaw),
    sy = Math.sin(yaw),
    cp = Math.cos(pitch),
    sp = Math.sin(pitch);
  const x = cy * point[0] - sy * point[2],
    z = sy * point[0] + cy * point[2],
    y = cp * point[1] - sp * z,
    depth = sp * point[1] + cp * z;
  if (depth <= 0.05) return null;
  const vfov =
    settings.game === "cs2"
      ? 2 * Math.atan(Math.tan(Math.PI / 4) / (4 / 3))
      : 2 * Math.atan(Math.tan((103 * Math.PI) / 360) / (16 / 9));
  const f = h / (2 * Math.tan(vfov / 2));
  return [w / 2 + (x * f) / depth, h / 2 - (y * f) / depth, f / depth];
}
function line(a, b, w, h) {
  const p = project(a, w, h),
    q = project(b, w, h);
  if (!p || !q) return;
  ctx.beginPath();
  ctx.moveTo(p[0], p[1]);
  ctx.lineTo(q[0], q[1]);
  ctx.stroke();
}
function draw(now) {
  const dt = Math.min((now - last) / 1000, 1);
  last = now;
  if (playing) {
    remaining = Math.max(0, remaining - dt);
    if (!remaining) finish();
    hud();
  }
  flash = Math.max(0, flash - dt);
  hitFlash = Math.max(0, hitFlash - dt);
  const w = canvas.clientWidth,
    h = canvas.clientHeight,
    dpr = Math.min(devicePixelRatio, 2);
  if (
    canvas.width !== Math.round(w * dpr) ||
    canvas.height !== Math.round(h * dpr)
  ) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#16252f");
  bg.addColorStop(1, "#334344");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#58707555";
  ctx.lineWidth = 1;
  for (let x = -30; x <= 30; x += 3) {
    line([x, -7, 0], [x, -7, 40], w, h);
    line([x, -7, 22], [x, 15, 22], w, h);
  }
  for (let z = 3; z <= 39; z += 3) line([-30, -7, z], [30, -7, z], w, h);
  for (let y = -7; y <= 15; y += 3) line([-30, y, 22], [30, y, 22], w, h);
  for (const t of targets) {
    const p = project(t, w, h);
    if (!p) continue;
    const r = TARGET_RADIUS * p[2];
    if (p[0] < -r || p[0] > w + r || p[1] < -r || p[1] > h + r) continue;
    const g = ctx.createRadialGradient(
      p[0] - r * 0.3,
      p[1] - r * 0.4,
      r * 0.05,
      p[0],
      p[1],
      r,
    );
    g.addColorStop(0, "#d2ffff");
    g.addColorStop(0.3, "#5ce6ea");
    g.addColorStop(1, "#128b9b");
    ctx.fillStyle = g;
    ctx.shadowColor = "#50ffff";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  drawViewmodel(ctx, w, h, now, flash);
  ctx.strokeStyle = settings.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const cx = w / 2,
    cy = h / 2;
  for (const [a, b, c, d] of [
    [-10, 0, -4, 0],
    [4, 0, 10, 0],
    [0, -10, 0, -4],
    [0, 4, 0, 10],
  ]) {
    ctx.moveTo(cx + a, cy + b);
    ctx.lineTo(cx + c, cy + d);
  }
  ctx.stroke();
  if (hitFlash > 0) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    for (const [x, y] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      ctx.moveTo(cx + x * 13, cy + y * 13);
      ctx.lineTo(cx + x * 18, cy + y * 18);
    }
    ctx.stroke();
  }
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
