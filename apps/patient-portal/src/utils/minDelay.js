// Ensures a promise takes at least `ms` to settle — used to keep loading
// skeletons visible for a perceivable minimum, even when the API responds
// almost instantly (localhost, warm connections). Works for both success
// and failure since the delay is applied in `finally`.
export function withMinDuration(promise, ms = 400) {
  const start = Date.now();
  return promise.finally(() => {
    const wait = Math.max(0, ms - (Date.now() - start));
    if (wait > 0) return new Promise((resolve) => setTimeout(resolve, wait));
  });
}
