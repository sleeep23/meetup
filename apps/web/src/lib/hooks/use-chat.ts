import { useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchChatMessages, sendChatMessage } from '@/lib/api/chat'
import type { ChatMessage } from '@/lib/types/chat'

interface UseChatOptions {
  meetupId: string
  /** 현재 유저가 채팅에 접근 가능한지 여부 */
  enabled: boolean
}

export function useChat({ meetupId, enabled }: UseChatOptions) {
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => ['chatMessages', meetupId], [meetupId])

  // ── 1) 초기 히스토리 로드 (TanStack Query) ──
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchChatMessages(meetupId),
    enabled,
  })

  // ── 2) Supabase Realtime 구독 ──
  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`chat:${meetupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_message',
          filter: `meetup_id=eq.${meetupId}`,
        },
        async (payload) => {
          const newRow = payload.new as ChatMessage

          // Realtime payload에는 JOIN 데이터가 없으므로 프로필 별도 조회
          const { data: profile } = await supabase
            .from('profile')
            .select('nickname, avatar_url')
            .eq('id', newRow.user_id)
            .single()

          const newMessage: ChatMessage = {
            ...newRow,
            sender_profile: profile
              ? {
                  nickname: profile.nickname,
                  avatar_url: profile.avatar_url,
                }
              : null,
          }

          // TanStack Query 캐시에 추가 (중복 방지)
          queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => {
            if (old.some((m) => m.id === newMessage.id)) return old
            return [...old, newMessage]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meetupId, enabled, queryClient, queryKey])

  // ── 3) 메시지 전송 뮤테이션 ──
  const sendMutation = useMutation({
    mutationFn: (content: string) => sendChatMessage(meetupId, content),
    onSuccess: (newMessage) => {
      // 캐시에 즉시 추가 (Realtime에서도 도착하지만 dedup 처리됨)
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => {
        if (old.some((m) => m.id === newMessage.id)) return old
        return [...old, newMessage]
      })
    },
  })

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
  }
}
