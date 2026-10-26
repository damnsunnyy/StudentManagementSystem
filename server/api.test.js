import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
const { app } = await import('./index.js');
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('health endpoint reports that MongoDB is offline in an unconfigured test process', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: 'unavailable', database: 'offline' });
});

test('student update rejects malformed IDs before accessing the database', async () => {
  const response = await fetch(`${baseUrl}/students/not-an-id`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alex Morgan' }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Invalid student ID.');
});

test('student create rejects a non-object JSON body', async () => {
  const response = await fetch(`${baseUrl}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(['not', 'a', 'record']),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Request body must be a JSON object.');
});

test('student create returns a clear error for malformed JSON', async () => {
  const response = await fetch(`${baseUrl}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid json',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Request body contains invalid JSON.');
});
