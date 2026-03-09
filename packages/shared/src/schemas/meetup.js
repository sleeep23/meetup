import { z } from 'zod';
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
});
//# sourceMappingURL=meetup.js.map