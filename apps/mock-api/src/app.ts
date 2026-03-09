import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from '@scalar/hono-api-reference'
import { cors } from 'hono/cors'
import meetupRoutes from './routes/meetups.js'
import applicationRoutes from './routes/applications.js'
import profileRoutes from './routes/profiles.js'

const app = new OpenAPIHono()

// CORS (프론트엔드 로컬 개발용)
app.use('/*', cors())

// API 라우트 등록
app.route('/api', meetupRoutes)
app.route('/api', applicationRoutes)
app.route('/api', profileRoutes)

// OpenAPI JSON 스펙
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Meetup Mock API',
    version: '1.0.0',
    description:
      '모임 서비스 Mock API입니다. 프론트엔드 개발 및 API 스펙 참고용으로 사용합니다.\n\n' +
      '인증이 필요한 엔드포인트는 `X-User-Id` 헤더로 사용자를 지정합니다.\n' +
      '헤더가 없으면 기본 목 유저(김철수)로 동작합니다.',
  },
})

// Scalar API 문서 UI (루트 경로)
app.get(
  '/',
  apiReference({
    theme: 'default',
    spec: { url: '/openapi.json' },
  }),
)

export default app
