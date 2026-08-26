/**
 * Optional artificial latency, retained from the mock era.
 *
 * The database is now genuinely fast, which hides the two things the UI was
 * built to handle: the skeleton and React Query's stale-while-revalidate.
 * Setting `AIR_LATENCY_MS` puts a floor back under every response so those
 * states stay demonstrable. Jitter, not a fixed delay, because a metronome
 * trains the eye to expect a metronome — production p99 is a distribution.
 *
 * Unset (or 0) in production. This is a teaching switch, not a feature.
 */
const BASE = Number.parseInt(process.env.AIR_LATENCY_MS ?? '0', 10);
const JITTER_RATIO = 0.6;

export async function simulateLatency(): Promise<void> {
  if (!Number.isFinite(BASE) || BASE <= 0) return;
  const jitter = Math.floor(Math.random() * BASE * JITTER_RATIO);
  await new Promise((resolve) => setTimeout(resolve, BASE + jitter));
}
