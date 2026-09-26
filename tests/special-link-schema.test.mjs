import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  specialLinkValidators,
} from '../studio/schemaTypes/specialLinkValidation.ts';

const [schema, input] = await Promise.all([
  readFile(new URL('../studio/schemaTypes/siteSettings.ts', import.meta.url), 'utf8'),
  readFile(new URL('../studio/src/components/SiteSettingsInput.tsx', import.meta.url), 'utf8'),
]);

test('special link is optional, disabled by default and editable from its own settings section', () => {
  assert.match(schema, /name: 'specialLink'[\s\S]*?type: 'object'[\s\S]*?group: 'specialLinks'/);
  assert.match(schema, /name: 'enabled'[\s\S]*?type: 'boolean'[\s\S]*?initialValue: false/);
  assert.match(input, /specialLinks:[\s\S]*?fieldNames: \['specialLink'\]/);
});

test('schema validator callbacks require title and references only while enabled', () => {
  const disabled = { parent: { enabled: false } };
  const enabled = { parent: { enabled: true } };

  assert.equal(specialLinkValidators.title(undefined, disabled), true);
  assert.equal(specialLinkValidators.producer(undefined, disabled), true);
  assert.equal(specialLinkValidators.venue(undefined, disabled), true);
  assert.equal(specialLinkValidators.title(undefined, enabled), 'El título es obligatorio cuando el link especial está habilitado.');
  assert.equal(specialLinkValidators.producer(undefined, enabled), 'La productora es obligatoria cuando el link especial está habilitado.');
  assert.equal(specialLinkValidators.venue(undefined, enabled), 'El venue es obligatorio cuando el link especial está habilitado.');
  assert.equal(specialLinkValidators.title('Pack de 4 entradas', enabled), true);
  assert.equal(specialLinkValidators.producer({ _ref: 'producer-id' }, enabled), true);
  assert.equal(specialLinkValidators.venue({ _ref: 'venue-id' }, enabled), true);
  for (const field of ['title', 'producer', 'venue']) {
    assert.ok(schema.includes(`Rule.custom(specialLinkValidators.${field})`));
  }
  assert.match(schema, /name: 'producer'[\s\S]*?to: \[\{ type: 'producer' \}\][\s\S]*?input: ManagedReferenceInput/);
  assert.match(schema, /name: 'venue'[\s\S]*?to: \[\{ type: 'venue' \}\][\s\S]*?input: ManagedReferenceInput/);
  assert.doesNotMatch(schema, /name: 'ctaLabel'/);
});

test('enabled special link accepts secure HTTPS URLs and rejects insecure or credentialed destinations', () => {
  const enabled = { parent: { enabled: true } };

  assert.equal(specialLinkValidators.url('https://wearebombo.app.link/EOvewhnrH6b', enabled), true);
  assert.equal(specialLinkValidators.url('http://example.com', enabled), 'Ingresá una URL https válida cuando el link especial está habilitado.');
  assert.equal(specialLinkValidators.url('https://user@example.com/path', enabled), 'Ingresá una URL https válida cuando el link especial está habilitado.');
  assert.equal(specialLinkValidators.url('https://:password@example.com/path', enabled), 'Ingresá una URL https válida cuando el link especial está habilitado.');
  assert.equal(specialLinkValidators.url(undefined, enabled), 'Ingresá una URL https válida cuando el link especial está habilitado.');
  assert.ok(schema.includes('Rule.custom(specialLinkValidators.url)'));
});

test('description stays optional in the schema', () => {
  const descriptionField = schema.match(/name: 'description',[\s\S]*?\n        \}\),/u)?.[0];

  assert.ok(descriptionField, 'description field should be present');
  assert.doesNotMatch(descriptionField, /validation:/);
});

test('special link retains producer and venue references without event, table, map or multi-link fields', () => {
  const specialLinkSchema = schema.match(/name: 'specialLink',[\s\S]*?\n    \}\),\n  \],/u)?.[0];

  assert.ok(specialLinkSchema, 'specialLink schema field should be present');
  assert.match(specialLinkSchema, /to: \[\{ type: 'producer' \}\][\s\S]*?input: ManagedReferenceInput/);
  assert.match(specialLinkSchema, /to: \[\{ type: 'venue' \}\][\s\S]*?input: ManagedReferenceInput/);
  assert.doesNotMatch(specialLinkSchema, /name: '(?:date|tables|maps|events|links)'/);
});
