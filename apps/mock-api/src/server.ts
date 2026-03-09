import { serve } from '@hono/node-server'
import app from './app.js'

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  console.log(`Mock API running at http://localhost:${port}`)
  console.log(`API docs:  http://localhost:${port}`)
  console.log(`OpenAPI:   http://localhost:${port}/openapi.json`)
})
