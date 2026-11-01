// Original low-poly Silverhand-inspired mesh. No external assets or game files.
// Model-space polygons are lit, depth-sorted, and perspective-projected each frame.
const faces = [];
const steel = [139, 157, 168],
  dark = [36, 43, 49],
  chrome = [192, 209, 218];
function box(x, y, z, w, h, d, color) {
  const v = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ].map(([a, b, c]) => [x + (a * w) / 2, y + (b * h) / 2, z + (c * d) / 2]);
  for (const indices of [
    [0, 3, 2, 1],
    [4, 5, 6, 7],
    [0, 4, 7, 3],
    [1, 2, 6, 5],
    [3, 7, 6, 2],
    [0, 1, 5, 4],
  ])
    faces.push({ vertices: indices.map((i) => v[i]), color });
}
function barrel(x, y, z, r, length, color) {
  const sides = 12;
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2,
      b = ((i + 1) / sides) * Math.PI * 2;
    faces.push({
      vertices: [
        [x + Math.cos(a) * r, y + Math.sin(a) * r, z],
        [x + Math.cos(b) * r, y + Math.sin(b) * r, z],
        [x + Math.cos(b) * r, y + Math.sin(b) * r, z + length],
        [x + Math.cos(a) * r, y + Math.sin(a) * r, z + length],
      ],
      color,
    });
  }
}
// Long, slab-sided receiver, ported barrel and dark inset upper rail.
box(0, 0.39, 0.63, 0.38, 0.33, 1.95, steel);
box(0, 0.57, 0.65, 0.29, 0.09, 1.85, dark);
box(0, 0.23, 0.77, 0.28, 0.12, 1.75, dark);
barrel(0, 0.39, 1.55, 0.16, 0.3, steel);
barrel(0, 0.39, 1.84, 0.095, 0.015, [9, 13, 16]);
box(0, 0.64, 1.45, 0.055, 0.09, 0.13, [200, 76, 50]);
box(-0.12, 0.64, -0.23, 0.045, 0.09, 0.1, chrome);
box(0.12, 0.64, -0.23, 0.045, 0.09, 0.1, chrome);
for (let i = 0; i < 6; i++) {
  box(-0.195, 0.42, 0.55 + i * 0.14, 0.012, 0.13, 0.065, dark);
  box(0.195, 0.42, 0.55 + i * 0.14, 0.012, 0.13, 0.065, dark);
}
box(0.197, 0.36, 0.03, 0.015, 0.08, 0.48, [145, 48, 35]);
box(-0.197, 0.36, 0.03, 0.015, 0.08, 0.48, [145, 48, 35]);
// Grip, trigger guard and trigger.
box(0, -0.08, -0.13, 0.26, 0.62, 0.31, [53, 38, 33]);
for (let i = 0; i < 5; i++)
  box(0.14, -0.26 + i * 0.1, -0.13, 0.02, 0.035, 0.27, dark);
box(0, -0.2, 0.34, 0.1, 0.055, 0.58, steel);
box(0, -0.04, 0.6, 0.1, 0.35, 0.055, steel);
box(0, 0.02, 0.23, 0.045, 0.2, 0.055, dark);
// Chrome cybernetic palm and four articulated fingers curling around grip.
box(0.22, -0.12, -0.19, 0.2, 0.43, 0.36, chrome);
box(0.32, -0.12, -0.23, 0.045, 0.31, 0.25, steel);
for (let i = 0; i < 4; i++) {
  const y = 0.03 - i * 0.115;
  box(0.15, y, -0.4, 0.22, 0.087, 0.12, chrome);
  box(-0.005, y, -0.35, 0.11, 0.085, 0.17, steel);
  box(-0.07, y, -0.25, 0.08, 0.075, 0.12, chrome);
  barrel(0.26, y, -0.47, 0.035, 0.035, dark);
}
// Thumb bridging the palm to the receiver.
box(0.2, 0.14, -0.13, 0.13, 0.11, 0.4, chrome);
box(0.11, 0.15, 0.05, 0.18, 0.09, 0.13, steel);
// Wrist collar, segmented forearm armor, exposed dark actuator channels.
box(0.24, -0.47, -0.25, 0.3, 0.16, 0.36, dark);
box(0.24, -0.59, -0.29, 0.35, 0.11, 0.4, steel);
box(0.29, -1.08, -0.47, 0.33, 0.91, 0.42, dark);
for (let i = 0; i < 4; i++) {
  const y = -0.75 - i * 0.21;
  box(0.29, y, -0.69, 0.34, 0.17, 0.055, chrome);
  box(0.49, y, -0.48, 0.065, 0.18, 0.38, steel);
  box(0.08, y, -0.48, 0.065, 0.18, 0.38, steel);
}
box(0.21, -1.1, -0.735, 0.028, 0.76, 0.02, [161, 69, 39]);
box(0.36, -1.1, -0.735, 0.028, 0.76, 0.02, [161, 69, 39]);

export const modelFaceCount = faces.length;
export function drawViewmodel(ctx, w, h, time, recoil) {
  const kick = Math.max(0, recoil / 0.09),
    tilt = -0.24 - kick * 0.1;
  const ry = -0.42,
    cy = Math.cos(ry),
    sy = Math.sin(ry),
    cx = Math.cos(tilt),
    sx = Math.sin(tilt);
  const transform = ([x, y, z]) => {
    const xx = x * cy + z * sy,
      zz = -x * sy + z * cy;
    return [xx, y * cx - zz * sx, zz * cx + y * sx + 3.4 - kick * 0.12];
  };
  const focal = Math.min(w * 0.64, h * 1.05),
    ox = w * 0.72 + Math.sin(time * 0.0014) * 1.5,
    oy = h * 0.72 + kick * 10;
  const project = ([x, y, z]) => [ox + (x * focal) / z, oy - (y * focal) / z];
  const polygons = faces
    .map((face) => ({ ...face, vertices: face.vertices.map(transform) }))
    .sort(
      (a, b) =>
        b.vertices.reduce((s, v) => s + v[2], 0) / b.vertices.length -
        a.vertices.reduce((s, v) => s + v[2], 0) / a.vertices.length,
    );
  ctx.save();
  ctx.lineWidth = 0.65;
  for (const face of polygons) {
    const [a, b, c] = face.vertices,
      u = b.map((v, i) => v - a[i]),
      v = c.map((n, i) => n - a[i]);
    const n = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ],
      length = Math.hypot(...n) || 1;
    const light =
      0.4 +
      0.6 * Math.max(0, (n[0] * -0.35 + n[1] * 0.7 + n[2] * -0.62) / length);
    const color = face.color.map((c) => Math.round(c * light));
    ctx.fillStyle = `rgb(${color.join(",")})`;
    ctx.strokeStyle = `rgba(12,20,25,.24)`;
    ctx.beginPath();
    face.vertices.forEach((v, i) => {
      const [x, y] = project(v);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (kick > 0) {
    const [x, y] = project(transform([0, 0.39, 1.92]));
    ctx.fillStyle = "#ffe6a1";
    ctx.shadowColor = "#ff9b28";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6,
        r = (i % 2 ? 8 : 26) * kick;
      const px = x + Math.cos(a) * r,
        py = y + Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
