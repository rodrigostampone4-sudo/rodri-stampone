import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID?.trim();
const dataset = process.env.SANITY_STUDIO_DATASET?.trim() || 'production';

export default defineCliConfig({
  api: {
    projectId: projectId ?? '',
    dataset,
  },
  deployment: {
    appId: 'u277093a0fs9666mf12iu8hk',
  },
});
