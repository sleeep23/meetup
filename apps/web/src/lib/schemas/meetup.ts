import { z } from 'zod'

/** 장소 정보 스키마 (선택적) */
export const locationSchema = z
  .object({
    name: z.string().min(1, '장소명을 입력해주세요').max(100, '장소명은 100자 이하여야 합니다'),
    address: z.string().max(200, '주소는 200자 이하여야 합니다').optional(),
    latitude: z.number().min(33, '올바른 위도 값이 아닙니다').max(43, '올바른 위도 값이 아닙니다'),
    longitude: z.number().min(124, '올바른 경도 값이 아닙니다').max(132, '올바른 경도 값이 아닙니다'),
  })
  .optional()

/** 모임 생성 시 유효성 검사 스키마 */
export const createMeetupSchema = z.object({
  title: z.string().min(2, '제목은 2자 이상이어야 합니다').max(50, '제목은 50자 이하여야 합니다'),
  description: z.string().max(500, '설명은 500자 이하여야 합니다').optional(),
  maxParticipants: z
    .number()
    .int()
    .min(2, '최소 2명이어야 합니다')
    .max(50, '최대 50명까지 가능합니다'),
  deadline: z.string().datetime({ message: '유효한 날짜 형식이어야 합니다' }),
  // 장소 정보 추가 (선택적)
  location: locationSchema,
})

export type CreateMeetupInput = z.infer<typeof createMeetupSchema>
