'use client'

import Link               from 'next/link'
import { usePathname }    from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Home, ArrowLeftRight, Users, User } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

// ─────────────────────────────────────────────────────────────

interface NavTab {
  href:        string
  label:       string
  icon:        React.ComponentType<{ className?: string }>
  matchPrefix: string
}

const NAV_TABS: NavTab[] = [
  { href: '/home',    label: '홈',     icon: Home,           matchPrefix: '/home' },
  { href: '/swipe',   label: '스와이프', icon: ArrowLeftRight, matchPrefix: '/swipe' },
  { href: '/matches', label: '매칭',   icon: Users,          matchPrefix: '/matches' },
  { href: '/friends', label: '친구',   icon: User,           matchPrefix: '/friends' },
]

// ─────────────────────────────────────────────────────────────

export default function BottomNav() {
  const pathname   = usePathname()
  const supabase   = useRef(createClient())
  const [userId,   setUserId]   = useState<string | null>(null)
  const [unread,   setUnread]   = useState(0)

  // ── 현재 유저 ────────────────────────────────────────────
  useEffect(() => {
    supabase.current.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // ── 안 읽은 메시지 수 조회 ────────────────────────────────
  useEffect(() => {
    if (!userId) return

    async function fetchUnread() {
      const { data, error } = await supabase.current.rpc('get_unread_message_count')
      if (!error) setUnread(data ?? 0)
    }

    fetchUnread()

    // 새 메시지 들어오면 재조회
    const channel = supabase.current
      .channel('nav-unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          // 내가 보낸 메시지면 무시
          if ((payload.new as { sender_id: string }).sender_id !== userId) {
            fetchUnread()
          }
        }
      )
      .subscribe()

    return () => { supabase.current.removeChannel(channel) }
  }, [userId])

  // ── 매칭/채팅 탭 방문 시 읽음 처리 ───────────────────────
  useEffect(() => {
    if (!userId) return
    const isInChat = pathname.startsWith('/matches') || pathname.startsWith('/chat')
    if (isInChat) {
      // 잠시 후 unread 갱신 (ChatClient의 mark_read가 먼저 실행되도록)
      const t = setTimeout(async () => {
        const { data } = await supabase.current.rpc('get_unread_message_count')
        setUnread(data ?? 0)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [pathname, userId])

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-40 bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center h-16">
        {NAV_TABS.map((tab) => {
          const isActive  = pathname.startsWith(tab.matchPrefix)
          const Icon      = tab.icon
          const showBadge = tab.matchPrefix === '/matches' && unread > 0

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 transition-colors duration-150 relative"
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  className={`h-[20px] w-[20px] transition-colors duration-150 ${
                    isActive ? 'text-slate-950' : 'text-slate-400'
                  }`}
                />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none transition-colors duration-150 ${
                isActive ? 'text-slate-950 font-semibold' : 'text-slate-400 font-medium'
              }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
