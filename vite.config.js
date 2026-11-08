import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

function localBookingApi() {
  return {
    name: 'local-booking-api',
    configureServer(server) {
      let ready
      const load = () => {
        if (!ready) {
          ready = Promise.all([
            import('./functions/api/booking.js'),
            import('./functions/api/slots.js'),
            import('./dev/local-d1.js'),
          ]).then(([booking, slots, local]) => {
            const secrets = local.loadDevVars()
            return {
              booking,
              slots,
              env: {
                DB: local.createLocalD1(),
                TELEGRAM_BOT_TOKEN: local.configuredSecret(secrets.TELEGRAM_BOT_TOKEN),
                TELEGRAM_CHAT_ID: local.configuredSecret(secrets.TELEGRAM_CHAT_ID),
              },
            }
          })
        }
        return ready
      }

      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/api/slots') && !url.startsWith('/api/booking')) {
          next()
          return
        }

        try {
          const context = await load()
          const host = req.headers.host || 'localhost'
          const headers = new Headers()
          for (const [key, value] of Object.entries(req.headers)) {
            if (value == null) continue
            headers.set(key, Array.isArray(value) ? value.join(', ') : value)
          }
          const chunks = []
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            for await (const chunk of req) chunks.push(chunk)
          }
          const request = new Request(`http://${host}${url}`, {
            method: req.method,
            headers,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          })
          const handler = url.startsWith('/api/slots')
            ? context.slots.onRequestGet
            : context.booking.onRequestPost
          const response = req.method === 'POST' || url.startsWith('/api/slots')
            ? await handler({ request, env: context.env })
            : new Response(JSON.stringify({ ok: false, error: 'Method not allowed.' }), {
              status: 405,
              headers: { 'content-type': 'application/json; charset=utf-8' },
            })
          if (!response) {
            next()
            return
          }
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          console.error(error)
          res.statusCode = 500
          res.setHeader('content-type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, error: 'The local booking service failed.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    localBookingApi(),
  ],
})
