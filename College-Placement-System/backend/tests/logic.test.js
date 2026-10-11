import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeAnswers, scoreAnswers } from '../src/services/scoring.js';
import { validateTargets, inScope, canManageTest, studentScopeFilter, isDelegate } from '../src/services/permissions.js';
import { studentTargeted, targetFilter } from '../src/services/targeting.js';
import { checkEligibility } from '../src/services/eligibility.js';
import { effectiveStatus, resultVisible, reviewVisible } from '../src/services/exam.js';
import { csvCell, seededPick, escapeRegex, isWeekendIST, istDayKey } from '../src/utils/pure.js';

const admin = { _id: 'a1', role: 'tpo_admin' };
const coord = { _id: 'c1', role: 'tpo_member', coordinator: { active: true, branches: ['Computer Engineering'], years: [4], canCreateTests: true } };

test('scoring: correct, wrong with negative marking, unanswered, clamp at 0', () => {
  const qs = [{ id: 'q1', marks: 2, correctOptionId: 'o1' }, { id: 'q2', marks: 2, correctOptionId: 'o9' }, { id: 'q3', marks: 1, correctOptionId: 'o5' }];
  assert.deepEqual(scoreAnswers(qs, { q1: 'o1', q2: 'oX' }, 0.5), { score: 1.5, totalMarks: 5, correct: 1, wrong: 1, unanswered: 1 });
  assert.equal(scoreAnswers(qs, { q1: 'bad', q2: 'bad', q3: 'bad' }, 5).score, 0);
});
test('sanitizeAnswers drops unknown questions/options so clients cannot inject answers', () => {
  const qs = [{ id: 'q1', optionIds: ['a', 'b'] }];
  assert.deepEqual(sanitizeAnswers(qs, [{ questionId: 'q1', optionId: 'b' }, { questionId: 'q2', optionId: 'a' }, { questionId: 'q1', optionId: 'zzz' }]), { q1: 'b' });
  assert.deepEqual(sanitizeAnswers(qs, [{ questionId: 'q1', optionId: null }]), { q1: null });
  assert.deepEqual(sanitizeAnswers(qs, 'junk'), {});
});
test('delegate can only target authorised branches/years', () => {
  assert.equal(validateTargets(admin, {}).ok, true);
  assert.equal(validateTargets(coord, { branches: ['Computer Engineering'], years: [4] }).ok, true);
  assert.equal(validateTargets(coord, { branches: ['Mechanical Engineering'], years: [4] }).ok, false);
  assert.equal(validateTargets(coord, { branches: ['Computer Engineering', 'Information Technology'], years: [4] }).ok, false);
  assert.equal(validateTargets(coord, { branches: ['Computer Engineering'], years: [3] }).ok, false);
  assert.equal(validateTargets(coord, { branches: ['Computer Engineering'] }).ok, false);
  assert.equal(validateTargets(coord, {}).ok, false); // cannot broadcast to everyone
  assert.equal(validateTargets({ ...coord, coordinator: { ...coord.coordinator, active: false } }, { branches: ['Computer Engineering'], years: [4] }).ok, false);
  assert.equal(validateTargets({ _id: 's', role: 'student' }, { branches: ['Computer Engineering'] }).ok, false);
  assert.equal(validateTargets({ ...coord, coordinator: { ...coord.coordinator, canCreateTests: false } }, { branches: ['Computer Engineering'], years: [4] }).ok, false);
});
test('scope checks and revoked delegates', () => {
  assert.equal(inScope(coord, { branch: 'Computer Engineering', year: 4 }), true);
  assert.equal(inScope(coord, { branch: 'Civil Engineering', year: 4 }), false);
  assert.equal(inScope(coord, { branch: 'Computer Engineering', year: 2 }), false);
  assert.equal(inScope(admin, { branch: 'Civil Engineering', year: 1 }), true);
  const revoked = { ...coord, coordinator: { ...coord.coordinator, active: false } };
  assert.equal(isDelegate(revoked), false);
  assert.equal(inScope(revoked, { branch: 'Computer Engineering', year: 4 }), false);
  assert.deepEqual(studentScopeFilter(coord), { role: 'student', 'student.branch': { $in: ['Computer Engineering'] }, 'student.year': { $in: [4] } });
});
test('test ownership: delegate manages only own tests', () => {
  assert.equal(canManageTest(coord, { createdBy: 'c1' }), true);
  assert.equal(canManageTest(coord, { createdBy: 'other' }), false);
  assert.equal(canManageTest(admin, { createdBy: 'other' }), true);
});
test('targeting by branch/year/batch/individual', () => {
  const s = { _id: 's1', student: { branch: 'Computer Engineering', year: 4, batch: '2026' } };
  assert.equal(studentTargeted({ branches: [], years: [], batches: [], students: [] }, s), true);
  assert.equal(studentTargeted({ branches: ['Computer Engineering'], years: [4] }, s), true);
  assert.equal(studentTargeted({ branches: ['Civil Engineering'] }, s), false);
  assert.equal(studentTargeted({ branches: ['Civil Engineering'], students: ['s1'] }, s), true);
  assert.equal(studentTargeted({ students: ['other'] }, s), false); // individual-only tests do not leak to everyone
  assert.equal(studentTargeted({ batches: ['2025'] }, s), false);
  assert.deepEqual(targetFilter({}), { role: 'student', active: true });
  assert.ok(targetFilter({ students: ['x'] }).$or);
});
test('eligibility rules', () => {
  const drive = { eligibility: { minCgpa: 7, maxBacklogs: 0, branches: ['Computer Engineering'], years: [4], requiredSkills: ['Java'] } };
  const ok = { branch: 'Computer Engineering', year: 4, cgpa: 8, backlogs: 0, skills: ['java'] };
  assert.equal(checkEligibility(ok, drive).eligible, true);
  assert.equal(checkEligibility({ ...ok, cgpa: 6.5 }, drive).eligible, false);
  assert.equal(checkEligibility({ ...ok, backlogs: 1 }, drive).eligible, false);
  assert.equal(checkEligibility({ ...ok, skills: [] }, drive).eligible, false);
  assert.equal(checkEligibility({ branch: 'Computer Engineering', year: 4 }, drive).eligible, false); // incomplete profile
});
test('test state and result/review policies', () => {
  const t = { status: 'published', startTime: new Date(1000), deadline: new Date(2000), resultPolicy: 'after_deadline', reviewPolicy: 'after_deadline' };
  assert.equal(effectiveStatus(t, new Date(500)), 'scheduled');
  assert.equal(effectiveStatus(t, new Date(1500)), 'active');
  assert.equal(effectiveStatus(t, new Date(2500)), 'closed');
  assert.equal(effectiveStatus({ ...t, status: 'draft' }, new Date(1500)), 'draft');
  assert.equal(resultVisible(t, new Date(1500)), false);
  assert.equal(resultVisible(t, new Date(2500)), true);
  assert.equal(resultVisible({ ...t, resultPolicy: 'immediate' }, new Date(1500)), true);
  assert.equal(resultVisible({ ...t, resultPolicy: 'manual' }, new Date(2500)), false);
  assert.equal(resultVisible({ ...t, resultPolicy: 'manual', resultsReleased: true }, new Date(2500)), true);
  assert.equal(reviewVisible({ ...t, reviewPolicy: 'none' }, new Date(9999)), false);
});
test('utils: csv injection guard, seeded pick, weekend (IST), regex escape', () => {
  assert.equal(csvCell('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(csvCell(-5), '-5');
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
  assert.deepEqual(seededPick([1, 2, 3, 4, 5, 6, 7, 8], 3, 'x'), seededPick([1, 2, 3, 4, 5, 6, 7, 8], 3, 'x'));
  assert.equal(isWeekendIST(new Date('2026-10-10T06:00:00Z')), true); // Saturday
  assert.equal(isWeekendIST(new Date('2026-10-12T06:00:00Z')), false); // Monday
  assert.equal(istDayKey(new Date('2026-10-10T20:00:00Z')), '2026-10-11'); // already Sunday in IST
  assert.equal(new RegExp(escapeRegex('a.b+c')).test('a.b+c'), true);
  assert.equal(new RegExp(escapeRegex('a.b+c')).test('aXb+c'), false);
});
