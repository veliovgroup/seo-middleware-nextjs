// /proxy.ts OR /src/proxy.ts FOR Next.js 16 AND NEWER
// FOR Next.js 13-15 USE middleware.ts, SEE ./middleware.ts
// npm i --save seo-middleware-nextjs
// IMPORT seo-middleware-nextjs
import { SEOMiddleware } from 'seo-middleware-nextjs';

// INITIATE SEOMiddleware CLASS
// `auth` ACCEPTS "Basic xxx" OR "user:pass", OR OMIT IT AND SET OSTR_AUTH ENV VARIABLE
const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0'
});

// EXPORT PROXY FUNCTION
export const proxy = seoMiddleware.createMiddleware();

// EXPORT config.matcher
// THIS ONE EXCLUDES ALL STATIC AND API ENDPOINTS
// ADD ANY OTHER URLs THAT SHOULD BE EXCLUDED FROM PRE-RENDERING
// OR USE IS AS "ONLY" PATHs MATCHING, EX.: '/(articles/?.*|products/?.*|only-this-path)' {string}
// @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  matcher: '/((?!api|_next/static|_next/image|_next/webpack-hmr|\\.well-known|favicon.ico).*)'
};
