import pThrottle from 'p-throttle';

/**
 * Rate limiter for Covalent GoldRush API.
 * Free tier allows 4 requests per second.
 *
 * Usage:
 * ```typescript
 * const throttledFn = throttle(async () => await fetchData());
 * await throttledFn();
 * ```
 *
 * The strict option ensures no bursts exceed the limit.
 */
export const throttle = pThrottle({
  limit: 4,
  interval: 1000,
  strict: true,
});
