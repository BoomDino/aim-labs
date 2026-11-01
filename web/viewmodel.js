// Reference-guided fan recreation, built from original procedural mesh geometry.
// Each surface is a real 3D polygon; no downloaded game assets or image billboards.
const faces = [];
const steel = [163, 174, 180],
  chrome = [205, 214, 218],
  dark = [31, 36, 40],
  black = [13, 17, 20],
  red = [108, 24, 30];
const add = (vertices, color) => faces.push({ vertices, color });
const sub = (a, b) => a.map((v, i) => v - b[i]);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const unit = (a) => {
  const l = Math.hypot(...a) || 1;
  return a.map((v) => v / l);
};
// Loft closed rings. Sections describe center and half-width/depth along an axis.
function loft(sections, color, axis = "z", sides = 8) {
  const rings = sections.map(([x, y, z, rx, ry]) =>
    Array.from({ length: sides }, (_, i) => {
      const a = ((i + 0.5) * 2 * Math.PI) / sides;
      return axis === "z"
        ? [x + Math.cos(a) * rx, y + Math.sin(a) * ry, z]
        : [x + Math.cos(a) * rx, y, z + Math.sin(a) * ry];
    }),
  );
  add([...rings[0]].reverse(), color);
  add(rings.at(-1), color);
  for (let j = 0; j < rings.length - 1; j++)
    for (let i = 0; i < sides; i++)
      add(
        [
          rings[j][i],
          rings[j][(i + 1) % sides],
          rings[j + 1][(i + 1) % sides],
          rings[j + 1][i],
        ],
        color,
      );
}
function tube(a, b, r, color, sides = 12, r2 = r) {
  const n = unit(sub(b, a)),
    u = unit(cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])),
    v = cross(n, u);
  const rings = [a, b].map((c, j) =>
    Array.from({ length: sides }, (_, i) => {
      const angle = (i * 2 * Math.PI) / sides;
      return c.map(
        (p, k) =>
          p + (j ? r2 : r) * (u[k] * Math.cos(angle) + v[k] * Math.sin(angle)),
      );
    }),
  );
  add([...rings[0]].reverse(), color);
  add(rings[1], color);
  for (let i = 0; i < sides; i++)
    add(
      [
        rings[0][i],
        rings[0][(i + 1) % sides],
        rings[1][(i + 1) % sides],
        rings[1][i],
      ],
      color,
    );
}
function plate(x, y, z, w, h, d, color) {
  loft(
    [
      [x, y, z - d / 2, w / 2, h / 2],
      [x, y, z + d / 2, w / 2, h / 2],
    ],
    color,
    "z",
    8,
  );
}
// Malorian: long chamfered slide, narrow muzzle, silver top and black lower rail.
loft(
  [
    [0, 0.4, -0.12, 0.205, 0.19],
    [0, 0.4, 0.1, 0.235, 0.205],
    [0, 0.4, 1.55, 0.225, 0.19],
    [0, 0.4, 1.79, 0.17, 0.15],
  ],
  steel,
);
plate(0, 0.24, 0.78, 0.39, 0.15, 2.13, dark);
plate(0, 0.59, 0.8, 0.19, 0.055, 1.67, chrome);
// Open black bore set into the silver muzzle collar, with a second lower opening.
tube([0, 0.4, 1.785], [0, 0.4, 1.81], 0.097, black, 20);
tube([0, 0.4, 1.812], [0, 0.4, 1.818], 0.061, [3, 5, 7], 20);
tube([0, 0.235, 1.75], [0, 0.235, 1.8], 0.057, steel, 16);
tube([0, 0.235, 1.803], [0, 0.235, 1.81], 0.035, black, 16);
// Rear exposed cylindrical breech and locking collars.
tube([0, 0.41, -0.63], [0, 0.41, -0.11], 0.164, steel, 20);
for (const z of [-0.62, -0.54, -0.17])
  tube([0, 0.41, z], [0, 0.41, z + 0.055], 0.184, dark, 20);
plate(0, 0.57, -0.4, 0.18, 0.055, 0.31, chrome);
plate(0, 0.24, -0.38, 0.34, 0.13, 0.66, dark);
plate(0, 0.65, 0.02, 0.19, 0.1, 0.17, dark);
plate(0, 0.62, 1.48, 0.09, 0.11, 0.15, dark);
plate(0, 0.682, 1.48, 0.034, 0.027, 0.035, [172, 216, 112]);
for (const side of [-1, 1]) {
  // Long machined lower groove, ejection port, top cuts and fasteners.
  plate(side * 0.212, 0.29, 0.91, 0.018, 0.055, 1.37, black);
  plate(side * 0.219, 0.43, 0.22, 0.018, 0.105, 0.5, dark);
  for (const z of [0.48, 0.95, 1.12])
    plate(side * 0.13, 0.585, z, 0.07, 0.045, 0.055, dark);
  for (let i = 0; i < 5; i++)
    tube(
      [side * 0.19, 0.22, -0.04 + i * 0.09],
      [side * 0.2, 0.22, -0.04 + i * 0.09],
      0.013,
      black,
      8,
    );
  for (const z of [-0.4, 0.39, 1.48])
    tube([side * 0.2, 0.35, z], [side * 0.212, 0.35, z], 0.025, dark, 12);
}
// Angled grip with rounded palm swell and chrome magazine shoe.
loft(
  [
    [0, 0.2, -0.38, 0.16, 0.2],
    [0, -0.1, -0.46, 0.17, 0.225],
    [0, -0.56, -0.64, 0.155, 0.23],
    [0, -0.65, -0.65, 0.17, 0.24],
  ],
  dark,
  "y",
);
loft(
  [
    [0, -0.61, -0.65, 0.18, 0.25],
    [0, -0.69, -0.65, 0.18, 0.25],
  ],
  steel,
  "y",
);
for (const side of [-1, 1])
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 2; col++) {
      const y = -0.18 - row * 0.13,
        z = -0.5 + col * 0.13 - row * 0.045;
      tube([side * 0.157, y, z], [side * 0.178, y, z], 0.036, steel, 12);
      tube([side * 0.18, y, z], [side * 0.184, y, z], 0.024, black, 12);
    }
// Swept trigger guard, curved trigger and front magazine housing.
const guard = [
  [0, 0.2, -0.24],
  [0, -0.08, -0.16],
  [0, -0.15, 0.03],
  [0, -0.11, 0.29],
  [0, 0.2, 0.39],
];
for (let i = 0; i < guard.length - 1; i++)
  tube(guard[i], guard[i + 1], 0.035, steel, 8);
tube([0, 0.2, -0.04], [0, 0.035, 0.015], 0.025, chrome, 8);
loft(
  [
    [0, 0.1, 0.4, 0.16, 0.13],
    [0, -0.2, 0.4, 0.14, 0.12],
    [0, -0.27, 0.4, 0.1, 0.1],
  ],
  steel,
  "y",
);
// Palm: a single fitted shield over dark tendons, rather than a stack of boxes.
loft(
  [
    [0.23, 0.07, -0.47, 0.115, 0.18],
    [0.25, -0.12, -0.52, 0.17, 0.21],
    [0.26, -0.37, -0.58, 0.135, 0.17],
  ],
  black,
  "y",
);
loft(
  [
    [0.28, 0.03, -0.55, 0.13, 0.15],
    [0.32, -0.12, -0.57, 0.15, 0.17],
    [0.3, -0.31, -0.62, 0.12, 0.13],
  ],
  chrome,
  "y",
);
plate(0.43, -0.12, -0.58, 0.026, 0.26, 0.22, steel);
// Articulated curled digits: tapered phalanges, circular hinge pins, dark gaps.
for (let i = 0; i < 4; i++) {
  const y = 0.015 - i * 0.115,
    dz = -i * 0.035;
  const pts = [
    [0.29, y, -0.7 + dz],
    [0.12, y, -0.76 + dz],
    [-0.06, y, -0.69 + dz],
    [-0.13, y, -0.49 + dz],
  ];
  for (let j = 0; j < 3; j++) {
    const a = pts[j],
      b = pts[j + 1];
    tube(a, b, 0.044, black, 10);
    const aa = a.map((v, k) => v * 0.88 + b[k] * 0.12),
      bb = a.map((v, k) => v * 0.12 + b[k] * 0.88);
    tube(aa, bb, 0.052, chrome, 8, 0.044);
    tube([b[0], y - 0.042, b[2]], [b[0], y + 0.042, b[2]], 0.035, steel, 12);
    tube([b[0], y - 0.045, b[2]], [b[0], y - 0.048, b[2]], 0.017, black, 12);
  }
}
// Thumb wraps the side of the grip, with a raised knuckle cap.
tube([0.3, -0.13, -0.43], [0.22, 0.14, -0.34], 0.067, steel, 12);
tube([0.22, 0.14, -0.34], [0.05, 0.16, -0.25], 0.058, chrome, 12);
// Open wrist: black flexor rods and red internal tendons.
for (let i = 0; i < 5; i++) {
  const x = 0.12 + i * 0.065;
  tube(
    [x, -0.35, -0.57],
    [x + 0.025, -0.6, -0.66],
    0.022,
    i % 2 ? red : black,
    8,
  );
}
tube([0.08, -0.51, -0.63], [0.44, -0.51, -0.63], 0.09, dark, 16);
tube([0.44, -0.51, -0.63], [0.46, -0.51, -0.63], 0.067, steel, 16);
tube([0.46, -0.51, -0.63], [0.47, -0.51, -0.63], 0.033, black, 12);
// Tapered forearm, long continuous armor plates and exposed red cable channel.
loft(
  [
    [0.28, -0.59, -0.64, 0.14, 0.17],
    [0.35, -0.96, -0.77, 0.21, 0.23],
    [0.42, -1.53, -0.89, 0.26, 0.27],
  ],
  black,
  "y",
  12,
);
loft(
  [
    [0.28, -0.62, -0.73, 0.15, 0.08],
    [0.35, -0.95, -0.91, 0.22, 0.09],
    [0.42, -1.48, -1.08, 0.24, 0.09],
  ],
  chrome,
  "y",
  8,
);
loft(
  [
    [0.12, -0.66, -0.63, 0.055, 0.13],
    [0.12, -1.0, -0.74, 0.075, 0.18],
    [0.15, -1.47, -0.87, 0.075, 0.21],
  ],
  steel,
  "y",
  8,
);
loft(
  [
    [0.44, -0.66, -0.63, 0.055, 0.13],
    [0.57, -1.0, -0.74, 0.075, 0.18],
    [0.68, -1.47, -0.87, 0.075, 0.21],
  ],
  steel,
  "y",
  8,
);
for (let i = 0; i < 4; i++) {
  const x = 0.23 + i * 0.065;
  tube([x, -0.63, -0.47], [x + 0.09, -1.44, -0.63], 0.026, red, 10);
  tube(
    [x + 0.012, -0.65, -0.46],
    [x + 0.1, -1.43, -0.62],
    0.008,
    [164, 43, 43],
    6,
  );
}
// Armor seams, embedded bolts and fine machining marks.
for (const y of [-0.72, -1.37])
  for (const x of [0.16, 0.52])
    tube([x, y, -0.95], [x, y, -0.965], 0.023, dark, 12);
for (let i = 0; i < 12; i++)
  plate(
    0.32 + i * 0.008,
    -0.95 - i * 0.021,
    -1.003,
    0.003,
    0.15,
    0.002,
    [155, 166, 171],
  );

// Exposed crimson flexors alongside the dorsal shield, as in the arm reference.
for (let i = 0; i < 3; i++) {
  tube(
    [0.45 + i * 0.028, -0.66, -0.78],
    [0.62 + i * 0.03, -1.43, -1.02],
    0.018,
    red,
    10,
  );
  tube(
    [0.46 + i * 0.028, -0.66, -0.795],
    [0.63 + i * 0.03, -1.43, -1.035],
    0.006,
    [170, 57, 55],
    6,
  );
}

export const modelFaceCount = faces.length;
export function drawViewmodel(ctx, w, h, time, recoil) {
  const kick = Math.max(0, recoil / 0.09),
    tilt = -0.24 - kick * 0.1;
  const ry = -0.62,
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
    oy = h * 0.6 + kick * 10;
  const project = ([x, y, z]) => [ox + (x * focal) / z, oy - (y * focal) / z];
  const polygons = faces
    .map((face) => ({ ...face, vertices: face.vertices.map(transform) }))
    .sort(
      (a, b) =>
        b.vertices.reduce((s, v) => s + v[2], 0) / b.vertices.length -
        a.vertices.reduce((s, v) => s + v[2], 0) / a.vertices.length,
    );
  ctx.save();
  ctx.lineWidth = 0.3;
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
      0.42 +
      0.58 * Math.abs((n[0] * -0.35 + n[1] * 0.7 + n[2] * -0.62) / length);
    const metallic = face.color[0] > 130;
    const specular = metallic
      ? 65 *
        Math.pow(
          Math.abs((n[0] * -0.18 + n[1] * 0.45 + n[2] * -0.87) / length),
          14,
        )
      : 0;
    const color = face.color.map((c) =>
      Math.min(255, Math.round(c * light + specular)),
    );
    ctx.fillStyle = `rgb(${color.join(",")})`;
    if (metallic) {
      const points = face.vertices.map(project);
      const minX = Math.min(...points.map((p) => p[0])),
        maxX = Math.max(...points.map((p) => p[0]));
      const minY = Math.min(...points.map((p) => p[1])),
        maxY = Math.max(...points.map((p) => p[1]));
      const finish = ctx.createLinearGradient(minX, minY, maxX + 1, maxY + 1);
      finish.addColorStop(
        0,
        `rgb(${color.map((c) => Math.min(255, c + 30)).join(",")})`,
      );
      finish.addColorStop(0.38, `rgb(${color.join(",")})`);
      finish.addColorStop(
        0.55,
        `rgb(${color.map((c) => Math.min(255, c + 18)).join(",")})`,
      );
      finish.addColorStop(
        1,
        `rgb(${color.map((c) => Math.round(c * 0.73)).join(",")})`,
      );
      ctx.fillStyle = finish;
    }
    ctx.strokeStyle = `rgba(12,20,25,.08)`;
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
    const [x, y] = project(transform([0, 0.4, 1.83]));
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
