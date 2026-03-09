import { z } from '@hono/zod-openapi'

export const ProfileSchema = z
  .object({
    id: z.string().uuid(),
    nickname: z.string().nullable(),
    avatar_url: z.string().nullable(),
    created_at: z.string().datetime(),
  })
  .openapi('Profile')

export const ProfileIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    param: { name: 'id', in: 'path' },
    example: '00000000-0000-0000-0000-000000000001',
  }),
})

export const UpdateProfileBodySchema = z
  .object({
    nickname: z.string().min(1).max(30).optional().openapi({ example: '새닉네임' }),
    avatar_url: z.string().url().optional().openapi({ example: 'https://example.com/avatar.png' }),
  })
  .openapi('UpdateProfileInput')
