/**
 * Dev 모드 유틸리티.
 * VITE_DEV_AUTH_BYPASS=true일 때만 활성화된다.
 */

export const isDevAuthBypass =
  import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

export const DEV_USER = {
  id: 'dev-user-001',
  email: 'dev@university.ac.kr',
  nickname: '개발자',
  avatar_url: null,
  user_metadata: { nickname: '개발자', full_name: '개발자' },
} as const
