# SEO Middleware for Next.js

__SEO Middleware__ is a lightweight Next.js package designed to improve SEO scores for traditional SERPs (a.k.a. Google, Bing, Yahoo, etc.) and modern AI agents and bots (a.k.a. ChatGPT, Grok, Perplexity, etc.).

This middleware is powered by [`ostr.io` pre-rendering engine](https://ostr.io/info/prerendering) and paired with the global CDN and smart caching layer. `seo-middleware-nextjs` establishes access to Pre-rendering Engine that significantly increases crawling budget, improves SEO scores, link previews, and Web Vitals/Lighthouse performance metrics (like TTFB) — all without changes in the existing codebase.

SEO middleware intelligently reroutes bot traffic to `ostr.io` rendering endpoints, minimizing server load, reducing database queries, and lowering infrastructure costs.

## Why SEO Middleware?

- 🕸 Executes JavaScript — get rendered HTML page and its content; Outperforms SSR and allows to reduce server load by disabling SSR;
- 🏎️ Expands Crawl Budget — Improves timings for dynamic and static pages via advanced CDN and caching;
- 🚀 Boosts Web Vitals and Lighthouse scores;
- 🎛️ Improves TTFB, LCP, INP, CLS, and other Web Vitals and LightHouse metrics positively enhancing overall SEO score;
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

- __[Detailed Pre-rendering Engine Documentation](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/README.md)__
- __Cloud Integrations__
  - [CloudFlare Worker Integration](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/cloudflare-worker.md)
  - [Netlify Integration](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/netlify-prerendering.md)
- __Web Server Integrations__
  - [Nginx Integration](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/nginx.md)
  - [Apache Integration](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/apache.md)
- __Related Packages__
  - [Node.js Integration via NPM package](https://github.com/veliovgroup/spiderable-middleware/blob/master/README.md)
  - [Meteor.js Integration via Atmosphere Package](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/meteor-atmosphere.md)

## ToC

- [Installation](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#installation)
- [Basic usage](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#usage)
- [__API__](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#api)
  - [Constructor `new SEOMiddleware()`](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#constructor)
  - [TS Types](https://github.com/veliovgroup/seo-middleware-nextjs?tab=readme-ov-file#types)
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

Setup SEO middleware in few lines of code, see [this ready to copy-paste `middleware.ts` file](https://github.com/veliovgroup/seo-middleware-nextjs/blob/master/examples/middleware.ts)

### Basic usage

Start with creating `middleware.ts` in `/src/` or root directory of Next.js project, then import `seo-middleware-nextjs` package:

```js
import { SEOMiddleware } from 'seo-middleware-nextjs';
```

Register middleware handle:

```js
// inside middleware.ts file:
import { SEOMiddleware } from 'seo-middleware-nextjs';

const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0'
});

// EXPORT MIDDLEWARE FUNCTION
export const middleware = seoMiddleware.createMiddleware();

// EXPORT config.matcher
// @see https://nextjs.org/docs/app/api-reference/file-conventions/middleware#matcher
export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known).*)'
};
```

> [!IMPORTANT]
> `config.matcher` can not be set to variable or changed/assigned during runtime; It can hold array of paths or RegExp-alike string, see [official Next.js middleware matcher docs](https://nextjs.org/docs/app/api-reference/file-conventions/middleware#matcher) for more details


> [!TIP]
> The API credentials and instructions can be found in "Integration Guide" of [Pre-rendering Panel](https://ostr.io/service/prerender), — click on the name of a website, then on <kbd>Integration Guide</kbd>

## API

Create new `SEOMiddleware` instance in `/src/middleware.ts` file.

### *Constructor*

```ts
new SEOMiddleware(opts: SEOMiddlewareOptions);
```

- `opts` {*SEOMiddlewareOptions*} - Configuration options
- `opts.auth` {*string*} - Auth string in the next format: `Basic xxx...xxx`. Can be set via an environment variables: `SPIDERABLE_SERVICE_AUTH` or `PRERENDER_SERVICE_AUTH` or `OSTR_AUTH`.
- `opts.renderingEndpoint` {*string*} - Valid URL to Pre-rendering engine. Default: `https://render.ostr.io`
- `opts.keepGetQuery` {*Boolean*} — Toggle support for get-query. Default `true`; It's safe to set to `false` if your app doesn't use get-query for its functionality
- `opts.supportEscapedFragment` {*Boolean*} — Toggle support for `?_escaped_fragment_=` get query. Default `true` (*recommended to keep it `true`*)
- `opts.retries` {*number*} — Amount of retries sending request to pre-rendering engine in case of the failure. Default: `2`
- `opts.ignoredPaths` {*RegExp|false*} - Regular Expression with paths that should get ignored by SEO Middleware. Default `false`
- `opts.botAgents` {*string[]*} - An array of strings (case insensitive) with additional User-Agent names of crawlers that needs to get intercepted. The default list includes all modern crawler's User-Agents, see `import {BOT_AGENTS}` for more datils
- `opts.ignoredExtensions` {*string[]*} — An array of strings with static files extensions that should get ignored by SEO Middleware. The default value holds all modern files extensions
- `opts.logger` {*Console|Winston|Pino*} — Logger facility for info messages, warnings, and errors. Default: `console`

```ts
// inside middleware.ts file:
import { SEOMiddleware } from 'seo-middleware-nextjs';

// INITIATE SEOMiddleware CLASS
const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0',
  renderingEndpoint: 'https://render.ostr.io',
  ignoredPaths: /\/images\/|\/uploads\//,
  supportEscapedFragment: true,
  keepGetQuery: true,
  retries: 4,
});

// EXPORT MIDDLEWARE FUNCTION
export const middleware = seoMiddleware.createMiddleware();

// EXPORT config.matcher
// THIS ONE EXCLUDES ALL STATIC AND API ENDPOINTS
// ADD ANY OTHER URLs THAT SHOULD BE EXCLUDED FROM PRE-RENDERING
// OR USE IS AS "ONLY" PATHs MATCHING, EX.: '/(articles/?.*|products/?.*|only-this-path)' {string}
// @see https://nextjs.org/docs/app/api-reference/file-conventions/middleware#matcher
export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known).*)'
};
```

> [!TIP]
> We provide various options for `renderingEndpoint` as "[Rendering Endpoints](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/rendering-endpoints.md)", each endpoint has its own features to fit different project needs

### Types

Full list of exported types

```ts
export declare const IGNORE_EXTENSIONS: string[];
export declare const BOT_AGENTS: string[];
export type SEOMiddlewareLogger = Pick<Console, 'debug' | 'info' | 'warn' | 'error' | 'log'>;

export interface SEOMiddlewareOptions {
  auth?: string;
  supportEscapedFragment?: Boolean;
  keepGetQuery?: Boolean;
  ignoredPaths?: false | RegExp;
  logger?: SEOMiddlewareLogger;
  ignoredExtensions?: string[];
  botAgents?: string[];
  renderingEndpoint?: string;
  retries?: number;
  debug?: Boolean;
}

export declare class SEOMiddleware {
  auth: string;
  supportEscapedFragment: Boolean;
  keepGetQuery: Boolean;
  ignoredPaths: false | RegExp;
  logger: SEOMiddlewareLogger;
  ignoredExtensions: Set<string>;
  botAgents: AhoCorasick;
  renderingEndpoint: string;
  renderingBase: string;
  retries: number;
  debug: boolean;
  constructor(opts: SEOMiddlewareOptions);
  createMiddleware(): (req: NextRequest) => unknown;
}
```

### Configuration via env.vars

Authentication token can be set via various environment variables:

```sh
OSTRIO_AUTH='Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
PRERENDER_SERVICE_AUTH='Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
SPIDERABLE_SERVICE_AUTH='Basic xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

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

For more details on `IS_RENDERED` variable and other available optimizations [see this documentation](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/optimization.md#speed-up-rendering)

## Detect request from Pre-rendering engine during runtime

Pre-rendering engine will set `window.IS_PRERENDERING` global variable to `true`. Detecting requests from pre-rendering engine is easy as:

```ts
if (window.IS_PRERENDERING) {
  // This request is coming from Pre-rendering engine
}
```

For more details on `IS_PRERENDERING` variable [see this documentation](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/detect-prerendering.md)

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

For more details on `IS_PRERENDERING_TYPE` variable [see this documentation](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/detect-prerendering.md#detect-type-of-the-pre-rendering-engine)

## Debugging

1. To enable debug messages set `opts.debug = true` or `DEBUG=true` environment variable.
2. Remove `export config.matcher` to exclude its misconfiguration

Additionally:

- Set `auth` to `Basic dGVzdDp0ZXN0` (*credentials for testing*)
- Set `renderingEndpoint` to `https://render-bypass.ostr.io` avoiding cached results, [read more about rendering endpoints](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/rendering-endpoints.md)

```ts
import { SEOMiddleware } from 'seo-middleware-nextjs';

const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0',
  renderingEndpoint: 'https://render-bypass.ostr.io',
  debug: true,
});

export const middleware = seoMiddleware.createMiddleware();
```

----

__Read [Full Pre-rendering Engine Documentation](https://github.com/veliovgroup/ostrio/blob/master/docs/prerendering/README.md)__
