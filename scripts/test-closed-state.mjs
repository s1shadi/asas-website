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

function parseClosedMode() {
  const raw = String(process.env.CLOSED_MODE || '0').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'closed';
}

function parseMiddlewareClosedFlag(source) {
  const match = source.match(/export const PUBLIC_SITE_CLOSED = (true|false)/);
  return match ? match[1] === 'true' : null;
}

function parseConfigClosedFlag(source) {
  const match = source.match(/PUBLIC_SITE_CLOSED:\s*(true|false)/);
  return match ? match[1] === 'true' : null;
}

const closedMode = parseClosedMode();
const modeLabel = closedMode ? 'closed' : 'open';

console.log(`Running closed-state checks in ${modeLabel} mode (CLOSED_MODE=${process.env.CLOSED_MODE || '0'})`);

let ok = true;
const middleware = read('middleware.js');
const closed = read('closed.html');
const config = read('config.js');
const check = read('check/index.html');
const index = read('index.html');
const gate = read('legal-checkout-gate.js');

const middlewareClosed = parseMiddlewareClosedFlag(middleware);
const configClosed = parseConfigClosedFlag(config);

if (closedMode) {
  ok = assert('middleware supports closed flag', middlewareClosed !== null) && ok;
  ok = assert('middleware allows /check', /pathname === '\/check'/.test(middleware)) && ok;
  ok = assert('middleware allows /config.js', /'\/config\.js'/.test(middleware)) && ok;
  ok = assert('middleware allows legal routes', /'\/impressum'/.test(middleware) && /'\/datenschutz'/.test(middleware)) && ok;
  ok = assert('middleware rewrites to closed.html', /\/closed\.html/.test(middleware)) && ok;
  ok = assert('config exposes PUBLIC_SITE_CLOSED flag', configClosed !== null) && ok;
  ok = assert('closed copy headline', closed.includes('ASAS hat sich weiterentwickelt und ist momentan geschlossen.')) && ok;
  ok = assert('closed copy note', closed.includes('Du hast aktuell keine Möglichkeit, Zugang zu erhalten.')) && ok;
  ok = assert('closed no email field', !/<input/i.test(closed)) && ok;
  ok = assert('closed footer legal links', closed.includes('href="/impressum"') && closed.includes('href="/widerruf"')) && ok;
  ok = assert('closed has header shell', closed.includes('site-glass-header')) && ok;
  ok = assert('closed has footer legal', closed.includes('Impressum')) && ok;
  ok = assert('closed hero headline font', /closed-title[\s\S]*font-family:\s*var\(--hero-headline-font\)/.test(closed)) && ok;
  ok = assert('closed fullscreen layout', /\.closed-page[\s\S]*min-height:\s*calc\(100dvh/.test(closed)) && ok;
  ok = assert('closed uses ASAS background', /\.animated_bg/.test(closed)) && ok;
  ok = assert('legal checkout gate uses config flag', /PUBLIC_SITE_CLOSED/.test(gate)) && ok;
  ok = assert('closed page disables checkout CTA markup', closed.includes('site-glass-header__cta')) && ok;
} else {
  ok = assert('middleware flag open for live', middlewareClosed === false) && ok;
  ok = assert('config PUBLIC_SITE_CLOSED false', configClosed === false) && ok;
  ok = assert('middleware still defines closed rewrite path', /\/closed\.html/.test(middleware)) && ok;
  ok = assert('middleware still allows /check when closed', /pathname === '\/check'/.test(middleware)) && ok;
  ok = assert('legal checkout gate script present', gate.includes('PUBLIC_SITE_CLOSED')) && ok;
}

ok = assert('new homepage preserved', index.includes('id="so-funktionierts"') && index.includes('id="angebot"') && index.includes('id="faq"')) && ok;
ok = assert('check route preserved', check.includes('initProgressCheck')) && ok;
ok = assert('check still loads config.js', check.includes('src="/config.js"')) && ok;
ok = assert('check href /check unchanged', !check.includes('PUBLIC_SITE_CLOSED')) && ok;

if (!ok) process.exit(1);

console.log(`\nAll ${modeLabel}-mode closed-state checks passed.`);
