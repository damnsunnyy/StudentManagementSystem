import test from 'node:test';
import assert from 'node:assert/strict';
import Student from './Student.js';

const validStudent = {
  name: 'Alex Morgan',
  email: 'alex.morgan@university.edu',
  course: 'Computer Science',
  year: 2,
  status: 'Active',
};

test('accepts a complete student record and normalizes its email', () => {
  const student = new Student({ ...validStudent, email: '  ALEX@EXAMPLE.COM ' });
  assert.equal(student.validateSync(), undefined);
  assert.equal(student.email, 'alex@example.com');
});

test('rejects invalid email, course, status, and year values', () => {
  const student = new Student({
    ...validStudent,
    email: 'not-an-email',
    course: 'Unknown course',
    status: 'Pending',
    year: 9,
  });
  const error = student.validateSync();
  assert.ok(error);
  for (const field of ['email', 'course', 'status', 'year']) {
    assert.ok(error.errors[field], `expected ${field} validation error`);
  }
});

test('rejects missing and too-short names', () => {
  for (const name of ['', 'A']) {
    const student = new Student({ ...validStudent, name });
    assert.ok(student.validateSync()?.errors.name);
  }
});
