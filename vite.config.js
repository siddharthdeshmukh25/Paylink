import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Minimal Netlify Functions emulator so the app works under `vite` dev too.
// In production Netlify handles /api/* via netlify.toml redirects.
function netlifyApiEmulator() {
  return {
    name: 'netlify-api-emulator',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const splat = url.pathname.replace(/^\/+/, '').replace(/\/+$/, '')
          const handler = require(resolve(__dirname, 'netlify/functions', `${splat}.js`)).default
          let body = ''
          req.on('data', (c) => (body += c))
          req.on('end', async () => {
            const event = {
              httpMethod: req.method,
              path: url.pathname,
              queryStringParameters: Object.fromEntries(url.searchParams),
              headers: req.headers,
              body: body || null,
              isBase64Encoded: false,
            }
            try {
              const result = await handler(event)
              res.statusCode = result.statusCode || 200
              Object.entries(result.headers || {}).forEach(([k, v]) =>
                res.setHeader(k, v)
              )
              res.end(result.body)
            } catch (e) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: e.message }))
            }
          })
        } catch (e) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `Unknown API route: ${req.url}` }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), netlifyApiEmulator()],
  server: { host: true },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
})