import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import { after, afterEach, before, describe, test } from 'node:test';
import { NextRequest } from 'next/server.js';
import { BOT_AGENTS, IGNORE_EXTENSIONS, SEOMiddleware } from '../dist/index.js';

const AUTH = 'Basic dGVzdDp0ZXN0';
const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const HUMAN_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const ENV_KEYS = ['PRERENDER_SERVICE_AUTH', 'SPIDERABLE_SERVICE_AUTH', 'OSTR_AUTH', 'DEBUG'];
const originalFetch = globalThis.fetch;
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

const restoreEnv = () => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
};

for (const key of ENV_KEYS) {
  delete process.env[key];
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
});

after(restoreEnv);

const createLogger = () => {
  const calls = [];
  const record = (level) => (...args) => calls.push({ level, args });
  return {
    calls,
    debug: record('debug'),
    info: record('info'),
    warn: record('warn'),
    error: record('error'),
    log: record('log'),
    text: () => calls.map((call) => call.args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg) ?? String(arg))).join(' ')).join('\n'),
  };
};

const createRequest = (url, { ua = BOT_UA, method = 'GET', headers = {} } = {}) => {
  const allHeaders = { ...headers };
  if (ua) {
    allHeaders['user-agent'] = ua;
  }
  return new NextRequest(url, { method, headers: allHeaders });
};

const isPassThrough = (res) => res.headers.get('x-middleware-next') === '1';

// Replaces global fetch, records every call and answers with `handler`
const mockFetch = (handler = () => renderedPage()) => {
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    calls.push({ url: new URL(input.toString()), init });
    return handler(calls.length, input, init);
  };
  return calls;
};

const renderedPage = (body = '<html><body>rendered</body></html>', init = {}) => new Response(body, {
  status: 200,
  ...init,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'x-prerender-id': 'abc',
    ...(init.headers || {}),
  },
});

const createMiddleware = (opts = {}) => {
  const logger = opts.logger || createLogger();
  const seo = new SEOMiddleware({ auth: AUTH, logger, ...opts });
  return { seo, logger, middleware: seo.createMiddleware() };
};

// Local stand-in for the rendering endpoint, used where real fetch() behavior matters
let server;
let serverURL;
let serverHandler = (req, res) => res.end();
const serverRequests = [];

before(async () => {
  server = http.createServer((req, res) => {
    serverRequests.push({ method: req.method, url: req.url, headers: req.headers });
    serverHandler(req, res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  serverURL = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
});

describe('exports', () => {
  test('BOT_AGENTS and IGNORE_EXTENSIONS are lowercase string lists', () => {
    assert.ok(BOT_AGENTS.length > 200);
    assert.ok(IGNORE_EXTENSIONS.length > 300);
    for (const entry of [...BOT_AGENTS, ...IGNORE_EXTENSIONS]) {
      assert.equal(entry, entry.toLowerCase());
      assert.ok(entry.length > 0);
    }
    assert.ok(!IGNORE_EXTENSIONS.includes('xml'));
    assert.ok(!IGNORE_EXTENSIONS.includes('json'));
  });

  test('built file uses Web APIs only, so it runs in the Edge runtime', async () => {
    const source = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /from ['"]node:/);
    assert.doesNotMatch(source, /\brequire\(/);
    assert.doesNotMatch(source, /\bBuffer\b/);
    assert.doesNotMatch(source, /AbortSignal\.timeout/);
  });
});

describe('constructor', () => {
  test('throws without auth', () => {
    assert.throws(() => new SEOMiddleware({}), /missing \{auth\} option/);
    assert.throws(() => new SEOMiddleware(), /missing \{auth\} option/);
    assert.throws(() => new SEOMiddleware({ auth: '   ' }), /missing \{auth\} option/);
  });

  test('sends a "Basic xxx" value as is', () => {
    assert.equal(new SEOMiddleware({ auth: AUTH }).auth, AUTH);
    assert.equal(new SEOMiddleware({ auth: ` ${AUTH} ` }).auth, AUTH);
    assert.equal(new SEOMiddleware({ auth: 'basic dGVzdDp0ZXN0' }).auth, 'basic dGVzdDp0ZXN0');
  });

  test('base64-encodes a "user:pass" pair as UTF-8', () => {
    assert.equal(new SEOMiddleware({ auth: 'test:test' }).auth, AUTH);
    assert.equal(new SEOMiddleware({ auth: 'user:pässwörd' }).auth, `Basic ${Buffer.from('user:pässwörd').toString('base64')}`);
  });

  test('rejects values that are neither "Basic xxx" nor "user:pass"', () => {
    assert.throws(() => new SEOMiddleware({ auth: 'dGVzdDp0ZXN0' }), /misconfigured/);
    assert.throws(() => new SEOMiddleware({ auth: 'Basic' }), /misconfigured/);
  });

  test('reads auth from env variables in order: PRERENDER_SERVICE_AUTH, SPIDERABLE_SERVICE_AUTH, OSTR_AUTH', () => {
    process.env.OSTR_AUTH = 'ostr:auth';
    assert.equal(new SEOMiddleware().auth, `Basic ${btoa('ostr:auth')}`);
    process.env.SPIDERABLE_SERVICE_AUTH = 'Basic spiderable';
    assert.equal(new SEOMiddleware().auth, 'Basic spiderable');
    process.env.PRERENDER_SERVICE_AUTH = 'Basic prerender';
    assert.equal(new SEOMiddleware().auth, 'Basic prerender');
    assert.equal(new SEOMiddleware({ auth: AUTH }).auth, AUTH);
  });

  test('applies defaults', () => {
    const seo = new SEOMiddleware({ auth: AUTH });
    assert.equal(seo.rootURL, false);
    assert.equal(seo.renderingEndpoint, 'https://render.ostr.io');
    assert.equal(seo.supportEscapedFragment, true);
    assert.equal(seo.keepGetQuery, true);
    assert.equal(seo.ignoredPaths, false);
    assert.equal(seo.retries, 2);
    assert.equal(seo.timeout, 20000);
    assert.equal(seo.debug, false);
    assert.equal(seo.logger, console);
  });

  test('strips trailing slashes from rootURL and renderingEndpoint', () => {
    const seo = new SEOMiddleware({ auth: AUTH, rootURL: 'https://example.com/', renderingEndpoint: 'https://render-bypass.ostr.io/' });
    assert.equal(seo.rootURL, 'https://example.com');
    assert.equal(seo.renderingEndpoint, 'https://render-bypass.ostr.io');
  });

  test('warns and falls back to defaults on invalid retries and timeout', () => {
    for (const retries of [-1, 1.5, Number.NaN, '3']) {
      const logger = createLogger();
      assert.equal(new SEOMiddleware({ auth: AUTH, logger, retries }).retries, 2);
      assert.match(logger.text(), /\{retries\} must be a non-negative integer/);
    }
    for (const timeout of [0, -5, Number.POSITIVE_INFINITY, Number.NaN, '100']) {
      const logger = createLogger();
      assert.equal(new SEOMiddleware({ auth: AUTH, logger, timeout }).timeout, 20000);
      assert.match(logger.text(), /\{timeout\} must be a positive number/);
    }
    assert.equal(new SEOMiddleware({ auth: AUTH, retries: 0 }).retries, 0);
    assert.equal(new SEOMiddleware({ auth: AUTH, timeout: 5000 }).timeout, 5000);
  });

  test('debug logs never contain the auth token', async () => {
    mockFetch();
    const logger = createLogger();
    const seo = new SEOMiddleware({ auth: 'secret-user:secret-pass', logger, debug: true });
    await seo.createMiddleware()(createRequest('https://example.com/page'));
    const text = logger.text();
    assert.match(text, /\[DEBUG\] \[new SEOMiddleware\(\)\]/);
    assert.doesNotMatch(text, /secret/);
    assert.ok(!text.includes(seo.auth));
    assert.ok(!text.includes(btoa('secret-user:secret-pass')));
  });

  test('DEBUG=true env variable enables debug logs', () => {
    process.env.DEBUG = 'true';
    assert.equal(new SEOMiddleware({ auth: AUTH }).debug, true);
  });
});

describe('bot detection', () => {
  test('passes humans and requests without User-Agent to the app', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/', { ua: HUMAN_UA }))));
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/', { ua: '' }))));
    assert.equal(calls.length, 0);
  });

  test('renders bots and returns the rendered page', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    const res = await middleware(createRequest('https://example.com/page'));
    assert.equal(res.status, 200);
    assert.equal(await res.text(), '<html><body>rendered</body></html>');
    assert.ok(!isPassThrough(res));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url.origin, 'https://render.ostr.io');
    assert.equal(calls[0].url.searchParams.get('url'), 'https://example.com/page');
  });

  test('matches case-insensitively and sends the original User-Agent', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    const ua = 'Mozilla/5.0 (compatible; GoogleBot/2.1)';
    await middleware(createRequest('https://example.com/', { ua }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url.searchParams.get('bot'), ua);
    assert.equal(calls[0].init.headers.get('user-agent'), ua);
  });

  test('custom botAgents replace the defaults and match case-insensitively', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ botAgents: ['MyCrawler', ''] });
    assert.ok(!isPassThrough(await middleware(createRequest('https://example.com/', { ua: 'mycrawler/1.0' }))));
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/', { ua: BOT_UA }))));
    assert.equal(calls.length, 1);
  });

  test('extending the default list with BOT_AGENTS keeps default bots', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ botAgents: [...BOT_AGENTS, 'mycrawler'] });
    await middleware(createRequest('https://example.com/', { ua: 'MyCrawler/1.0' }));
    await middleware(createRequest('https://example.com/', { ua: BOT_UA }));
    assert.equal(calls.length, 2);
  });
});

describe('ignored requests', () => {
  test('only GET and HEAD are rendered', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    for (const method of ['POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']) {
      assert.ok(isPassThrough(await middleware(createRequest('https://example.com/', { method }))), method);
    }
    assert.equal(calls.length, 0);
  });

  test('static files are passed to the app, case-insensitively', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    for (const path of ['/app.js', '/style.CSS', '/img/photo.jpeg', '/.DS_Store', '/file.tar.gz']) {
      assert.ok(isPassThrough(await middleware(createRequest(`https://example.com${path}`))), path);
    }
    assert.equal(calls.length, 0);
  });

  test('sitemaps, JSON, and dotted path segments stay eligible', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    for (const path of ['/sitemap.xml', '/data.json', '/v1.2/page', '/page']) {
      assert.ok(!isPassThrough(await middleware(createRequest(`https://example.com${path}`))), path);
    }
    assert.equal(calls.length, 4);
  });

  test('custom ignoredExtensions replace the defaults', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ ignoredExtensions: ['xml'] });
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/sitemap.xml'))));
    assert.ok(!isPassThrough(await middleware(createRequest('https://example.com/app.js'))));
    assert.equal(calls.length, 1);
  });

  test('/.well-known/ paths and ostr.io hosts are passed to the app', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/.well-known/acme-challenge/token'))));
    assert.ok(isPassThrough(await middleware(createRequest('https://ostr.io/page'))));
    assert.ok(isPassThrough(await middleware(createRequest('https://render.ostr.io/page'))));
    assert.ok(!isPassThrough(await middleware(createRequest('https://notostr.io/page'))));
    assert.equal(calls.length, 1);
  });

  test('ignoredPaths, including RegExp with the global flag', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ ignoredPaths: /^\/(admin|private)\//g });
    for (let i = 0; i < 3; i++) {
      assert.ok(isPassThrough(await middleware(createRequest('https://example.com/admin/users'))));
      assert.ok(isPassThrough(await middleware(createRequest('https://example.com/Private/page'))));
    }
    assert.ok(!isPassThrough(await middleware(createRequest('https://example.com/public/page'))));
    assert.equal(calls.length, 1);
  });
});

describe('_escaped_fragment_', () => {
  test('renders the rebuilt URL for any visitor', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware();
    await middleware(createRequest('https://example.com/blog/?_escaped_fragment_=/post/1&lang=en', { ua: HUMAN_UA }));
    await middleware(createRequest('https://example.com/blog?_escaped_fragment_=', { ua: HUMAN_UA }));
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url.searchParams.get('url'), 'https://example.com/blog/post/1?lang=en');
    assert.equal(calls[1].url.searchParams.get('url'), 'https://example.com/blog');
  });

  test('goes through method, static, ignoredPaths, and .well-known checks', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ ignoredPaths: /^\/admin/ });
    const cases = [
      createRequest('https://example.com/?_escaped_fragment_=/page', { method: 'POST', ua: HUMAN_UA }),
      createRequest('https://example.com/app.js?_escaped_fragment_=/page', { ua: HUMAN_UA }),
      createRequest('https://example.com/?_escaped_fragment_=/app.js', { ua: HUMAN_UA }),
      createRequest('https://example.com/admin?_escaped_fragment_=/page', { ua: HUMAN_UA }),
      createRequest('https://example.com/?_escaped_fragment_=/admin/page', { ua: HUMAN_UA }),
      createRequest('https://example.com/.well-known/x?_escaped_fragment_=', { ua: HUMAN_UA }),
    ];
    for (const req of cases) {
      assert.ok(isPassThrough(await middleware(req)), req.url);
    }
    assert.equal(calls.length, 0);
  });

  test('with supportEscapedFragment: false the query is a regular query', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ supportEscapedFragment: false, ignoredPaths: /^\/admin/ });
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/?_escaped_fragment_=/page', { ua: HUMAN_UA }))));
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/app.js?_escaped_fragment_=', { ua: BOT_UA }))));
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/admin?_escaped_fragment_=', { ua: BOT_UA }))));
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/?_escaped_fragment_=', { ua: BOT_UA, method: 'POST' }))));
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/.well-known/x?_escaped_fragment_=', { ua: BOT_UA }))));
    assert.equal(calls.length, 0);

    await middleware(createRequest('https://example.com/page?_escaped_fragment_=/x', { ua: BOT_UA }));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url.searchParams.get('url'), 'https://example.com/page?_escaped_fragment_=/x');
  });

  test('a rebuilt URL that does not parse is passed to the app', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ rootURL: 'not a url' });
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/?_escaped_fragment_=/page', { ua: HUMAN_UA }))));
    assert.equal(calls.length, 0);
  });
});

describe('render request', () => {
  test('keeps the query by default and drops it with keepGetQuery: false', async () => {
    const calls = mockFetch();
    await createMiddleware().middleware(createRequest('https://example.com/search?q=a%20b&page=2'));
    await createMiddleware({ keepGetQuery: false }).middleware(createRequest('https://example.com/search?q=a'));
    await createMiddleware().middleware(createRequest('https://example.com/search?'));
    assert.equal(calls[0].url.searchParams.get('url'), 'https://example.com/search?q=a%20b&page=2');
    assert.equal(calls[1].url.searchParams.get('url'), 'https://example.com/search');
    assert.equal(calls[2].url.searchParams.get('url'), 'https://example.com/search');
  });

  test('uses rootURL instead of the request origin, and a custom renderingEndpoint', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ rootURL: 'https://www.example.com/', renderingEndpoint: 'https://render-bypass.ostr.io/' });
    await middleware(createRequest('http://localhost:3000/page?x=1'));
    assert.equal(calls[0].url.origin, 'https://render-bypass.ostr.io');
    assert.equal(calls[0].url.pathname, '/');
    assert.equal(calls[0].url.searchParams.get('url'), 'https://www.example.com/page?x=1');
  });

  test('forwards only auth, User-Agent, and Accept-Language headers', async () => {
    const calls = mockFetch();
    const { middleware } = createMiddleware({ auth: 'user:pass' });
    await middleware(createRequest('https://example.com/', { headers: { 'accept-language': 'de-DE', cookie: 'session=1', authorization: 'Bearer x' } }));
    const headers = calls[0].init.headers;
    assert.equal(headers.get('authorization'), `Basic ${btoa('user:pass')}`);
    assert.equal(headers.get('user-agent'), BOT_UA);
    assert.equal(headers.get('accept-language'), 'de-DE');
    assert.equal(headers.get('cookie'), null);
    assert.deepEqual([...headers.keys()].sort(), ['accept-language', 'authorization', 'user-agent']);
  });

  test('does not follow redirects', async () => {
    const calls = mockFetch();
    await createMiddleware().middleware(createRequest('https://example.com/'));
    assert.equal(calls[0].init.redirect, 'manual');
    assert.equal(calls[0].init.method, 'GET');
  });

  test('a renderingEndpoint that does not parse falls back to the app', async () => {
    const calls = mockFetch();
    const { middleware, logger } = createMiddleware({ renderingEndpoint: 'not a url' });
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/'))));
    assert.equal(calls.length, 0);
    assert.match(logger.text(), /FAILED TO BUILD renderUrl/);
  });
});

describe('rendered response', () => {
  test('drops hop-by-hop, CDN, cookie, and x-middleware-* headers', async () => {
    mockFetch(() => renderedPage('ok', {
      headers: {
        'set-cookie': 'a=1',
        connection: 'keep-alive',
        'keep-alive': 'timeout=5',
        'cf-ray': '1',
        server: 'nginx',
        'x-prerender-status': '200',
        'x-middleware-rewrite': 'https://evil.example',
        'x-middleware-next': '1',
        'cache-control': 'public, max-age=60',
        'x-custom': 'kept',
      },
    }));
    const res = await createMiddleware().middleware(createRequest('https://example.com/'));
    for (const header of ['set-cookie', 'connection', 'keep-alive', 'cf-ray', 'server', 'x-prerender-status', 'x-middleware-rewrite', 'x-middleware-next']) {
      assert.equal(res.headers.get(header), null, header);
    }
    assert.equal(res.headers.get('cache-control'), 'public, max-age=60');
    assert.equal(res.headers.get('x-custom'), 'kept');
    assert.equal(res.headers.get('x-prerender-id'), 'abc');
    assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
  });

  test('passes statuses the page declared to the bot', async () => {
    for (const status of [404, 410, 451, 500, 503]) {
      mockFetch(() => renderedPage(`page ${status}`, { status }));
      const res = await createMiddleware().middleware(createRequest('https://example.com/'));
      assert.equal(res.status, status);
      assert.equal(await res.text(), `page ${status}`);
    }
    mockFetch(() => new Response('cached', { status: 500, headers: { 'x-prerender-cache': 'HIT' } }));
    assert.equal((await createMiddleware().middleware(createRequest('https://example.com/'))).status, 500);
  });

  test('passes 2xx and 3xx through without ostr.io headers', async () => {
    mockFetch(() => new Response('plain', { status: 200 }));
    const res = await createMiddleware().middleware(createRequest('https://example.com/'));
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'plain');
  });

  test('null-body statuses get no body', async () => {
    for (const status of [204, 304]) {
      mockFetch(() => new Response(null, { status, headers: { 'x-prerender-id': 'abc' } }));
      const res = await createMiddleware().middleware(createRequest('https://example.com/'));
      assert.equal(res.status, status);
      assert.equal(res.body, null);
    }
  });

  test('a 4xx without ostr.io headers is not a renderer failure', async () => {
    mockFetch(() => new Response('<h1>Not found</h1>', { status: 404, headers: { 'content-type': 'text/html' } }));
    const res = await createMiddleware().middleware(createRequest('https://example.com/'));
    assert.equal(res.status, 404);
  });

  test('a large text/plain 4xx is not a gateway error', async () => {
    const body = `Bad request! ${'x'.repeat(600)} [1234]`;
    mockFetch(() => new Response(body, { status: 400, headers: { 'content-type': 'text/plain', 'x-prerender-id': 'abc' } }));
    assert.equal((await createMiddleware().middleware(createRequest('https://example.com/'))).status, 400);
  });
});

describe('renderer failures fall back to the app', () => {
  test('5xx without X-Prerender-Id or X-Prerender-Cache', async () => {
    for (const status of [500, 502, 503, 504, 520]) {
      mockFetch(() => new Response('<html>Bad gateway</html>', { status, headers: { 'content-type': 'text/html' } }));
      const { middleware, logger } = createMiddleware();
      assert.ok(isPassThrough(await middleware(createRequest('https://example.com/'))), String(status));
      assert.match(logger.text(), /RENDERER INFRASTRUCTURE ERROR/);
    }
  });

  test('a response carrying X-Prerender-Reason', async () => {
    mockFetch(() => new Response('', { status: 429, headers: { 'x-prerender-reason': 'rate-limit', 'x-prerender-id': 'abc' } }));
    assert.ok(isPassThrough(await createMiddleware().middleware(createRequest('https://example.com/'))));
  });

  test('the gateway\'s own text/plain errors, with an auth hint on 401/403', async () => {
    const errors = [
      [401, 'Unauthorized! Check your credentials [4010]'],
      [403, 'Not permitted for this domain. Wrong domain. [4030]'],
      [400, 'Bad request! [4000]'],
      [502, 'Origin is unreachable! [5020]'],
    ];
    for (const [status, body] of errors) {
      mockFetch(() => new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'x-prerender-id': 'abc' } }));
      const { middleware, logger } = createMiddleware();
      assert.ok(isPassThrough(await middleware(createRequest('https://example.com/'))), body);
      assert.match(logger.text(), /RENDERER ERROR/);
      if (status === 401 || status === 403) {
        assert.match(logger.text(), /CHECK THE \{auth\} OPTION/);
      }
    }
  });

  test('network errors are retried up to `retries` attempts in total', async () => {
    const failing = () => {
      throw new TypeError('fetch failed');
    };

    let calls = mockFetch((n) => (n === 1 ? failing() : renderedPage()));
    let res = await createMiddleware().middleware(createRequest('https://example.com/'));
    assert.equal(res.status, 200);
    assert.equal(calls.length, 2);

    calls = mockFetch(failing);
    const { middleware, logger } = createMiddleware();
    res = await middleware(createRequest('https://example.com/'));
    assert.ok(isPassThrough(res));
    assert.equal(calls.length, 2);
    assert.match(logger.text(), /AFTER 2 ATTEMPT\(S\)/);

    calls = mockFetch(failing);
    assert.ok(isPassThrough(await createMiddleware({ retries: 1 }).middleware(createRequest('https://example.com/'))));
    assert.equal(calls.length, 1);

    calls = mockFetch(failing);
    assert.ok(isPassThrough(await createMiddleware({ retries: 0 }).middleware(createRequest('https://example.com/'))));
    assert.equal(calls.length, 1);

    calls = mockFetch(failing);
    assert.ok(isPassThrough(await createMiddleware({ retries: 4 }).middleware(createRequest('https://example.com/'))));
    assert.equal(calls.length, 4);
  });

  test('a body that fails to read', async () => {
    mockFetch(() => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('<html>partial'));
        controller.error(new Error('connection reset'));
      },
    }), { status: 200, headers: { 'x-prerender-id': 'abc' } }));
    const { middleware, logger } = createMiddleware();
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/'))));
    assert.match(logger.text(), /FAILED TO READ RESPONSE BODY/);
  });

  test('unexpected errors inside the middleware', async () => {
    const calls = mockFetch();
    const { middleware, logger } = createMiddleware();
    const broken = { method: 'GET', headers: new Headers(), nextUrl: { clone() { throw new Error('boom'); } } };
    assert.ok(isPassThrough(await middleware(broken)));
    assert.match(logger.text(), /CAUGHT UNEXPECTED ERROR/);

    assert.equal(calls.length, 0);

    // A status the Response constructor rejects
    globalThis.fetch = async () => ({ status: 99, headers: new Headers(), arrayBuffer: async () => new ArrayBuffer(0) });
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/'))));
  });
});

describe('with a real HTTP renderer', () => {
  const renderer = (opts = {}) => createMiddleware({ renderingEndpoint: serverURL, ...opts });

  test('hands a 301 and its Location to the bot', async () => {
    serverHandler = (req, res) => {
      res.writeHead(301, { location: 'https://example.com/new-page', 'x-prerender-id': 'abc' });
      res.end('moved');
    };
    const res = await renderer().middleware(createRequest('https://example.com/old-page'));
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), 'https://example.com/new-page');
  });

  test('sends HEAD as HEAD and returns no body', async () => {
    serverRequests.length = 0;
    serverHandler = (req, res) => {
      res.writeHead(200, { 'content-type': 'text/html', 'x-prerender-id': 'abc' });
      res.end(req.method === 'HEAD' ? undefined : '<html>full</html>');
    };
    const res = await renderer().middleware(createRequest('https://example.com/page', { method: 'HEAD' }));
    assert.equal(res.status, 200);
    assert.equal(res.body, null);
    assert.equal(serverRequests.length, 1);
    assert.equal(serverRequests[0].method, 'HEAD');
    assert.equal(serverRequests[0].headers.authorization, AUTH);
  });

  test('a renderer that does not answer within `timeout` is not retried', async () => {
    serverRequests.length = 0;
    serverHandler = () => {};
    const { middleware, logger } = renderer({ timeout: 150, retries: 3 });
    const started = Date.now();
    const res = await middleware(createRequest('https://example.com/slow'));
    assert.ok(isPassThrough(res));
    assert.ok(Date.now() - started < 2000);
    assert.equal(serverRequests.length, 1);
    assert.match(logger.text(), /NO RESPONSE WITHIN 150ms/);
    server.closeAllConnections?.();
  });

  test('a body that stalls past `timeout` is not sent truncated', async () => {
    serverHandler = (req, res) => {
      res.writeHead(200, { 'content-type': 'text/html', 'x-prerender-id': 'abc' });
      res.write('<html><body>partial');
    };
    const { middleware, logger } = renderer({ timeout: 150 });
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/stall'))));
    assert.match(logger.text(), /RESPONSE BODY NOT RECEIVED WITHIN 150ms/);
    server.closeAllConnections?.();
  });

  test('a renderer that refuses connections is retried, then falls back', async () => {
    const closed = http.createServer();
    await new Promise((resolve) => closed.listen(0, '127.0.0.1', resolve));
    const port = closed.address().port;
    await new Promise((resolve) => closed.close(resolve));

    let attempts = 0;
    globalThis.fetch = (...args) => {
      attempts++;
      return originalFetch(...args);
    };
    const { middleware } = createMiddleware({ renderingEndpoint: `http://127.0.0.1:${port}` });
    assert.ok(isPassThrough(await middleware(createRequest('https://example.com/'))));
    assert.equal(attempts, 2);
  });
});
