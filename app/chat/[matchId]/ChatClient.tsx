'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

interface MatchInfo {
  id:          string
  wingman1_id: string
  wingman2_id: string
  friend1:     { id: string; display_name: string | null; insta_id: string }
  friend2:     { id: string; display_name: string | null; insta_id: string }
  wingman1:    { id: string; display_name: string | null; insta_id: string | null }
  wingman2:    { id: string; display_name: string | null; insta_id: string | null }
}

interface Message {
  id:         string
  content:    string
  sender_id:  string
  created_at: string
}

interface Props {
  match:           MatchInfo
  initialMessages: Message[]
  currentUserId:   string
}

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function ChatClient({ match, initialMessages, currentUserId }: Props) {
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  const isWingman1   = match.wingman1_id === currentUserId
  const myFriend     = isWingman1 ? match.friend1 : match.friend2
  const theirFriend  = isWingman1 ? match.friend2 : match.friend1
  const theirWingman = isWingman1 ? match.wingman2 : match.wingman1

  const myFriendName     = myFriend.display_name    ?? `@${myFriend.insta_id}`
  const theirFriendName  = theirFriend.display_name ?? `@${theirFriend.insta_id}`
  const theirWingmanName = theirWingman.display_name ?? theirWingman.insta_id ?? '상대 Wingman'

  // ── 채팅방 진입 시 읽음 처리 ──────────────────────────────
  useEffect(() => {
    supabase
      .from('match_reads')
      .upsert(
        { match_id: match.id, user_id: currentUserId, last_read_at: new Date().toISOString() },
        { onConflict: 'match_id,user_id' }
      )
      .then(() => {})
  }, [match.id, currentUserId, supabase])

  // ── 스크롤 하단 고정 ──────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Realtime 구독 ─────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${match.id}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'messages',
          filter: `match_id=eq.${match.id}`,
        },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          )
          // 상대방 메시지 수신 시 즉시 읽음 처리
          if (msg.sender_id !== currentUserId) {
            supabase
              .from('match_reads')
              .upsert(
                { match_id: match.id, user_id: currentUserId, last_read_at: new Date().toISOString() },
                { onConflict: 'match_id,user_id' }
              )
              .then(() => {})
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, match.id])

  // ── 메시지 전송 ───────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setError(null)
    setInput('')

    const { error: insertError } = await supabase.from('messages').insert({
      match_id:  match.id,
      sender_id: currentUserId,
      content:   text,
    })

    if (insertError) {
      console.error('[Chat] 전송 실패:', insertError.message)
      setError('메시지 전송에 실패했습니다.')
      setInput(text)
    }

    setSending(false)
    inputRef.current?.focus()
  }, [input, sending, supabase, match.id, currentUserId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 h-14 pt-safe">
          <button
            onClick={() => router.back()}
            className="p-1 text-slate-500 hover:text-slate-950 transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-950 truncate">
              {theirWingmanName}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {myFriendName} · {theirFriendName}
            </p>
          </div>
        </div>
      </header>

      {/* ── 매칭 컨텍스트 배너 ───────────────────────────────── */}
      <div className="shrink-0 bg-slate-50 border-b border-slate-100 px-4 py-2.5 text-center">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{myFriendName}</span>
          {' '}와{' '}
          <span className="font-semibold text-slate-700">{theirFriendName}</span>
          {' '}의 매칭이 성사됐어요!
        </p>
        <p className="text-xs text-slate-400 mt-0.5">채팅으로 서로 소개해주세요</p>
      </div>

      {/* ── 메시지 목록 ──────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400">첫 메시지를 보내보세요</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                  isMine
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-900'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-slate-300">
                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ko })}
              </span>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </main>

      {/* ── 에러 메시지 ──────────────────────────────────────── */}
      {error && (
        <div className="shrink-0 px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* ── 입력창 ───────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-100 px-4 py-3 flex items-end gap-2 pb-safe">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지 입력... (Enter 전송)"
          rows={1}
          maxLength={1000}
          disabled={sending}
          className="flex-1 resize-none border border-slate-200 px-3 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 transition-colors max-h-32 overflow-y-auto disabled:opacity-50"
          style={{ lineHeight: '1.4' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="h-10 w-10 bg-slate-950 text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40 shrink-0"
          aria-label="전송"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

    </div>
  )
}
