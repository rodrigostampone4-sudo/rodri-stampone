import assert from 'node:assert/strict';
import test from 'node:test';

import { buildEventTablesWhatsAppUrl } from '../src/lib/events/tables-link.ts';

test('builds a Mesas WhatsApp URL for the selected event', () => {
  const tablesUrl = buildEventTablesWhatsAppUrl(
    'https://api.whatsapp.com/send?phone=5491126280658&text=Mensaje%20general',
    {
      title: 'EMILIANO DE MARCO',
      date: '2026-09-05',
    },
  );
  const url = new URL(tablesUrl);

  assert.equal(url.origin, 'https://api.whatsapp.com');
  assert.equal(url.pathname, '/send');
  assert.equal(url.searchParams.get('phone'), '5491126280658');
  assert.equal(
    url.searchParams.get('text'),
    'Hola, quisiera recibir información sobre mesas para EMILIANO DE MARCO el 5 de septiembre de 2026.',
  );
});
