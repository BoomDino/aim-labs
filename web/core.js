export const YAW = Object.freeze({ cs2: 0.022, valorant: 0.07 });
export const radians = (degrees) => (degrees * Math.PI) / 180;
export function rotation(counts, sensitivity, game) {
  return radians(counts * sensitivity * YAW[game]);
}
export function cm360(sensitivity, dpi, game) {
  return (360 * 2.54) / (sensitivity * dpi * YAW[game]);
}
export function convert(sensitivity, from, to) {
  return (sensitivity * YAW[from]) / YAW[to];
}
export function score(hits, shots) {
  return shots ? Math.round((hits * 100 * hits) / shots) : 0;
}
export function direction(yaw, pitch) {
  return [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  ];
}
export function hitSphere(ray, target, radius = 0.48) {
  const dot = ray.reduce((n, v, i) => n + v * target[i], 0);
  return (
    dot > 0 &&
    target.reduce((n, v) => n + v * v, 0) - dot * dot <= radius * radius
  );
}
export function rank(records) {
  return records
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.accuracy - a.accuracy ||
        a.date.localeCompare(b.date),
    )
    .slice(0, 20);
}
