import assert from 'node:assert/strict';
import test from 'node:test';

import { getActiveSpecialLink } from '../src/lib/links/special-link.ts';

const pack = {
  enabled: true,
  title: 'Pack de 4 entradas',
  description: 'Para eventos Mute a elección',
  producer: 'Mute',
  venue: 'Mute',
  venueMapsUrl: 'https://maps.google.com/?q=Mute',
  url: 'https://wearebombo.app.link/EOvewhnrH6b',
};

test('existing settings and disabled special links do not create a card', () => {
  for (const link of [undefined, null, {}, { enabled: false }, { ...pack, enabled: false }]) {
    assert.equal(getActiveSpecialLink(link), null);
  }
});

test('an enabled pack preserves its exact destination without requiring an event date', () => {
  const { enabled, ...expected } = pack;
  assert.deepEqual(getActiveSpecialLink(pack), expected);
});

test('incomplete content or unresolved catalog references never produce an active card', () => {
  for (const field of ['title', 'url', 'producer', 'venue']) {
    for (const value of [undefined, null, '', '   ']) {
      assert.equal(getActiveSpecialLink({ ...pack, [field]: value }), null, field);
    }
  }
});

test('only absolute HTTPS destinations without credentials are accepted', () => {
  for (const url of ['javascript:alert(1)', 'http://example.com', '/tickets', 'invalid', 'https://user:password@example.com']) {
    assert.equal(getActiveSpecialLink({ ...pack, url }), null, url);
  }
});

test('the description is optional and editorial whitespace is normalized', () => {
  assert.deepEqual(getActiveSpecialLink({ ...pack, title: ` ${pack.title} `, description: undefined }), {
    title: pack.title,
    description: '',
    producer: pack.producer,
    venue: pack.venue,
    venueMapsUrl: pack.venueMapsUrl,
    url: pack.url,
  });
});

test('a venue without a Maps URL keeps the pack active without a Maps link', () => {
  const { venueMapsUrl, ...withoutMaps } = pack;
  const active = getActiveSpecialLink(withoutMaps);
  assert.ok(active);
  assert.equal('venueMapsUrl' in active, false);
});
