import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

function assert(name, condition) {
  console.log(condition ? `PASS ${name}` : `FAIL ${name}`);
  return condition;
}

let ok = true;
const fail = (name) => {
  ok = false;
  console.log(`FAIL ${name}`);
};

const middleware = read('middleware.js');
const closed = read('closed.html');
const config = read('config.js');
const check = read('check/index.html');
const index = read('index.html');

ok = assert('middleware flag enabled', /export const PUBLIC_SITE_CLOSED = true/.test(middleware)) && ok;
ok = assert('middleware allows /check', /pathname === '\/check'/.test(middleware)) && ok;
ok = assert('middleware allows /config.js', /'\/config\.js'/.test(middleware)) && ok;
ok = assert('middleware allows legal routes', /'\/impressum'/.test(middleware) && /'\/datenschutz'/.test(middleware)) && ok;
ok = assert('middleware rewrites to closed.html', /\/closed\.html/.test(middleware)) && ok;

ok = assert('config PUBLIC_SITE_CLOSED true', /PUBLIC_SITE_CLOSED:\s*true/.test(config)) && ok;

ok = assert('closed copy headline', closed.includes('ASAS hat sich weiterentwickelt und ist momentan geschlossen.')) && ok;
ok = assert('closed copy note', closed.includes('Du hast aktuell keine Möglichkeit, Zugang zu erhalten.')) && ok;
ok = assert('closed no email field', !/<input/i.test(closed)) && ok;
ok = assert('closed footer legal links', closed.includes('href="/impressum"') && closed.includes('href="/widerruf"')) && ok;
ok = assert('closed has header shell', closed.includes('site-glass-header')) && ok;
ok = assert('closed has footer legal', closed.includes('Impressum')) && ok;
ok = assert('closed hero headline font', /closed-title[\s\S]*font-family:\s*var\(--hero-headline-font\)/.test(closed)) && ok;
ok = assert('closed fullscreen layout', /\.closed-page[\s\S]*min-height:\s*calc\(100dvh/.test(closed)) && ok;
ok = assert('closed uses ASAS background', /\.animated_bg/.test(closed)) && ok;

ok = assert('homepage preserved', index.includes('progress-check-teaser')) && ok;
ok = assert('check route preserved', check.includes('initProgressCheck')) && ok;
ok = assert('check still loads config.js', check.includes('src="/config.js"')) && ok;
ok = assert('check href /check unchanged', !check.includes('PUBLIC_SITE_CLOSED')) && ok;
ok = assert('legal checkout gate uses config flag', /PUBLIC_SITE_CLOSED/.test(read('legal-checkout-gate.js'))) && ok;
ok = assert('legal pages load checkout gate', read('impressum/index.html').includes('/legal-checkout-gate.js') && read('datenschutz/index.html').includes('/legal-checkout-gate.js')) && ok;

if (!ok) process.exit(1);

console.log('\nAll closed-state checks passed.');
