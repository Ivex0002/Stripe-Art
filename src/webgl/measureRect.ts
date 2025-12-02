export function measureRect(target: HTMLElement) {
  const rect = target.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  return { width, height, rect };
}
