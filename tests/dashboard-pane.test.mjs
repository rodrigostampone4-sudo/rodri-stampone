import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../studio/src/components/DashboardPane.tsx', import.meta.url), 'utf8');
const styles = await readFile(new URL('../studio/src/components/studio.css', import.meta.url), 'utf8');

test('the dashboard profile card renders the configured profile image with initials as fallback', () => {
  assert.match(source, /settingsState\.data\?\.profileImage\?\.asset\?\._ref/);
  assert.match(source, /src=\{profileImageUrl\}/);
  assert.match(source, /alt=\{`Foto de perfil de \$\{profileName\}`\}/);
  assert.match(source, /<span aria-hidden="true">\{profileInitials \|\| 'RS'\}<\/span>/);
});

test('event titles use a stable desktop date column and keep the stacked mobile layout', () => {
  assert.match(
    styles,
    /\.rs-event-row \{[\s\S]*?grid-template-columns: 10\.5rem minmax\(0, 1fr\) auto auto;/,
  );
  assert.match(
    styles,
    /@media \(max-width: 720px\) \{[\s\S]*?\.rs-event-row \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/,
  );
});
