// /middleware.ts OR /src/middleware.ts FOR Next.js 13, 14, AND 15
// FOR Next.js 16 AND NEWER USE proxy.ts, SEE ./proxy.ts
// npm i --save seo-middleware-nextjs
// IMPORT seo-middleware-nextjs
import { SEOMiddleware } from 'seo-middleware-nextjs';

// INITIATE SEOMiddleware CLASS
// `auth` ACCEPTS "Basic xxx" OR "user:pass", OR OMIT IT AND SET OSTR_AUTH ENV VARIABLE
const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0'
});

// EXPORT MIDDLEWARE FUNCTION
export const middleware = seoMiddleware.createMiddleware();

// EXPORT config.matcher
// THIS ONE EXCLUDES ALL STATIC AND API ENDPOINTS
// ADD ANY OTHER URLs THAT SHOULD BE EXCLUDED FROM PRE-RENDERING
// OR USE IS AS "ONLY" PATHs MATCHING, EX.: '/(articles/?.*|products/?.*|only-this-path)' {string}
// @see https://nextjs.org/docs/15/app/api-reference/file-conventions/middleware#matcher
export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known|favicon.ico).*)'
};
