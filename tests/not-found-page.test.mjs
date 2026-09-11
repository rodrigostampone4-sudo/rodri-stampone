import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const notFoundPage = await readFile('src/pages/404.astro', 'utf8');

test('404 page provides a static and accessible recovery path', () => {
  assert.match(notFoundPage, /<html lang="es">/);
  assert.match(notFoundPage, /<meta name="robots" content="noindex"\s*\/>/);
  assert.match(notFoundPage, /<h1>Página no encontrada<\/h1>/);
  assert.match(notFoundPage, /class="error-action" href="\/"/);
  assert.match(notFoundPage, /<BrandHead\s*\/>/);
  assert.doesNotMatch(notFoundPage, /getSanityClient|<script\b|animation\s*:|@keyframes/);
});
