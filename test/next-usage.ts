import { SEOMiddleware, type SEOMiddlewareOptions } from 'seo-middleware-nextjs';

const opts: SEOMiddlewareOptions = {
  auth: 'Basic dGVzdDp0ZXN0',
  rootURL: false,
  ignoredPaths: /\/api\//,
  retries: 1,
};

const seoMiddleware = new SEOMiddleware(opts);

export const middleware = seoMiddleware.createMiddleware();

export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known|favicon.ico).*)',
};
