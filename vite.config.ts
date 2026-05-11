import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

// Read version from package.json
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

// Build hash: prefer Vercel's git sha env var, fall back to local git, fall back to timestamp slug
function buildHash(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    // No git available — use a date-based slug so the build identifier is at least informative
    const d = new Date()
    return `dev${d.getUTCFullYear().toString().slice(-2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_HASH__: JSON.stringify(buildHash()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'sorted-mark.svg'],
      manifest: {
        name: 'Sorted',
        short_name: 'Sorted',
        description: 'Send to any @handle, anywhere in Australia.',
        theme_color: '#C8F154',
        background_color: '#F6F2E9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
