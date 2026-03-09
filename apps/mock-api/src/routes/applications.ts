import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import {
  ApplicationSchema,
  MeetupIdParamSchema,
  ApplicationMeetupIdsSchema,
} from '../schemas/application.js'
import * as store from '../mock-data.js'

const app = new OpenAPIHono()

// ── GET /meetups/:meetupId/application ──────────

const checkRoute = createRoute({
  method: 'get',
  path: '/meetups/{meetupId}/application',
  tags: ['Applications'],
  summary: '신청 여부 확인',
  description: '현재 사용자가 해당 모임에 신청했는지 확인합니다. X-User-Id 헤더로 사용자를 지정합니다.',
  request: { params: MeetupIdParamSchema },
  responses: {
    200: {
      description: '신청 정보 (없으면 null)',
      content: { 'application/json': { schema: ApplicationSchema.nullable() } },
    },
  },
})

app.openapi(checkRoute, (c) => {
  const { meetupId } = c.req.valid('param')
  const userId = c.req.header('X-User-Id') ?? store.DEFAULT_USER_ID
  const application = store.getUserApplication(meetupId, userId)
  return c.json(application, 200)
})

// ── POST /meetups/:meetupId/application ─────────

const applyRoute = createRoute({
  method: 'post',
  path: '/meetups/{meetupId}/application',
  tags: ['Applications'],
  summary: '모임 신청',
  description: '해당 모임에 신청합니다. 중복 신청 시 409 에러를 반환합니다.',
  request: { params: MeetupIdParamSchema },
  responses: {
    201: {
      description: '신청 완료',
      content: { 'application/json': { schema: ApplicationSchema } },
    },
    404: {
      description: '모임을 찾을 수 없음',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
    409: {
      description: '이미 신청한 모임',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

app.openapi(applyRoute, (c) => {
  const { meetupId } = c.req.valid('param')
  const userId = c.req.header('X-User-Id') ?? store.DEFAULT_USER_ID
  const { data, error } = store.applyToMeetup(meetupId, userId)

  if (error) {
    const status = error === '이미 신청한 모임입니다' ? 409 : 404
    return c.json({ error }, status)
  }

  return c.json(data!, 201)
})

// ── DELETE /meetups/:meetupId/application ────────

const cancelRoute = createRoute({
  method: 'delete',
  path: '/meetups/{meetupId}/application',
  tags: ['Applications'],
  summary: '신청 취소',
  description: '해당 모임의 신청을 취소합니다.',
  request: { params: MeetupIdParamSchema },
  responses: {
    204: { description: '취소 완료' },
    404: {
      description: '신청 내역을 찾을 수 없음',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

app.openapi(cancelRoute, (c) => {
  const { meetupId } = c.req.valid('param')
  const userId = c.req.header('X-User-Id') ?? store.DEFAULT_USER_ID
  const cancelled = store.cancelApplication(meetupId, userId)
  if (!cancelled) {
    return c.json({ error: '신청 내역을 찾을 수 없습니다' }, 404)
  }
  return c.body(null, 204)
})

// ── GET /applications/me ────────────────────────

const myApplicationsRoute = createRoute({
  method: 'get',
  path: '/applications/me',
  tags: ['Applications'],
  summary: '내 신청 모임 ID 목록',
  description: '현재 사용자가 신청한 모임의 ID 목록을 반환합니다.',
  responses: {
    200: {
      description: '신청한 모임 ID 목록',
      content: { 'application/json': { schema: ApplicationMeetupIdsSchema } },
    },
  },
})

app.openapi(myApplicationsRoute, (c) => {
  const userId = c.req.header('X-User-Id') ?? store.DEFAULT_USER_ID
  const meetupIds = store.getUserApplicationMeetupIds(userId)
  return c.json({ meetup_ids: meetupIds }, 200)
})

export default app
