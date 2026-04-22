/**
 * app/swipe/page.tsx
 *
 * 스와이프 페이지 — 서버 컴포넌트
 *
 * 서버에서: 내 친구 목록(getMyFriends) pre-fetch
 * 클라이언트: 친구 선택 → 카드 로드 → 스와이프 (SwipePageClient)
 */

import { getMyFriends } from './actions'
import SwipePageClient  from './SwipePageClient'
import BottomNav        from '@/components/layout/BottomNav'

export const metadata = { title: '스와이프' }

export default async function SwipePage() {
  const myFriends = await getMyFriends()

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
      <SwipePageClient myFriends={myFriends} />
      <BottomNav />
    </div>
  )
}
