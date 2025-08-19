// npm i --save seo-middleware-nextjs
// IMPORT seo-middleware-nextjs
import { SEOMiddleware } from 'seo-middleware-nextjs';

// INITIATE SEOMiddleware CLASS
const seoMiddleware = new SEOMiddleware({
  auth: 'Basic dGVzdDp0ZXN0'
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
