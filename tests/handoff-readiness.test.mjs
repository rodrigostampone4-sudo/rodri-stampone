import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import { GET as getRobots } from '../src/pages/robots.txt.ts';
import { GET as getSitemap } from '../src/pages/sitemap.xml.ts';

const [
  astroConfig,
  landing,
  queries,
  imageHelper,
  styles,
  rootVercel,
  studioVercel,
  workflow,
  dependabot,
  rootPackage,
  studioPackage,
  studioLandingUrl,
  studioCli,
  architecture,
  eventExpiration,
] =
  await Promise.all([
    readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/sanity/queries.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/lib/sanity/image.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
    readFile(new URL('../studio/vercel.json', import.meta.url), 'utf8'),
    readFile(new URL('../.github/workflows/code-checks.yml', import.meta.url), 'utf8'),
    readFile(new URL('../.github/dependabot.yml', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../studio/package.json', import.meta.url), 'utf8'),
    readFile(new URL('../studio/src/lib/landing-url.ts', import.meta.url), 'utf8'),
    readFile(new URL('../studio/sanity.cli.ts', import.meta.url), 'utf8'),
    readFile(new URL('../docs/architecture.md', import.meta.url), 'utf8'),
    readFile(new URL('../src/scripts/event-expiration.ts', import.meta.url), 'utf8'),
  ]);

test('public URLs are configurable and publish complete social metadata', () => {
  assert.match(astroConfig, /process\.env\.PUBLIC_SITE_URL/);
  assert.match(landing, /rel="canonical"/);
  assert.match(landing, /property="og:url"/);
  assert.match(landing, /name="twitter:card" content="summary_large_image"/);
});

test('robots and sitemap use the configured canonical site', async () => {
  const site = new URL('https://example.com/');
  const robots = await getRobots({ site });
  const sitemap = await getSitemap({ site });

  assert.equal(robots.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.match(await robots.text(), /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
  assert.equal(sitemap.headers.get('content-type'), 'application/xml; charset=utf-8');
  assert.match(await sitemap.text(), /<loc>https:\/\/example\.com\/<\/loc>/);
});

test('featured ordering and Sanity crop metadata reach the landing image builder', () => {
  assert.match(queries, /order\(featured desc, date asc, _createdAt asc\)/);
  assert.match(queries, /crop,[\s\S]*?hotspot,[\s\S]*?_id,/);
  assert.match(imageHelper, /\.height\(width\)[\s\S]*?\.fit\('crop'\)/);
});

test('event presentation omits the numeric counter and preserves expiration behavior', () => {
  assert.doesNotMatch(landing, /data-event-count|class="event-count"/);
  assert.doesNotMatch(styles, /\.event-count\s*\{/);
  assert.doesNotMatch(eventExpiration, /data-event-count/);
  assert.match(eventExpiration, /if \(!eventList \|\| !emptyState\)/);
  assert.match(eventExpiration, /eventList\.hidden = visibleEventCount === 0/);
  assert.match(styles, /\.event-venue--maps \{[\s\S]*?min-width: 2\.75rem;[\s\S]*?min-height: 2\.75rem;/);
  assert.match(
    styles,
    /\.led-sign__hit-area-link:focus-visible \.led-sign__hit-area-fill \{[\s\S]*?stroke: var\(--color-accent-bright\);/,
  );
});

test('both Vercel projects declare the low-risk defensive headers', () => {
  for (const configText of [rootVercel, studioVercel]) {
    const config = JSON.parse(configText);
    const globalHeaders = config.headers.find(({ source }) => source === '/(.*)')?.headers ?? [];
    const values = new Map(globalHeaders.map(({ key, value }) => [key, value]));

    assert.equal(values.get('X-Frame-Options'), 'DENY');
    assert.equal(values.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(values.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  }
});

test('the landing enforces a CSP without unsafe script or style execution', () => {
  const config = JSON.parse(rootVercel);
  const globalHeaders = config.headers.find(({ source }) => source === '/(.*)')?.headers ?? [];
  const csp = globalHeaders.find(({ key }) => key === 'Content-Security-Policy')?.value ?? '';

  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /script-src-attr 'none'/);
  assert.match(csp, /style-src 'self' https:\/\/fonts\.googleapis\.com/);
  assert.match(csp, /font-src 'self' https:\/\/fonts\.gstatic\.com/);
  assert.match(csp, /img-src 'self' data: https:\/\/cdn\.sanity\.io/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(csp, /'unsafe-inline'|'unsafe-eval'|\*/);
  assert.match(astroConfig, /inlineStylesheets:\s*'never'/);
  assert.match(astroConfig, /assetsInlineLimit:\s*0/);
});

test('the Studio evaluates a stricter Sanity-specific CSP without enforcing it yet', () => {
  const config = JSON.parse(studioVercel);
  const globalHeaders = config.headers.find(({ source }) => source === '/(.*)')?.headers ?? [];
  const values = new Map(globalHeaders.map(({ key, value }) => [key, value]));
  const reportOnlyCsp = values.get('Content-Security-Policy-Report-Only') ?? '';

  assert.equal(values.get('Content-Security-Policy'), "frame-ancestors 'none'");
  assert.match(reportOnlyCsp, /default-src 'self'/);
  assert.match(reportOnlyCsp, /connect-src[^;]*https:\/\/\*\.sanity\.io/);
  assert.match(reportOnlyCsp, /connect-src[^;]*https:\/\/\*\.sanity-cdn\.com/);
  assert.match(reportOnlyCsp, /script-src 'self' https:\/\/\*\.sanity-cdn\.com/);
  assert.match(reportOnlyCsp, /script-src-attr 'none'/);
  assert.match(reportOnlyCsp, /object-src 'none'/);
  assert.doesNotMatch(reportOnlyCsp, /'unsafe-eval'/);
});

test('CI validates both packages without receiving deployment credentials', () => {
  assert.match(workflow, /permissions:\s+contents: read/);
  assert.match(workflow, /name: Landing[\s\S]*?npm test[\s\S]*?npm run check[\s\S]*?npm run build/);
  assert.match(workflow, /name: Studio[\s\S]*?working-directory: studio/);
  assert.match(workflow, /Install root build configuration dependencies[\s\S]*?working-directory: \./);
  assert.doesNotMatch(workflow, /VERCEL_TOKEN|SANITY_AUTH_TOKEN/);
  assert.equal(
    (workflow.match(/actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/g) ?? [])
      .length,
    2,
  );
  assert.equal(
    (workflow.match(/actions\/setup-node@820762786026740c76f36085b0efc47a31fe5020/g) ?? [])
      .length,
    2,
  );
  assert.equal((workflow.match(/npm run build/g) ?? []).length, 2);
  assert.match(dependabot, /directory: \/[\s\S]*?directory: \/studio/);
  assert.equal((dependabot.match(/version-update:semver-major/g) ?? []).length, 2);
});

test('runtime versions and owner-dependent Studio URL are explicit', () => {
  for (const packageText of [rootPackage, studioPackage]) {
    const packageJson = JSON.parse(packageText);
    assert.equal(packageJson.packageManager, 'npm@10.9.8');
    assert.equal(packageJson.engines.node, '>=22.12 <25');
  }

  assert.match(studioLandingUrl, /import\.meta\.env\.SANITY_STUDIO_LANDING_URL/);
  assert.match(studioLandingUrl, /url\.protocol !== 'https:'/);
});

test('Sanity resolves only the externally hosted CMS', () => {
  assert.match(studioCli, /deployment:\s*\{\s*appId: 'yg93g1r1faajur8cqktibpth'/);
  assert.doesNotMatch(studioCli, /studioHost/);
  assert.match(architecture, /sanity deploy --external --schema-required/);
  assert.doesNotMatch(architecture, /rodristampone\.sanity\.studio/);
});

test('the temporary public content inventory route is removed', async () => {
  await assert.rejects(access(new URL('../src/pages/content-check.astro', import.meta.url)));
});
