import { z } from '@hono/zod-openapi'

// ── Response 스키마 ─────────────────────────────

export const MeetupSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    max_participants: z.number().int(),
    deadline: z.string().datetime(),
    created_by: z.string().uuid(),
    created_at: z.string().datetime(),
    application_count: z.number().int(),
    creator_profile: z
      .object({
        nickname: z.string().nullable(),
        avatar_url: z.string().nullable(),
      })
      .nullable(),
  })
  .openapi('Meetup')

export const MeetupRowSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    max_participants: z.number().int(),
    deadline: z.string().datetime(),
    created_by: z.string().uuid(),
    created_at: z.string().datetime(),
  })
  .openapi('MeetupRow')

// ── Request 스키마 ──────────────────────────────

export const CreateMeetupBodySchema = z
  .object({
    title: z
      .string()
      .min(2, '제목은 2자 이상이어야 합니다')
      .max(50, '제목은 50자 이하여야 합니다')
      .openapi({ example: '주말 등산 모임' }),
    description: z
      .string()
      .max(500, '설명은 500자 이하여야 합니다')
      .optional()
      .openapi({ example: '북한산 등산 모임입니다. 초보자 환영!' }),
    maxParticipants: z
      .number()
      .int()
      .min(2, '최소 2명이어야 합니다')
      .max(50, '최대 50명까지 가능합니다')
      .openapi({ example: 10 }),
    deadline: z
      .string()
      .datetime({ message: '유효한 날짜 형식이어야 합니다' })
      .openapi({ example: '2026-04-01T00:00:00Z' }),
  })
  .openapi('CreateMeetupInput')

export const UpdateMeetupBodySchema = z
  .object({
    title: z.string().min(2).max(50).optional().openapi({ example: '수정된 모임 제목' }),
    description: z.string().max(500).optional().openapi({ example: '수정된 설명입니다' }),
    maxParticipants: z.number().int().min(2).max(50).optional().openapi({ example: 15 }),
    deadline: z.string().datetime().optional().openapi({ example: '2026-05-01T00:00:00Z' }),
  })
  .openapi('UpdateMeetupInput')

// ── Params 스키마 ───────────────────────────────

export const MeetupIdParamSchema = z.object({
  id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' }, example: '10000000-0000-0000-0000-000000000001' }),
})
