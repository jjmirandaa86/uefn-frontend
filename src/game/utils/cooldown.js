export function createCooldown(ms) {
  let last = 0;
  return (now = performance.now()) => {
    if (now - last >= ms) {
      last = now;
      return true;
    }
    return false;
  };
}
