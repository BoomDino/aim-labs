import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { handFaces } from "./hand.js";
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
const assembly = new THREE.Group(),
  pose = new THREE.Group();
assembly.scale.z = -1;
pose.add(assembly);
scene.add(pose);
camera.position.z = 3.4;
scene.add(new THREE.HemisphereLight(0xddefff, 0x505764, 2.1));
for (const [x, y, z, intensity] of [
  [-3, 5, 4, 3],
  [4, 1, -2, 2],
]) {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(x, y, z);
  scene.add(light);
}
const groups = new Map();
for (const { vertices, color } of handFaces) {
  const key = color.join(",");
  if (!groups.has(key)) groups.set(key, { color, points: [] });
  const { points } = groups.get(key);
  const fitted = vertices.map(([x, y, z]) => [x - 0.09, y, z + 0.22]);
  for (let i = 1; i < fitted.length - 1; i++)
    points.push(...fitted[0], ...fitted[i], ...fitted[i + 1]);
}
for (const { color, points } of groups.values()) {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(...color.map((c) => c / 255)),
    metalness: color[0] > 130 ? 0.8 : 0.25,
    roughness: color[0] > 130 ? 0.3 : 0.65,
    side: THREE.DoubleSide,
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3),
  );
  geometry.computeVertexNormals();
  assembly.add(new THREE.Mesh(geometry, material));
}
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  preserveDrawingBuffer: true,
});
renderer.setClearColor(0, 0);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const tex = new THREE.TextureLoader();
const base = "/assets/glock/";
const albedo = tex.load(base + "albedo.png");
albedo.colorSpace = THREE.SRGBColorSpace;
const normal = tex.load(base + "normal.png");
const gunMaterial = new THREE.MeshStandardMaterial({
  map: albedo,
  normalMap: normal,
  normalScale: new THREE.Vector2(1, -1),
  metalness: 0.25,
  roughness: 0.65,
});
let loaded = false,
  loadError = "";
new FBXLoader().load(
  base + "Glock.FBX",
  (object) => {
    const oriented = new THREE.Group();
    oriented.add(object);
    oriented.rotation.y = Math.PI;
    object = oriented;
    const bounds = new THREE.Box3().setFromObject(object),
      center = bounds.getCenter(new THREE.Vector3());
    const scale = 1.97 / (bounds.max.z - bounds.min.z);
    object.scale.multiplyScalar(scale);
    object.position.set(
      -center.x * scale,
      0.63 - bounds.max.y * scale,
      0.32 - center.z * scale,
    );
    object.traverse((o) => {
      if (o.isMesh) {
        o.material = gunMaterial;
        o.frustumCulled = false;
      }
    });
    assembly.add(object);
    loaded = true;
  },
  undefined,
  (error) => {
    loadError = "Glock model unavailable";
    console.error(error);
  },
);
const flash = new THREE.Mesh(
  new THREE.SphereGeometry(0.08, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xffcc66 }),
);
flash.position.set(0, 0.46, 1.31);
assembly.add(flash);
export function drawViewmodel(ctx, w, h, time, recoil) {
  const kick = Math.max(0, recoil / 0.09),
    tilt = -0.24 - kick * 0.1,
    ry = -0.62;
  // Mirror the original camera-space pose while WebGL supplies depth and materials.
  assembly.rotation.set(-tilt, -ry, 0, "XYZ");
  const focal = Math.min(w * 0.64, h * 1.05);
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(h / (2 * focal)));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  pose.position.set(
    ((w * 0.72 - w * 0.5) * 3.4) / focal,
    ((h * 0.5 - h * 0.6 - kick * 10) * 3.4) / focal,
    kick * 0.12,
  );
  pose.position.x += Math.sin(time * 0.0014) * 0.008;
  flash.visible = kick > 0 && loaded;
  flash.scale.setScalar(1 + kick);
  if (
    renderer.domElement.width !== Math.round(w) ||
    renderer.domElement.height !== Math.round(h)
  )
    renderer.setSize(w, h, false);
  renderer.render(scene, camera);
  ctx.drawImage(renderer.domElement, 0, 0, w, h);
  if (!loaded) {
    ctx.save();
    ctx.fillStyle = "#e7ece4";
    ctx.font = "12px sans-serif";
    ctx.fillText(loadError || "Loading Glock model…", w * 0.65, h * 0.9);
    ctx.restore();
  }
}
