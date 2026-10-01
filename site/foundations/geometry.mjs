export const angle = n => 360 / n;
export const ratio = n => 1 / Math.tan(2 * Math.PI / n);
export function inscribedLand(n, radius) {
 const theta = 2 * Math.PI / n;
 return { width: 2 * radius * Math.sin(theta), height: 2 * radius * Math.cos(theta) };
}
export function vertices(n, cx, cy, radius) {
 return Array.from({length:n}, (_,i) => {
  const a = -Math.PI / 2 + i * 2 * Math.PI / n;
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
 });
}
