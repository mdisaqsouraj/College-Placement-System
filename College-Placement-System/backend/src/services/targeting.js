// Decides which students a test is assigned to.
const has = (arr) => Array.isArray(arr) && arr.length > 0;

export function studentTargeted(t, user) {
  const s = user.student || {};
  const hasGroup = has(t.branches) || has(t.years) || has(t.batches);
  const hasStudents = has(t.students);
  if (!hasGroup && !hasStudents) return true; // no restriction: everyone
  if (hasStudents && t.students.some((id) => String(id) === String(user._id))) return true;
  if (!hasGroup) return false;
  if (has(t.branches) && !t.branches.includes(s.branch)) return false;
  if (has(t.years) && !t.years.includes(s.year)) return false;
  if (has(t.batches) && !t.batches.includes(s.batch)) return false;
  return true;
}

export function targetFilter(t) {
  const base = { role: 'student', active: true };
  const group = {};
  if (has(t.branches)) group['student.branch'] = { $in: t.branches };
  if (has(t.years)) group['student.year'] = { $in: t.years };
  if (has(t.batches)) group['student.batch'] = { $in: t.batches };
  const hasGroup = Object.keys(group).length > 0, hasStudents = has(t.students);
  if (!hasGroup && !hasStudents) return base;
  const or = [];
  if (hasGroup) or.push(group);
  if (hasStudents) or.push({ _id: { $in: t.students } });
  return { ...base, $or: or };
}
