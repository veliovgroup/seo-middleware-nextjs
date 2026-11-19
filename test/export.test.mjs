import assert from 'node:assert/strict';
import test from 'node:test';

test('published ESM entry imports successfully', async () => {
  const mod = await import('../dist/index.js');

  assert.equal(typeof mod.SEOMiddleware, 'function');
  assert.ok(Array.isArray(mod.IGNORE_EXTENSIONS));
  assert.ok(Array.isArray(mod.BOT_AGENTS));
});

test('ignoredPaths stays deterministic with global regex', async () => {
  const { SEOMiddleware } = await import('../dist/index.js');
  const originalFetch = globalThis.fetch;
  let fetches = 0;

  globalThis.fetch = async () => {
    fetches++;
    return new Response('<html></html>', {
      headers: { 'content-type': 'text/html' },
    });
  };

  try {
    const seoMiddleware = new SEOMiddleware({
      auth: 'Basic dGVzdDp0ZXN0',
      botAgents: ['testbot'],
      ignoredPaths: /\/private/g,
    });
    const middleware = seoMiddleware.createMiddleware();

    await middleware(createNextRequest('https://example.com/private'));
    await middleware(createNextRequest('https://example.com/private'));

    assert.equal(fetches, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function createNextRequest(url) {
  const nextUrl = new URL(url);
  nextUrl.clone = () => {
    const cloned = new URL(nextUrl.toString());
    cloned.clone = nextUrl.clone;
    return cloned;
  };

  return {
    method: 'GET',
    headers: new Headers({ 'user-agent': 'testbot' }),
    nextUrl,
  };
}
