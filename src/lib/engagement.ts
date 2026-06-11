export const SHARE_COUNT_PREFIX = "engagement:share:";
export const FEEDBACK_UP_PREFIX = "engagement:feedback:up:";
export const FEEDBACK_DOWN_PREFIX = "engagement:feedback:down:";

export type FeedbackValue = "up" | "down";

export function shareCountKey(yaziId: string) {
  return `${SHARE_COUNT_PREFIX}${yaziId}`;
}

export function feedbackCountKey(yaziId: string, value: FeedbackValue) {
  return `${value === "up" ? FEEDBACK_UP_PREFIX : FEEDBACK_DOWN_PREFIX}${yaziId}`;
}

export function parseCounter(value?: string | null) {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function extractIdFromCounterKey(key: string, prefix: string) {
  return key.startsWith(prefix) ? key.slice(prefix.length) : null;
}
