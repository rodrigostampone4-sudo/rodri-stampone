import { defineConfig } from 'astro/config';

const fallbackSiteUrl = 'https://rodri-stampone.vercel.app/';
const configuredSiteUrl = process.env.PUBLIC_SITE_URL?.trim() || fallbackSiteUrl;
const siteUrl = new URL(configuredSiteUrl);

if (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password) {
  throw new Error('PUBLIC_SITE_URL must be an HTTPS URL without credentials.');
}

export default defineConfig({
  output: 'static',
  site: siteUrl.toString(),
});
