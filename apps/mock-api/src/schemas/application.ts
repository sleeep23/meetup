import { z } from '@hono/zod-openapi'

export const ApplicationSchema = z
  .object({
    id: z.string().uuid(),
    meetup_id: z.string().uuid(),
    user_id: z.string().uuid(),
    created_at: z.string().datetime(),
  })
  .openapi('Application')

export const MeetupIdParamSchema = z.object({
  meetupId: z
    .string()
    .uuid()
    .openapi({
      param: { name: 'meetupId', in: 'path' },
      example: '10000000-0000-0000-0000-000000000001',
    }),
})

export const ApplicationMeetupIdsSchema = z
  .object({
    meetup_ids: z.array(z.string().uuid()),
  })
  .openapi('ApplicationMeetupIds')
