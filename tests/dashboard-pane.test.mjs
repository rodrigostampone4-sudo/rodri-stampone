import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../studio/src/components/DashboardPane.tsx', import.meta.url), 'utf8');

test('the dashboard profile card renders the configured profile image with initials as fallback', () => {
  assert.match(source, /settingsState\.data\?\.profileImage\?\.asset\?\._ref/);
  assert.match(source, /src=\{profileImageUrl\}/);
  assert.match(source, /alt=\{`Foto de perfil de \$\{profileName\}`\}/);
  assert.match(source, /<span aria-hidden="true">\{profileInitials \|\| 'RS'\}<\/span>/);
});
