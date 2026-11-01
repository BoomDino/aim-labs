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

export { faces as handFaces };
