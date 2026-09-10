import assert from 'node:assert/strict';
import test from 'node:test';

import { findProfileInstagramLink } from '../src/lib/links/profile-instagram.ts';

const links = [
  {
    label: '4SIDE',
    url: 'https://www.instagram.com/4side.prod/',
    kind: 'instagram',
    enabled: true,
  },
  {
    label: 'Rodrigo',
    url: 'https://instagram.com/rodri.stampone/',
    kind: 'profileInstagram',
    enabled: true,
  },
];

test('profile Instagram follows its semantic kind instead of link order', () => {
  assert.equal(findProfileInstagramLink(links)?.label, 'Rodrigo');
});

test('profile Instagram fails closed when the semantic link is disabled', () => {
  const disabledLinks = links.map((link) =>
    link.kind === 'profileInstagram' ? { ...link, enabled: false } : link,
  );

  assert.equal(
    findProfileInstagramLink(disabledLinks),
    undefined,
  );
});

test('generic Instagram links never become the profile destination', () => {
  assert.equal(findProfileInstagramLink([links[0]]), undefined);
});

test('profile Instagram uses the Instagram icon', async () => {
  const icon = await import('node:fs/promises').then(({ readFile }) =>
    readFile('src/components/PermanentLinkIcon.astro', 'utf8'),
  );

  assert.match(icon, /kind === 'profileInstagram' \|\| kind === 'instagram'/);
});
