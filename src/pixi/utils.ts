export function smoothApproach(currentValue: number, targetValue: number, speed: number, threshold = 0.0005) {
  const difference = targetValue - currentValue;
  if (Math.abs(difference) < threshold) return targetValue;
  return currentValue + Math.sign(difference) * Math.abs(difference) * speed;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}