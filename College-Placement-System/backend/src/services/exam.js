// Pure helpers for test state and result/review policies.
export function effectiveStatus(test, now = new Date()) {
  if (test.status !== 'published') return test.status;
  if (now < test.startTime) return 'scheduled';
  if (now < test.deadline) return 'active';
  return 'closed';
}
export function resultVisible(test, now = new Date()) {
  return test.resultPolicy === 'immediate'
    || (test.resultPolicy === 'after_deadline' && now >= test.deadline)
    || (test.resultPolicy === 'manual' && !!test.resultsReleased);
}
export function reviewVisible(test, now = new Date()) {
  return test.reviewPolicy === 'immediate' || (test.reviewPolicy === 'after_deadline' && now >= test.deadline);
}
