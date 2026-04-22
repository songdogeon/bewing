/**
 * app/home/page.tsx
 *
 * 홈 대시보드 — Wingman 컨셉 / Flat B&W
 *
 * 구성:
 *   1. 헤더: BeWing + Wingman 이름
 *   2. 내 친구 목록 (최대 5개) — 각 친구에서 스와이프 시작 가능
 *   3. 매칭 현황 요약 블록
 *   4. 빈 상태: 친구 미등록 시 CTA
 */

import Link  from 'next/link'
import Image from 'next/image'
import { Plus, ArrowRight, Users, User } from 'lucide-react'

import { createClient }        from '@/lib/supabase/server'
import { getMyFriends }        from '@/app/swipe/actions'
import { getMyWingmanMatches } from '@/app/matches/actions'
import BottomNav               from '@/components/layout/BottomNav'
import type { MyFriend }       from '@/app/swipe/actions'

export const metadata = { title: '홈' }

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Wingman 프로필 조회
  const { data: profile } = await supabase
    .from('wingman_profiles')
    .select('insta_id, display_name')
    .eq('id', user?.id ?? '')
    .single()

  const [friends, matches] = await Promise.all([
    getMyFriends(),
    getMyWingmanMatches('active'),
  ])

  const wingmanName =
    profile?.display_name ??
    (profile?.insta_id ? `@${profile.insta_id}` : '사용자')

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-sm mx-auto">

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-6 border-b border-slate-100 shrink-0">
        <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mb-1">
          BeWing
        </p>
        <h1 className="text-2xl font-bold text-slate-950 leading-tight">
          {wingmanName}
        </h1>
      </header>

      <main className="flex-1 pb-24 space-y-8">

        {/* ── 친구 목록 ──────────────────────────────────────── */}
        <section className="pt-6 px-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-slate-400 font-medium tracking-widest uppercase">
              내 친구
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">
              {friends.length}/5
            </span>
          </div>

          {friends.length === 0 ? (
            <EmptyFriendsState />
          ) : (
            <>
              {friends.map((friend) => (
                <FriendRow key={friend.id} friend={friend} />
              ))}

              {/* 친구 추가 버튼 */}
              {friends.length < 5 && (
                <Link
                  href="/friends/register"
                  className="flex items-center gap-3 px-4 py-4 border border-dashed border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-600 transition-colors"
                >
                  <div className="h-10 w-10 bg-slate-100 flex items-center justify-center shrink-0">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">친구 추가하기</span>
                </Link>
              )}
            </>
          )}
        </section>

        {/* ── 매칭 현황 ───────────────────────────────────────── */}
        {friends.length > 0 && (
          <section className="px-5 space-y-3">
            <h2 className="text-xs text-slate-400 font-medium tracking-widest uppercase">
              매칭 현황
            </h2>

            <Link href="/matches" className="block group">
              <div className="bg-slate-950 p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-white leading-none tabular-nums">
                      {matches.length}
                    </span>
                    <span className="text-base font-medium text-slate-500 mb-1">건</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {matches.length > 0
                      ? '탭하여 매칭 상세 확인'
                      : '스와이프를 시작해보세요'}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
              </div>
            </Link>
          </section>
        )}

        {/* ── 사용 방법 (친구 있고 매칭 없을 때) ──────────────── */}
        {friends.length > 0 && matches.length === 0 && (
          <section className="px-5 space-y-3">
            <h2 className="text-xs text-slate-400 font-medium tracking-widest uppercase">
              이용 방법
            </h2>
            <div className="space-y-0">
              {[
                { step: '01', title: '친구 선택',  desc: '스와이프할 내 친구를 선택해요' },
                { step: '02', title: '스와이프',   desc: '상대 Wingman의 친구를 Like해요' },
                { step: '03', title: '매칭 & 소개', desc: 'Wingman끼리 연락해 서로 소개해줘요' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 py-4 border-b border-slate-100 last:border-0"
                >
                  <span className="text-xs font-bold text-slate-300 tabular-nums pt-0.5 w-5 shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <BottomNav />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// FriendRow — 친구 한 줄 카드
// ─────────────────────────────────────────────────────────────

function FriendRow({ friend }: { friend: MyFriend }) {
  const name = friend.display_name ?? `@${friend.insta_id}`
  const genderLabel =
    friend.gender === 'male'   ? '남' :
    friend.gender === 'female' ? '여' :
    friend.gender === 'other'  ? '기타' : null

  return (
    <div className="flex items-center gap-4 px-4 py-4 border border-slate-100">
      {/* 사진 */}
      <div className="h-12 w-12 bg-slate-100 overflow-hidden shrink-0">
        {friend.photoUrl ? (
          <Image
            src={friend.photoUrl}
            alt={name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-950 text-sm truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
          {friend.age && <span>{friend.age}세</span>}
          {genderLabel && <><span>·</span><span>{genderLabel}</span></>}
          {friend.region && <><span>·</span><span>{friend.region}</span></>}
        </div>
      </div>

      {/* 스와이프 시작 */}
      <Link
        href="/swipe"
        className="shrink-0 flex items-center gap-1.5 h-8 px-3 bg-slate-950 text-white text-xs font-semibold hover:bg-black transition-colors"
      >
        <Users className="h-3 w-3" />
        스와이프
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EmptyFriendsState
// ─────────────────────────────────────────────────────────────

function EmptyFriendsState() {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="h-16 w-16 bg-slate-100 flex items-center justify-center">
        <User className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-slate-950">아직 등록된 친구가 없어요</p>
        <p className="text-sm text-slate-500 leading-relaxed">
          친구를 등록하고<br />스와이프를 시작해보세요.
        </p>
      </div>
      <Link
        href="/friends/register"
        className="flex items-center gap-2 h-12 px-6 bg-slate-950 text-white text-sm font-semibold hover:bg-black transition-colors"
      >
        <Plus className="h-4 w-4" />
        친구 등록하기
      </Link>
    </div>
  )
}
