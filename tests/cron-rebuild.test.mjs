import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { createRebuildHandler } from '../api/cron/rebuild.js';

const deployHookUrl = 'https://api.vercel.com/v1/integrations/deploy/project/hook';

function createRequest(authorization) {
  return new Request('https://example.com/api/cron/rebuild', {
    headers: authorization ? { authorization } : undefined,
  });
}

test('Vercel schedules the production rebuild daily at 11:00 UTC', async () => {
  const config = JSON.parse(
    await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
  );

  assert.deepEqual(config.crons, [
    {
      path: '/api/cron/rebuild',
      schedule: '0 11 * * *',
    },
  ]);
});

test('GitHub schedules a second production rebuild after the expiration boundary', async () => {
  const workflow = await readFile(
    new URL('../.github/workflows/daily-expiration-rebuild.yml', import.meta.url),
    'utf8',
  );

  assert.match(workflow, /cron: '5 11 \* \* \*'/);
  assert.match(workflow, /secrets\.EXPIRATION_REBUILD_HOOK_URL/);
  assert.doesNotMatch(workflow, /https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\//);
});

test('cron endpoint rejects requests without the configured secret', async () => {
  let fetchCalls = 0;
  const handler = createRebuildHandler({
    environment: {
      CRON_SECRET: 'test-secret',
      EXPIRATION_REBUILD_HOOK_URL: deployHookUrl,
    },
    fetchImplementation: async () => {
      fetchCalls += 1;
      return new Response(null, { status: 201 });
    },
  });

  const response = await handler(createRequest());

  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(fetchCalls, 0);
  assert.deepEqual(await response.json(), { ok: false, error: 'unauthorized' });
});

test('cron endpoint triggers one deploy hook request when authorized', async () => {
  const requests = [];
  const handler = createRebuildHandler({
    environment: {
      CRON_SECRET: 'test-secret',
      EXPIRATION_REBUILD_HOOK_URL: deployHookUrl,
    },
    fetchImplementation: async (url, init) => {
      requests.push({ url, init });
      return new Response(null, { status: 201 });
    },
  });

  const response = await handler(createRequest('Bearer test-secret'));

  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true, status: 'queued' });
  assert.deepEqual(requests, [
    {
      url: deployHookUrl,
      init: { method: 'POST', redirect: 'error' },
    },
  ]);
});

test('cron endpoint fails closed when the deploy hook is missing or invalid', async () => {
  const invalidUrls = [
    undefined,
    'http://api.vercel.com/v1/integrations/deploy/project/hook',
    'https://example.com/hook',
  ];

  for (const invalidUrl of invalidUrls) {
    const handler = createRebuildHandler({
      environment: {
        CRON_SECRET: 'test-secret',
        EXPIRATION_REBUILD_HOOK_URL: invalidUrl,
      },
      fetchImplementation: async () => {
        assert.fail('fetch must not run for an invalid deploy hook');
      },
    });

    const response = await handler(createRequest('Bearer test-secret'));
    assert.equal(response.status, 503);
  }
});

test('cron endpoint reports a rejected deploy hook without leaking its response', async () => {
  const handler = createRebuildHandler({
    environment: {
      CRON_SECRET: 'test-secret',
      EXPIRATION_REBUILD_HOOK_URL: deployHookUrl,
    },
    fetchImplementation: async () =>
      new Response('sensitive upstream body', { status: 500 }),
  });

  const response = await handler(createRequest('Bearer test-secret'));

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { ok: false, error: 'rebuild_not_accepted' });
});
