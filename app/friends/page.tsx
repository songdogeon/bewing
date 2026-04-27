/**
 * app/friends/page.tsx
 *
 * 내 친구 관리 페이지 — Flat B&W
 */

import Link  from 'next/link'
import Image from 'next/image'
import { Plus, User, ArrowRight } from 'lucide-react'

import { createClient }  from '@/lib/supabase/server'
import BottomNav         from '@/components/layout/BottomNav'

export const metadata = { title: '내 친구' }

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

interface FriendRow {
  id:           string
  insta_id:     string
  display_name: string | null
  age:          number | null
  gender:       'male' | 'female' | 'other' | null
  region:       string | null
  photoUrl:     string | null
}

// ─────────────────────────────────────────────────────────────
// 데이터 조회 (페이지 내부 직접 조회 — import 의존성 없음)
// ─────────────────────────────────────────────────────────────

async function getMyFriendsForPage(): Promise<FriendRow[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('friend_profiles')
      .select(`
        id, insta_id, display_name, age, gender, region,
        friend_photos ( photo_url, display_order )
      `)
      .eq('registered_by', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error || !data) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((f) => ({
      id:           f.id,
      insta_id:     f.insta_id,
      display_name: f.display_name,
      age:          f.age,
      gender:       f.gender,
      region:       f.region,
      photoUrl: (f.friend_photos ?? [])
        .sort((a: { display_order: number }, b: { display_order: number }) =>
          a.display_order - b.display_order
        )[0]?.photo_url ?? null,
    }))
  } catch {
    return []
  }
}

// ─────────────────────────────────────────────────────────────
// 페이지
// ─────────────────────────────────────────────────────────────

export default async function FriendsPage() {
  const friends = await getMyFriendsForPage()

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-sm mx-auto">

      {/* ── 헤더 ────────────────────────────────────────────── */}
      <header className="px-5 pt-14 pb-6 border-b border-slate-100 shrink-0">
        <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mb-1">
          BeWing
        </p>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold text-slate-950">내 친구</h1>
          <span className="text-3xl font-black text-slate-950 tabular-nums leading-none mb-0.5">
            {friends.length}
            <span className="text-base font-medium text-slate-400">/5</span>
          </span>
        </div>
      </header>

      {/* ── 본문 ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20">
        {friends.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {friends.map((friend) => (
              <FriendItem key={friend.id} friend={friend} />
            ))}

            {friends.length < 5 && (
              <Link
                href="/friends/register"
                className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="h-14 w-14 bg-slate-100 flex items-center justify-center shrink-0 border border-dashed border-slate-300">
                  <Plus className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-500">친구 추가하기</p>
                  <p className="text-xs text-slate-400 mt-0.5">{friends.length}/5명 등록됨</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
              </Link>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// FriendItem
// ─────────────────────────────────────────────────────────────

function FriendItem({ friend }: { friend: FriendRow }) {
  const name = friend.display_name ?? `@${friend.insta_id}`
  const genderLabel =
    friend.gender === 'male'   ? '남성' :
    friend.gender === 'female' ? '여성' :
    friend.gender === 'other'  ? '기타' : null

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
      <div className="h-14 w-14 bg-slate-100 overflow-hidden shrink-0">
        {friend.photoUrl ? (
          <Image
            src={friend.photoUrl}
            alt={name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-950 text-sm truncate">{name}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">@{friend.insta_id}</p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
          {friend.age && <span>{friend.age}세</span>}
          {genderLabel && <><span>·</span><span>{genderLabel}</span></>}
          {friend.region && <><span>·</span><span>{friend.region}</span></>}
        </div>
      </div>

      <Link
        href="/swipe"
        className="shrink-0 text-xs text-slate-400 hover:text-slate-950 transition-colors"
      >
        스와이프 →
      </Link>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-8 text-center">
      <div className="h-16 w-16 bg-slate-100 flex items-center justify-center">
        <User className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-slate-950">등록된 친구가 없어요</p>
        <p className="text-sm text-slate-500 leading-relaxed">
          친구 프로필을 등록하고<br />스와이프를 시작해보세요.
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
