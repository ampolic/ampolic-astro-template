import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

// Note: @cloudflare/vitest-pool-workers 0.18.x (paired with Vitest 4) replaced the old
// `defineWorkersConfig` helper (from the "/config" subpath) with a Vite plugin API.
// See node_modules/@cloudflare/vitest-pool-workers/dist/codemods/vitest-v3-to-v4.mjs
// for Cloudflare's own migration codemod, which this config follows.
export default defineConfig({
  plugins: [cloudflareTest({ miniflare: { compatibilityDate: '2024-09-23' } })],
});
