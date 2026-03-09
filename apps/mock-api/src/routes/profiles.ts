import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import { ProfileSchema, ProfileIdParamSchema, UpdateProfileBodySchema } from '../schemas/profile.js'
import * as store from '../mock-data.js'

const app = new OpenAPIHono()

// ── GET /profiles/:id ───────────────────────────

const getRoute = createRoute({
  method: 'get',
  path: '/profiles/{id}',
  tags: ['Profiles'],
  summary: '프로필 조회',
  description: '사용자 프로필을 ID로 조회합니다.',
  request: { params: ProfileIdParamSchema },
  responses: {
    200: {
      description: '프로필 정보',
      content: { 'application/json': { schema: ProfileSchema } },
    },
    404: {
      description: '프로필을 찾을 수 없음',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

app.openapi(getRoute, (c) => {
  const { id } = c.req.valid('param')
  const profile = store.getProfile(id)
  if (!profile) {
    return c.json({ error: '프로필을 찾을 수 없습니다' }, 404)
  }
  return c.json(profile, 200)
})

// ── PATCH /profiles/:id ─────────────────────────

const updateRoute = createRoute({
  method: 'patch',
  path: '/profiles/{id}',
  tags: ['Profiles'],
  summary: '프로필 수정',
  description: '사용자 프로필을 수정합니다.',
  request: {
    params: ProfileIdParamSchema,
    body: { content: { 'application/json': { schema: UpdateProfileBodySchema } } },
  },
  responses: {
    200: {
      description: '수정된 프로필',
      content: { 'application/json': { schema: ProfileSchema } },
    },
    404: {
      description: '프로필을 찾을 수 없음',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

app.openapi(updateRoute, (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const updated = store.updateProfile(id, body)
  if (!updated) {
    return c.json({ error: '프로필을 찾을 수 없습니다' }, 404)
  }
  return c.json(updated, 200)
})

export default app
