import Link         from 'next/link'
import { Settings }  from 'lucide-react'

import { createClient }      from '@/lib/supabase/server'
import BottomNav             from '@/components/layout/BottomNav'
import FriendsListClient, { type FriendRow } from './FriendsListClient'

export const metadata = { title: '내 친구' }

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
          <div className="flex items-center gap-3 mb-0.5">
            <span className="text-3xl font-black text-slate-950 tabular-nums leading-none">
              {friends.length}
              <span className="text-base font-medium text-slate-400">/5</span>
            </span>
            <Link
              href="/settings"
              className="p-1.5 text-slate-400 hover:text-slate-950 transition-colors"
              aria-label="설정"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 본문 ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <FriendsListClient initialFriends={friends} />
      </main>

      <BottomNav />
    </div>
  )
}
