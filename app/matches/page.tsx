/**
 * app/matches/page.tsx
 *
 * 매칭 리스트 페이지 — Wingman 컨셉 / Flat B&W
 */

import { Users } from 'lucide-react'
import Link      from 'next/link'

import { getMyWingmanMatches } from './actions'
import MatchListClient         from './MatchListClient'
import BottomNav               from '@/components/layout/BottomNav'

export const metadata = { title: '매칭' }

export default async function MatchesPage() {
  const matches = await getMyWingmanMatches('active')

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-sm mx-auto">

      {/* ── 헤더 ────────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-6 border-b border-slate-100 shrink-0">
        <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mb-1">
          BeWing
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold text-slate-950">매칭</h1>
          {matches.length > 0 && (
            <span className="text-3xl font-black text-slate-950 tabular-nums leading-none mb-0.5">
              {matches.length}
            </span>
          )}
        </div>
      </header>

      {/* ── 본문 ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20">
        {matches.length === 0 ? (
          <EmptyState />
        ) : (
          <MatchListClient initialMatches={matches} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 빈 상태
// ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-8 text-center">
      <div className="h-20 w-20 bg-slate-100 flex items-center justify-center">
        <Users className="h-9 w-9 text-slate-300" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-950">
          아직 매칭이 없어요
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          친구를 위해 스와이프해보세요.<br />
          상대 Wingman도 좋아하면 매칭됩니다.
        </p>
      </div>

      <Link
        href="/swipe"
        className="flex items-center justify-center h-12 px-8 bg-slate-950 text-white text-sm font-semibold hover:bg-black transition-colors"
      >
        스와이프하러 가기
      </Link>
    </div>
  )
}
