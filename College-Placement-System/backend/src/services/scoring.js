// Pure scoring logic. The server is the ONLY place where marks are computed.
const r2 = (n) => Math.round(n * 100) / 100;

/** questions: [{id, optionIds}]; raw: [{questionId, optionId|null}] -> {qid: optionId|null} (invalid entries dropped) */
export function sanitizeAnswers(questions, raw) {
  const out = {};
  if (!Array.isArray(raw)) return out;
  const allowed = new Map(questions.map((q) => [String(q.id), new Set(q.optionIds.map(String))]));
  for (const a of raw) {
    if (!a || typeof a !== 'object') continue;
    const set = allowed.get(String(a.questionId));
    if (!set) continue;
    if (a.optionId == null || a.optionId === '') { out[String(a.questionId)] = null; continue; }
    if (set.has(String(a.optionId))) out[String(a.questionId)] = String(a.optionId);
  }
  return out;
}

/** questions: [{id, marks, correctOptionId}]; answers: {qid: optionId} */
export function scoreAnswers(questions, answers, negativePerWrong = 0) {
  let score = 0, correct = 0, wrong = 0, unanswered = 0, totalMarks = 0;
  for (const q of questions) {
    totalMarks += q.marks;
    const a = answers[String(q.id)];
    if (!a) { unanswered++; continue; }
    if (String(a) === String(q.correctOptionId)) { correct++; score += q.marks; }
    else { wrong++; score -= negativePerWrong; }
  }
  return { score: r2(Math.max(0, score)), totalMarks: r2(totalMarks), correct, wrong, unanswered };
}
