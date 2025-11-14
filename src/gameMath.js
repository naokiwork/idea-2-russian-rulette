export function shouldHit(bullets, chambers, rng = Math.random) {
  if (
    !Number.isFinite(bullets) ||
    !Number.isFinite(chambers) ||
    chambers <= 0
  ) {
    return false;
  }
  const sanitizedBullets = Math.max(0, bullets);
  const sanitizedChambers = Math.max(1, chambers);
  const probability = sanitizedBullets / sanitizedChambers;
  const randomValue = typeof rng === 'function' ? rng() : Number(rng);
  return randomValue < probability;
}
