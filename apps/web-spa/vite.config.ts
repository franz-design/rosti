import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

const clientOutDir = fileURLToPath(new URL('./build/client', import.meta.url))

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    devtoolsJson(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'worker',
      filename: 'sw.ts',
      outDir: clientOutDir,
      injectRegister: false,
      manifest: false,
      devOptions: { enabled: false },
      injectManifest: {
        // React Router writes index.html after this plugin runs. The post-build
        // script finds this call, so the worker stays unminified.
        minify: false,
        globDirectory: clientOutDir,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
  },
  server: {
    port: 5174,
  },
  optimizeDeps: {
    include: ['@tanstack/react-query', 'zod'],
  },
})
