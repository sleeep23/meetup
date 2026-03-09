import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from '@hono/zod-openapi'
import {
  MeetupSchema,
  MeetupRowSchema,
  CreateMeetupBodySchema,
  UpdateMeetupBodySchema,
  MeetupIdParamSchema,
} from '../schemas/meetup.js'
import * as store from '../mock-data.js'

const app = new OpenAPIHono()

// ── GET /meetups ────────────────────────────────

const listRoute = createRoute({
  method: 'get',
  path: '/meetups',
  tags: ['Meetups'],
  summary: '모임 목록 조회',
  description: '모든 모임을 생성일 기준 내림차순으로 조회합니다. 신청자 수와 개설자 프로필이 포함됩니다.',
  responses: {
    200: {
      description: '모임 목록',
      content: { 'application/json': { schema: z.array(MeetupSchema) } },
    },
  },
})

app.openapi(listRoute, (c) => {
  return c.json(store.getMeetups(), 200)
})

// ── GET /meetups/:id ────────────────────────────

const getRoute = createRoute({
  method: 'get',
  path: '/meetups/{id}',
  tags: ['Meetups'],
  summary: '모임 상세 조회',
  description: '단일 모임을 ID로 조회합니다. 신청자 수와 개설자 프로필이 포함됩니다.',
  request: { params: MeetupIdParamSchema },
  responses: {
    200: {
      description: '모임 상세',
      content: { 'application/json': { schema: MeetupSchema } },
    },
    404: {
      description: '모임을 찾을 수 없음',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

app.openapi(getRoute, (c) => {
  const { id } = c.req.valid('param')
  const meetup = store.getMeetup(id)
  if (!meetup) {
    return c.json({ error: '모임을 찾을 수 없습니다' }, 404)
  }
  return c.json(meetup, 200)
})

// ── POST /meetups ───────────────────────────────

const createRoute_ = createRoute({
  method: 'post',
  path: '/meetups',
  tags: ['Meetups'],
  summary: '모임 생성',
  description: '새 모임을 생성합니다. X-User-Id 헤더로 사용자를 지정할 수 있습니다.',
  request: {
    body: { content: { 'application/json': { schema: CreateMeetupBodySchema } } },
  },
  responses: {
    201: {
      description: '생성된 모임',
      content: { 'application/json': { schema: MeetupRowSchema } },
    },
  },
})

app.openapi(createRoute_, (c) => {
  const body = c.req.valid('json')
  const userId = c.req.header('X-User-Id') ?? store.DEFAULT_USER_ID
  const meetup = store.createMeetup({
    title: body.title,
    description: body.description ?? null,
    max_participants: body.maxParticipants,
    deadline: body.deadline,
    created_by: userId,
  })
  return c.json(meetup, 201)
})

// ── PATCH /meetups/:id ──────────────────────────

const updateRoute = createRoute({
  method: 'patch',
  path: '/meetups/{id}',
  tags: ['Meetups'],
  summary: '모임 수정',
  description: '모임 정보를 수정합니다. 개설자만 수정 가능합니다.',
  request: {
    params: MeetupIdParamSchema,
    body: { content: { 'application/json': { schema: UpdateMeetupBodySchema } } },
  },
  responses: {
    200: {
      description: '수정된 모임',
      content: { 'application/json': { schema: MeetupRowSchema } },
    },
    404: {
      description: '모임을 찾을 수 없거나 권한 없음',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

app.openapi(updateRoute, (c) => {
  const { id } = c.req.valid('param')
  const body = c.req.valid('json')
  const userId = c.req.header('X-User-Id') ?? store.DEFAULT_USER_ID
  const updated = store.updateMeetup(id, userId, {
    title: body.title,
    description: body.description,
    max_participants: body.maxParticipants,
    deadline: body.deadline,
  })
  if (!updated) {
    return c.json({ error: '모임을 찾을 수 없거나 수정 권한이 없습니다' }, 404)
  }
  return c.json(updated, 200)
})

// ── DELETE /meetups/:id ─────────────────────────

const deleteRoute = createRoute({
  method: 'delete',
  path: '/meetups/{id}',
  tags: ['Meetups'],
  summary: '모임 삭제',
  description: '모임을 삭제합니다. 개설자만 삭제 가능합니다. 관련 신청도 함께 삭제됩니다.',
  request: { params: MeetupIdParamSchema },
  responses: {
    204: { description: '삭제 완료' },
    404: {
      description: '모임을 찾을 수 없거나 권한 없음',
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
    },
  },
})

app.openapi(deleteRoute, (c) => {
  const { id } = c.req.valid('param')
  const userId = c.req.header('X-User-Id') ?? store.DEFAULT_USER_ID
  const deleted = store.deleteMeetup(id, userId)
  if (!deleted) {
    return c.json({ error: '모임을 찾을 수 없거나 삭제 권한이 없습니다' }, 404)
  }
  return c.body(null, 204)
})

export default app
