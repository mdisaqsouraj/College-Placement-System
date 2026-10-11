export function checkEligibility(student, drive) {
  const s = student || {}, e = drive.eligibility || {}, reasons = [];
  if (!s.branch || s.cgpa == null || !s.year) reasons.push('Complete your profile (branch, year, CGPA) to check eligibility');
  else {
    if (e.minCgpa && s.cgpa < e.minCgpa) reasons.push(`Minimum CGPA ${e.minCgpa} required (yours: ${s.cgpa})`);
    if (e.maxBacklogs != null && (s.backlogs || 0) > e.maxBacklogs) reasons.push(`At most ${e.maxBacklogs} backlog(s) allowed (yours: ${s.backlogs || 0})`);
    if (e.branches?.length && !e.branches.includes(s.branch)) reasons.push(`Open to: ${e.branches.join(', ')}`);
    if (e.years?.length && !e.years.includes(s.year)) reasons.push(`Open to year(s): ${e.years.join(', ')}`);
    if (e.requiredSkills?.length) {
      const mine = new Set((s.skills || []).map((x) => x.toLowerCase()));
      const missing = e.requiredSkills.filter((x) => !mine.has(x.toLowerCase()));
      if (missing.length) reasons.push(`Missing skills: ${missing.join(', ')}`);
    }
  }
  return { eligible: reasons.length === 0, reasons };
}
