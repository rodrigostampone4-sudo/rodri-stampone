import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [config, layout, notFound, styles] = await Promise.all([
  readFile('studio/sanity.config.ts', 'utf8'),
  readFile('studio/src/components/StudioLayout.tsx', 'utf8'),
  readFile('studio/src/components/StudioNotFound.tsx', 'utf8'),
  readFile('studio/src/components/studio.css', 'utf8'),
]);

test('Studio replaces only unknown top-level tools with the custom not-found screen', () => {
  assert.match(config, /import \{ StudioLayout \} from '\.\/src\/components\/StudioLayout';/);
  assert.match(config, /studio:\s*\{[\s\S]*?components:\s*\{[\s\S]*?layout: StudioLayout/);
  assert.match(layout, /useRouterState/);
  assert.match(layout, /useTools\(\)/);
  assert.match(layout, /tools\.some\(\(tool\) => tool\.name === activeToolName\)/);
  assert.match(layout, /return props\.renderDefault\(props\);/);
  assert.match(layout, /return <StudioNotFound \/>;/);
});

test('Studio not-found screen preserves navigation and provides an accessible recovery action', () => {
  assert.match(notFound, /<StudioNavbar \/>/);
  assert.match(notFound, /<main className="rs-studio-not-found__main">/);
  assert.match(notFound, /<h1[\s\S]*?Sección no encontrada[\s\S]*?<\/h1>/);
  assert.match(notFound, /<ToolLink[\s\S]*?name="panel"[\s\S]*?>[\s\S]*?Volver al panel/);
  assert.match(notFound, /titleRef\.current\?\.focus\(\)/);
  assert.match(styles, /\.rs-studio-not-found__action \{[\s\S]*?min-height: 44px;/);
  assert.match(styles, /\.rs-studio-not-found__action:focus-visible/);
});

test('Studio not-found screen does not redirect or animate', () => {
  const notFoundStyles = styles.slice(styles.indexOf('.rs-studio-not-found'));

  assert.doesNotMatch(layout, /window\.location|location\.(?:assign|replace)|setTimeout/);
  assert.doesNotMatch(notFound, /window\.location|location\.(?:assign|replace)|setTimeout/);
  assert.doesNotMatch(notFoundStyles, /animation\s*:|@keyframes|transition\s*:/);
});

test('Studio not-found screen stays within the available viewport height', () => {
  assert.match(
    styles,
    /\.rs-studio-not-found \{[\s\S]*?height: 100%;[\s\S]*?min-height: 0;[\s\S]*?overflow: hidden;/,
  );
  assert.match(
    styles,
    /\.rs-studio-not-found__main \{[\s\S]*?overflow-y: auto;[\s\S]*?padding: clamp\(24px, 4vh, 48px\)/,
  );
});
