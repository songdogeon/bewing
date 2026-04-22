'use client'

/**
 * app/matches/MatchListClient.tsx
 *
 * 매칭 리스트 — 클라이언트 컴포넌트 (Wingman 컨셉)
 *
 * - props로 초기 목록 수신
 * - 새로고침 버튼으로 최신 목록 재조회
 * - Realtime: wingman_matches INSERT → 자동 갱신
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import MatchCard              from '@/components/match/MatchCard'
import { createClient }       from '@/lib/supabase/client'
import { getMyWingmanMatches, type WingmanMatchItem } from './actions'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────

interface Props {
  initialMatches: WingmanMatchItem[]
}

interface WingmanMatchPayload {
  id: string
  wingman1_id: string
  wingman2_id: string
  status: string
  created_at: string
}

// ─────────────────────────────────────────────────────────────

export default function MatchListClient({ initialMatches }: Props) {
  const [matches,      setMatches]      = useState<WingmanMatchItem[]>(initialMatches)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userId,       setUserId]       = useState<string | null>(null)

  const supabaseRef = useRef(createClient())

  // ── 현재 유저 ID ──────────────────────────────────────────
  useEffect(() => {
    supabaseRef.current.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })
  }, [])

  // ── Realtime 구독 ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    const supabase = supabaseRef.current

    async function handleNewMatch(
      _payload: RealtimePostgresInsertPayload<WingmanMatchPayload>
    ) {
      const fresh = await getMyWingmanMatches('active')
      setMatches(fresh)
    }

    const channel = supabase
      .channel(`wingman-matches:${userId}`)
      .on<WingmanMatchPayload>(
        'postgres_changes',
        {
          event: 'INSERT', schema: 'public', table: 'wingman_matches',
          filter: `wingman1_id=eq.${userId}`,
        },
        handleNewMatch
      )
      .on<WingmanMatchPayload>(
        'postgres_changes',
        {
          event: 'INSERT', schema: 'public', table: 'wingman_matches',
          filter: `wingman2_id=eq.${userId}`,
        },
        handleNewMatch
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  // ── 수동 새로고침 ─────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      const fresh = await getMyWingmanMatches('active')
      setMatches(fresh)
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing])

  // ─────────────────────────────────────────────────────────
  return (
    <div className="pb-8">

      {/* 새로고침 */}
      <div className="flex justify-end px-5 py-3 border-b border-slate-100">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {/* 매칭 카드 목록 */}
      {matches.map((match) => (
        <MatchCard key={match.matchId} match={match} />
      ))}
    </div>
  )
}
