# SEO Middleware for Next.js

__SEO Middleware__ is a lightweight Next.js package designed to improve SEO scores for traditional SERPs (a.k.a. Google, Bing, Yahoo, etc.) and modern AI agents and bots (a.k.a. ChatGPT, Grok, Perplexity, etc.).

This middleware is powered by [`ostr.io` pre-rendering engine](https://ostr.io/info/prerendering) and paired with the global CDN and smart caching layer. `seo-middleware-nextjs` establishes access to Pre-rendering Engine that significantly increases crawling budget, improves SEO scores, link previews, and Web Vitals/Lighthouse performance metrics (like TTFB) — all without changes in the existing codebase.

SEO middleware intelligently reroutes bot traffic to `ostr.io` rendering endpoints, minimizing server load, reducing database queries, and lowering infrastructure costs.

## Why SEO Middleware?

- 🕸 Executes JavaScript — get rendered HTML page and its content; Outperforms SSR and allows to reduce server load by disabling SSR;
- 🏎️ Expands Crawl Budget — Improves timings for dynamic and static pages via advanced CDN and caching;
- 🚀 Boosts Web Vitals and Lighthouse scores;
- 🎛️ Improves TTFB, LCP, INP, CLS, and other Web Vitals and Lighthouse metrics positively enhancing overall SEO score;
- 🖥 Supports PWAs and SPAs;
- 📱 Supports mobile-like crawlers;
- 💅 Supports [`styled-components`](https://styled-components.com);
- ⚡️ Supports [AMP (Accelerated Mobile Pages)](https://www.ampproject.org);
- 🤓 Works with `Content-Security-Policy` and other complex front-end security rules;
- 📦 This package implemented in strict TypeScript and exports all necessary types;
- ❤️ Search engines and social network crawlers love optimized pages that delivered in blazingly-fast manner;
- 📱 Consistent link previews in messaging apps, like iMessage, Messages, Facebook, Slack, Telegram, WhatsApp, Viber, VK, Twitter, and other apps;
- 💻 Image, title, and description previews for links posted at social networks, like Facebook, X/Twitter, Instagram, and other social networks.

## Related packages and docs

- __[Detailed Pre-rendering Engine Documentation](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md)__
- __Cloud Integrations__
  - [CloudFlare Worker Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/cloudflare-worker.md)
  - [Netlify Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/netlify-prerendering.md)
- __Web Server Integrations__
  - [Nginx Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/nginx.md)
  - [Apache Integration](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/apache.md)
- __Related Packages__
  - [Node.js Integration via NPM package](https://github.com/veliovgroup/spiderable-middleware/blob/master/README.md)
  - [Meteor.js Integration via Atmosphere Package](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/meteor-atmosphere.md)

## ToC

- [Installation](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#installation)
- [Basic usage](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#usage)
  - [Next.js 16 and newer: `proxy.ts`](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#nextjs-16-and-newer-proxyts)
  - [Next.js 13, 14, and 15: `middleware.ts`](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#nextjs-13-14-and-15-middlewarets)
- [__API__](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#api)
  - [Constructor `new SEOMiddleware()`](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#constructor)
  - [TS Types](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#types)
  - [Configuration via env.vars](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#configuration-via-envvars)
- [Failure handling](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#failure-handling)
- [Speed-up rendering](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#speed-up-rendering)
- [Detect request from Pre-rendering engine during runtime](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#detect-request-from-pre-rendering-engine-during-runtime)
- [Detect type of Pre-rendering engine](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#detect-type-of-the-pre-rendering-engine)
- [Debugging](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#debugging)

## About Package

This package works as an "edge function", intercepting requests from crawlers and social media bots received by Next.js application. It seamlessly proxies those requests to a pre-rendering engine, which returns fully-rendered static HTML — optimized for indexing and rich previews.

Built with developers in mind, `seo-middleware-nextjs` is lightweight, well-structured, and easy to customize. Whether you're scaling a production app or prototyping, it's designed to be hackable and flexible enough to fit any project. By offloading bot traffic to the pre-rendering engine, it helps reduce backend load and improve server performance effortlessly.

> [!TIP]
> This package was originally developed for pre-rendering engine by [`ostr.io`](https://ostr.io). But it's not limited to, and can proxy-pass requests to any other rendering-endpoint.

## Installation

Install [`seo-middleware-nextjs` package from NPM](https://www.npmjs.com/package/seo-middleware-nextjs):

```sh
# using npmjs
npm install seo-middleware-nextjs --save

# using yarn
yarn add seo-middleware-nextjs
```

## Usage

Setup SEO middleware in few lines of code, see ready to copy-paste [`proxy.ts`](https://github.com/veliovgroup/seo-middleware-nextjs/blob/master/examples/proxy.ts) (*Next.js 16 and newer*) and [`middleware.ts`](https://github.com/veliovgroup/seo-middleware-nextjs/blob/master/examples/middleware.ts) (*Next.js 13, 14, and 15*) files.

Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`, and the exported function from `middleware` to `proxy`. `middleware.ts` still works in Next.js 16, but it is deprecated. The package works with both, pick the file that matches the Next.js version of your project:

| Next.js | File | Export | Runtime |
| --- | --- | --- | --- |
| 16 and newer | `proxy.ts` | `proxy` | Node.js |
| 13, 14, 15 | `middleware.ts` | `middleware` | Edge (*Node.js is opt-in since 15.5*) |

The package uses only Web APIs (`fetch`, `Headers`, `URL`, `AbortController`, `btoa`), so the same code runs in the Edge and Node.js runtimes.

### Next.js 16 and newer: `proxy.ts`

Create `proxy.ts` in `/src/` or root directory of Next.js project, then import `seo-middleware-nextjs` package and export the `proxy` function:

```ts
// inside proxy.ts file:
import { SEOMiddleware } from 'seo-middleware-nextjs';

const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0'
});

// EXPORT PROXY FUNCTION
export const proxy = seoMiddleware.createMiddleware();

// EXPORT config.matcher
// @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known|favicon.ico).*)'
};
```

### Next.js 13, 14, and 15: `middleware.ts`

Create `middleware.ts` in `/src/` or root directory of Next.js project, then import `seo-middleware-nextjs` package and export the `middleware` function:

```ts
// inside middleware.ts file:
import { SEOMiddleware } from 'seo-middleware-nextjs';

const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0'
});

// EXPORT MIDDLEWARE FUNCTION
export const middleware = seoMiddleware.createMiddleware();

// EXPORT config.matcher
// @see https://nextjs.org/docs/15/app/api-reference/file-conventions/middleware#matcher
export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known|favicon.ico).*)'
};
```

> [!IMPORTANT]
> `config.matcher` cannot be set to variable or changed/assigned during runtime; It can hold array of paths or RegExp-alike string, see [official Next.js matcher docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher) for more details

> [!TIP]
> Upgrading to Next.js 16? Rename `middleware.ts` to `proxy.ts` and `export const middleware` to `export const proxy`. Nothing else changes in the `SEOMiddleware` setup

> [!TIP]
> The API credentials and instructions can be found in "Integration Guide" of [Pre-rendering Panel](https://ostr.io/service/prerender), — click on the name of a website, then on <kbd>Integration Guide</kbd>

## API

Create new `SEOMiddleware` instance in `proxy.ts` (*Next.js 16+*) or `middleware.ts` (*Next.js 13-15*) file.

### *Constructor*

```ts
new SEOMiddleware(opts?: SEOMiddlewareOptions);
```

`opts` {*SEOMiddlewareOptions*} is optional when the auth token is set via [environment variables](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#configuration-via-envvars). All options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `auth` | `string` | env variables | Auth for the rendering endpoint. Accepts the ready `Basic xxx...xxx` value from the [Pre-rendering Panel](https://ostr.io/service/prerender), sent as is, or a `user:pass` pair, base64-encoded by the package. Falls back to `PRERENDER_SERVICE_AUTH`, `SPIDERABLE_SERVICE_AUTH`, or `OSTR_AUTH` env variables, in this order. Required |
| `rootURL` | `false` \| `string` | `false` | FQDN URL to the root of your website. `false` auto-detects it from the `NextRequest` object |
| `renderingEndpoint` | `string` | `https://render.ostr.io` | Valid URL to Pre-rendering engine |
| `timeout` | `number` | `20000` | Time budget in milliseconds for the whole request to the rendering endpoint: all attempts plus reading the response body. When it runs out, the request is passed to the app |
| `retries` | `number` | `2` | Total number of attempts, `1` sends a single request. Only connection errors that happen before the rendering endpoint answered are retried, timeouts are not |
| `keepGetQuery` | `boolean` | `true` | Toggle support for get-query. It's safe to set to `false` if your app doesn't use get-query for its functionality |
| `supportEscapedFragment` | `boolean` | `true` | Toggle support for `?_escaped_fragment_=` get query (*recommended to keep it `true`*) |
| `ignoredPaths` | `RegExp` \| `false` | `false` | Regular Expression with paths that should get ignored by SEO Middleware. Tested against the lowercased path |
| `botAgents` | `string[]` | `BOT_AGENTS` | Case-insensitive User-Agent substrings of crawlers that need to get intercepted. Replaces the default list, to extend it pass `[...BOT_AGENTS, 'my-crawler']` |
| `ignoredExtensions` | `string[]` | `IGNORE_EXTENSIONS` | Lowercase static file extensions that should get ignored by SEO Middleware. Replaces the default list, to extend it pass `[...IGNORE_EXTENSIONS, 'ext']` |
| `logger` | `Console` \| `Winston` \| `Pino` | `console` | Logger facility for info messages, warnings, and errors |
| `debug` | `boolean` | `false` | Enable debug logs, also enabled by `DEBUG=true` env variable. Debug logs never include the auth token |

> [!NOTE]
> The default `timeout` of 20 seconds fits serverless limits: Vercel Edge Middleware must start a response within 25 seconds, so the package has time to pass the request to the app when rendering is slow. On a Node.js server without such limits a larger value is fine, for example `timeout: 60000`. Keep `timeout` below the execution limit of your hosting platform

```ts
// inside proxy.ts (Next.js 16+) or middleware.ts (Next.js 13-15) file:
import { SEOMiddleware, BOT_AGENTS } from 'seo-middleware-nextjs';

// INITIATE SEOMiddleware CLASS
const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0', // OR 'user:pass'
  rootURL: 'https://example.com',
  renderingEndpoint: 'https://render.ostr.io',
  ignoredPaths: /\/images\/|\/uploads\//,
  botAgents: [...BOT_AGENTS, 'my-crawler'],
  supportEscapedFragment: true,
  keepGetQuery: true,
  timeout: 20000,
  retries: 3,
});

// EXPORT PROXY FUNCTION (Next.js 16+)
export const proxy = seoMiddleware.createMiddleware();
// OR EXPORT MIDDLEWARE FUNCTION (Next.js 13-15)
// export const middleware = seoMiddleware.createMiddleware();

// EXPORT config.matcher
// THIS ONE EXCLUDES ALL STATIC AND API ENDPOINTS
// ADD ANY OTHER URLs THAT SHOULD BE EXCLUDED FROM PRE-RENDERING
// OR USE IS AS "ONLY" PATHs MATCHING, EX.: '/(articles/?.*|products/?.*|only-this-path)' {string}
// @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known).*)'
};
```

> [!TIP]
> We provide various options for `renderingEndpoint` as "[Rendering Endpoints](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md)", each endpoint has its own features to fit different project needs

### Types

Full list of exported types

```ts
export declare const IGNORE_EXTENSIONS: string[];
export declare const BOT_AGENTS: string[];
export type SEOMiddlewareLogger = Pick<Console, 'debug' | 'info' | 'warn' | 'error' | 'log'>;

export interface SEOMiddlewareOptions {
  auth?: string;
  rootURL?: false | string;
  supportEscapedFragment?: boolean;
  keepGetQuery?: boolean;
  ignoredPaths?: false | RegExp;
  logger?: SEOMiddlewareLogger;
  ignoredExtensions?: string[];
  botAgents?: string[];
  renderingEndpoint?: string;
  retries?: number;
  timeout?: number;
  debug?: boolean;
}

export declare class SEOMiddleware {
  auth: string;
  rootURL: false | string;
  supportEscapedFragment: boolean;
  keepGetQuery: boolean;
  ignoredPaths: false | RegExp;
  logger: SEOMiddlewareLogger;
  ignoredExtensions: Set<string>;
  botAgents: AhoCorasick;
  renderingEndpoint: string;
  renderingBase: string;
  retries: number;
  timeout: number;
  debug: boolean;
  constructor(opts?: SEOMiddlewareOptions);
  createMiddleware(): (req: NextRequest) => Promise<Response>;
}
```

### Configuration via env.vars

Authentication token can be set via various environment variables. The package reads the first one set, in this order: `PRERENDER_SERVICE_AUTH`, `SPIDERABLE_SERVICE_AUTH`, `OSTR_AUTH`. Each accepts the `Basic xxx` value or a `user:pass` pair:

```sh
OSTR_AUTH='Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
PRERENDER_SERVICE_AUTH='Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
SPIDERABLE_SERVICE_AUTH='user:pass'
```

With the token in an env variable, `auth` option can be omitted:

```ts
const seoMiddleware = new SEOMiddleware();
```

## Failure handling

A crawler always gets a page: when the rendering endpoint fails, the request is passed to the app with `NextResponse.next()`, as if the middleware was not there.

- Rendered page with 2xx status: returned to the crawler as is
- Redirect (301, 302, 307, 308): returned to the crawler with its `Location` header, the middleware does not follow it
- Status declared by the page itself (404, 410, 500, and others, see [genuine status code](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/genuine-status-code.md)): returned to the crawler as is
- Connection error before the rendering endpoint answered: retried until `retries` attempts are used, then passed to the app
- No complete response within `timeout`, including a response body that stalls: passed to the app, never retried. A partially received page never reaches the crawler
- Error of the rendering service itself (a response with `X-Prerender-Reason` header, or its plain-text error like `Bad request! ... [4000]`): passed to the app
- 5xx without `X-Prerender-Id` and `X-Prerender-Cache` headers, an error from the infrastructure in front of the rendering service: passed to the app
- 401 and 403 log a warning about the `auth` option

`HEAD` requests are sent to the rendering endpoint as `HEAD` and answered with headers only. Hop-by-hop, CDN, cookie, and `x-middleware-*` headers of the rendered response are not passed to the crawler.

## Speed-up rendering

To speed-up rendering, JS-runtime __should__ tell to the Pre-rendering engine when the page is ready. Initialize early in application's code `window.IS_RENDERED = false`, and once the page is ready set `window.IS_RENDERED` variable to `true`. Example:

```ts
// At the beginning of the client's bundle:
window.IS_RENDERED = false;

afterPageAndAssetsAreLoaded(() => {
  // Once page and assets are ready:
  window.IS_RENDERED = true;
});
```

For more details on `IS_RENDERED` variable and other available optimizations [see this documentation](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/optimization.md#speed-up-rendering)

## Detect request from Pre-rendering engine during runtime

Pre-rendering engine will set `window.IS_PRERENDERING` global variable to `true`. Detecting requests from pre-rendering engine is easy as:

```ts
if (window.IS_PRERENDERING) {
  // This request is coming from Pre-rendering engine
}
```

For more details on `IS_PRERENDERING` variable [see this documentation](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/detect-prerendering.md)

## Detect type of the Pre-rendering engine

Like browsers, — crawlers and bots may request page as "mobile" (small screen touch-devices) or as "desktop" (large screens without touch-events) the pre-rendering engine supports these two types. For cases when content needs to get optimized for different screens pre-rendering engine will set `window.IS_PRERENDERING_TYPE` global variable to `desktop` or `mobile`

```ts
if (window.IS_PRERENDERING_TYPE === 'mobile') {
  // This request is coming from "mobile" web crawler and "mobile" pre-rendering engine
} else if (window.IS_PRERENDERING_TYPE === 'desktop') {
  // This request is coming from "desktop" web crawler and "desktop" pre-rendering engine
} else {
  // This request is coming from user
}
```

For more details on `IS_PRERENDERING_TYPE` variable [see this documentation](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/detect-prerendering.md#detect-type-of-the-pre-rendering-engine)

## Debugging

1. To enable debug messages set `opts.debug = true` or `DEBUG=true` environment variable.
2. Remove `export config.matcher` to exclude its misconfiguration
3. On Next.js 16 and newer make sure the file is named `proxy.ts` and exports `proxy`; on Next.js 13-15 it must be `middleware.ts` exporting `middleware`

Additionally:

- Set `auth` to `Basic dGVzdDp0ZXN0` (*credentials for testing*)
- Set `renderingEndpoint` to `https://render-bypass.ostr.io` avoiding cached results, [read more about rendering endpoints](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/rendering-endpoints.md)

```ts
import { SEOMiddleware } from 'seo-middleware-nextjs';

const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0',
  renderingEndpoint: 'https://render-bypass.ostr.io',
  debug: true,
});

// `proxy` on Next.js 16+, `middleware` on Next.js 13-15
export const proxy = seoMiddleware.createMiddleware();
```

----

__Read [Full Pre-rendering Engine Documentation](https://github.com/ostr-io/ostrio-docs/blob/master/docs/prerendering/README.md)__
