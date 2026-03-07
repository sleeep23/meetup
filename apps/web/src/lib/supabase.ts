import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const isMissing = !supabaseUrl || !supabaseAnonKey

if (isMissing) {
  console.warn(
    '⚠️ Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.\n' +
      '   인증 기능은 비활성화됩니다.',
  )
}

// 환경변수가 없어도 앱이 크래시하지 않도록 placeholder URL 사용
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
)
