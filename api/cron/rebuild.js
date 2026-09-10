const deployHookPathPrefix = '/v1/integrations/deploy/';

function jsonResponse(body, status) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function isValidDeployHookUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'api.vercel.com' &&
      url.pathname.startsWith(deployHookPathPrefix)
    );
  } catch {
    return false;
  }
}

export function createRebuildHandler({ environment = process.env, fetchImplementation = fetch } = {}) {
  return async function handleRebuild(request) {
    const cronSecret = environment.CRON_SECRET;

    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
      return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
    }

    const deployHookUrl = environment.EXPIRATION_REBUILD_HOOK_URL;

    if (!isValidDeployHookUrl(deployHookUrl)) {
      return jsonResponse({ ok: false, error: 'rebuild_not_configured' }, 503);
    }

    try {
      const response = await fetchImplementation(deployHookUrl, {
        method: 'POST',
        redirect: 'error',
      });

      if (!response.ok) {
        return jsonResponse({ ok: false, error: 'rebuild_not_accepted' }, 502);
      }

      return jsonResponse({ ok: true, status: 'queued' }, 202);
    } catch {
      return jsonResponse({ ok: false, error: 'rebuild_not_accepted' }, 502);
    }
  };
}

export const GET = createRebuildHandler();
