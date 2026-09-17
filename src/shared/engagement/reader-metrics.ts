export const READER_EVENTS = ["start", "depth25", "depth50", "depth75", "complete", "topic_view", "topic_click", "author_view", "author_click"] as const;
export type ReaderEvent = typeof READER_EVENTS[number];
export const READER_PREFIX = "reader:v1:";
export type ReaderCounts = Record<ReaderEvent, number>;
export function emptyReaderCounts(): ReaderCounts {
  return Object.fromEntries(READER_EVENTS.map(event => [event, 0])) as ReaderCounts;
}
export function parseReaderCounts(value: string): ReaderCounts {
  const counts = emptyReaderCounts();
  try {
    const parsed = JSON.parse(value);
    for (const event of READER_EVENTS) {
      const count = parsed?.[event];
      if (Number.isSafeInteger(count) && count >= 0) counts[event] = count;
    }
  } catch { /* Ignore malformed legacy rows. */ }
  return counts;
}
