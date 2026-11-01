import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
const assembly = new THREE.Group(),
  pose = new THREE.Group();
assembly.scale.z = -1;
pose.add(assembly);
scene.add(pose);
camera.position.z = 3.4;

scene.add(new THREE.HemisphereLight(0xddefff, 0x505764, 2.5));
for (const [x, y, z, intensity] of [
  [-3, 5, 4, 3],
  [4, 1, -2, 2],
]) {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(x, y, z);
  scene.add(light);
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

const texLoader = new THREE.TextureLoader();
const baseGlock = "/assets/glock/";
const albedo = texLoader.load(baseGlock + "albedo.png");
albedo.colorSpace = THREE.SRGBColorSpace;
const normal = texLoader.load(baseGlock + "normal.png");
const gunMaterial = new THREE.MeshStandardMaterial({
  map: albedo,
  normalMap: normal,
  normalScale: new THREE.Vector2(1, -1),
  metalness: 0.25,
  roughness: 0.65,
});

let gunLoaded = false,
  loadError = "";

const loader = new FBXLoader();

// Load Glock handgun model
loader.load(
  baseGlock + "Glock.FBX",
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
    gunLoaded = true;
  },
  undefined,
  (error) => {
    loadError = "Handgun model failed to load";
    console.error(error);
  },
);

const flash = new THREE.Mesh(
  new THREE.SphereGeometry(0.09, 8, 6),
  new THREE.MeshBasicMaterial({ color: 0xffe066 }),
);
flash.position.set(0, 0.46, 1.31);
assembly.add(flash);

export function drawViewmodel(ctx, w, h, time, recoil) {
  const kick = Math.max(0, recoil / 0.09);

  // Camera perspective matching the 2D canvas focal length
  const focal = Math.min(w * 0.64, h * 1.05);
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(h / (2 * focal)));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  // Steam Aim Lab default viewmodel orientation:
  // Offset to the lower-right, angled naturally toward center crosshair
  const basePitch = 0.09 + kick * 0.15;
  const baseYaw = 0.18 - kick * 0.02;
  const baseRoll = -0.05 + kick * 0.03;
  assembly.rotation.set(basePitch, baseYaw, baseRoll);

  // Subtle breathing idle sway
  const swayX = Math.sin(time * 0.0018) * 0.005;
  const swayY = Math.cos(time * 0.0024) * 0.003;

  // Aim Lab screen offset: ~72% width, lower right corner to avoid blocking targets
  pose.position.set(
    ((w * 0.72 - w * 0.5) * 3.4) / focal + swayX,
    ((h * 0.5 - h * 0.74) * 3.4) / focal + swayY - kick * 0.03,
    -kick * 0.12,
  );

  flash.visible = kick > 0.05 && gunLoaded;
  flash.scale.setScalar(0.8 + kick * 1.6);

  if (
    renderer.domElement.width !== Math.round(w) ||
    renderer.domElement.height !== Math.round(h)
  ) {
    renderer.setSize(w, h, false);
  }

  renderer.render(scene, camera);
  ctx.drawImage(renderer.domElement, 0, 0, w, h);

  if (!gunLoaded) {
    ctx.save();
    ctx.fillStyle = "#e7ece4";
    ctx.font = "12px sans-serif";
    ctx.fillText(loadError || "Loading handgun model…", w * 0.65, h * 0.9);
    ctx.restore();
  }
}
