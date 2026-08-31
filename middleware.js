export const PUBLIC_SITE_CLOSED = true;

const ALLOWED_EXACT = new Set([
  '/closed.html',
  '/config.js',
  '/impressum',
  '/datenschutz',
  '/agb',
  '/widerruf',
  '/impressum.html',
  '/datenschutz.html',
  '/agb.html',
  '/widerruf.html',
  '/abo-verwalten',
  '/abo-verwalten/',
]);

const ALLOWED_PREFIXES = [
  '/check/',
  '/_vercel/',
];

const ALLOWED_ASSET = /\.(svg|ico|png|jpg|jpeg|webp|gif|woff2?|txt|xml|css|js)$/i;

function isAllowedPath(pathname) {
  if (ALLOWED_EXACT.has(pathname)) return true;
  if (pathname === '/check') return true;
  for (const prefix of ALLOWED_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  if (ALLOWED_ASSET.test(pathname)) return true;
  return false;
}

function rewriteTo(url) {
  return new Response(null, {
    headers: {
      'x-middleware-rewrite': url.toString(),
    },
  });
}

export default function middleware(request) {
  if (!PUBLIC_SITE_CLOSED) return;

  const url = new URL(request.url);
  if (isAllowedPath(url.pathname)) return;

  return rewriteTo(new URL('/closed.html', url));
}

export const config = {
  matcher: ['/((?!_vercel/).*)'],
};
