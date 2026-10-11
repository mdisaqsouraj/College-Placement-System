import { ROLES } from '../constants.js';

export const isAdmin = (u) => u?.role === ROLES.ADMIN;
export const isDelegate = (u) => (u?.role === ROLES.MEMBER || u?.role === ROLES.FACULTY) && !!u.coordinator?.active;
export const isStaff = (u) => isAdmin(u) || isDelegate(u);

export function scope(u) {
  if (isAdmin(u)) return { all: true, branches: null, years: null };
  if (isDelegate(u)) return { all: false, branches: [...(u.coordinator.branches || [])], years: [...(u.coordinator.years || [])] };
  return { all: false, branches: [], years: [] };
}

/** Is a student profile ({branch, year}) inside the user's authorised scope? */
export function inScope(u, s) {
  const sc = scope(u);
  if (sc.all) return true;
  if (!s?.branch || !sc.branches.includes(s.branch)) return false;
  if (sc.years.length && !sc.years.includes(s.year)) return false;
  return true;
}

/** Mongo filter for the student users a staff member may see. */
export function studentScopeFilter(u) {
  const sc = scope(u);
  const f = { role: ROLES.STUDENT };
  if (sc.all) return f;
  f['student.branch'] = { $in: sc.branches };
  if (sc.years.length) f['student.year'] = { $in: sc.years };
  return f;
}

/** Can this user create/assign a test with these targets? (student ids are checked separately against the DB) */
export function validateTargets(u, t) {
  if (isAdmin(u)) return { ok: true };
  if (!isDelegate(u) || !u.coordinator.canCreateTests) return { ok: false, error: 'You are not authorised to create tests' };
  const sc = scope(u);
  const b = t.branches || [], students = t.students || [];
  if (!b.length && !students.length) return { ok: false, error: 'Select at least one of your authorised branches or specific students' };
  if (b.length) {
    if (b.some((x) => !sc.branches.includes(x))) return { ok: false, error: 'One or more branches are outside your authorisation' };
    if (sc.years.length) {
      const y = t.years || [];
      if (!y.length || y.some((x) => !sc.years.includes(x))) return { ok: false, error: 'One or more years are outside your authorisation' };
    }
  }
  return { ok: true };
}

export const canManageTest = (u, test) => isAdmin(u) || (isDelegate(u) && String(test.createdBy) === String(u._id));
export const canViewResults = (u, test) => isAdmin(u) || (canManageTest(u, test) && u.coordinator.canViewResults !== false);
