'use client'

/**
 * app/swipe/SwipePageClient.tsx
 *
 * 스와이프 플로우 클라이언트 컴포넌트
 *
 * 두 가지 뷰:
 *   1. 친구 선택  — 내가 등록한 친구 중 "누구를 위해 스와이프?"
 *   2. 스와이프   — 선택된 친구 기준으로 카드 덱 표시
 */

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Plus, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { SwipeStack }        from '@/components/swipe/SwipeStack'
import MatchBanner           from '@/components/match/MatchBanner'
import { getSwipeCards, recordFriendSwipe } from './actions'
import type { MyFriend }     from './actions'
import type { CardData, SwipeDirection } from '@/lib/types/swipe.types'

// ─────────────────────────────────────────────────────────────

interface Props {
  myFriends: MyFriend[]
}

type View = 'select' | 'swipe'

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function SwipePageClient({ myFriends }: Props) {
  const [view,           setView]           = useState<View>('select')
  const [selectedFriend, setSelectedFriend] = useState<MyFriend | null>(null)
  const [cards,          setCards]          = useState<CardData[]>([])
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [matchVisible,   setMatchVisible]   = useState(false)
  const [matchedInstaId, setMatchedInstaId] = useState('')

  // ── 친구 선택 → 카드 로드 ──────────────────────────────────

  const handleSelectFriend = async (friend: MyFriend) => {
    setSelectedFriend(friend)
    setIsLoadingCards(true)
    setView('swipe')

    const loaded = await getSwipeCards(friend.id)
    setCards(loaded)
    setIsLoadingCards(false)
  }

  // ── 스와이프 처리 ──────────────────────────────────────────

  const handleSwipe = useCallback(
    async (direction: SwipeDirection, card: CardData) => {
      if (!selectedFriend) return

      const swipeDir = direction === 'right' ? 'like' : 'pass'
      const result = await recordFriendSwipe(selectedFriend.id, card.id, swipeDir)

      if ('error' in result) {
        console.error('[handleSwipe]', result.error)
        return
      }

      if (result.isMatch) {
        setMatchedInstaId(result.matchedInstaId)
        setMatchVisible(true)
      }
    },
    [selectedFriend]
  )

  // ── 뒤로가기 ──────────────────────────────────────────────

  const handleBack = () => {
    setView('select')
    setSelectedFriend(null)
    setCards([])
  }

  // ─────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────

  return (
    <>
      <AnimatePresence mode="wait">

        {/* ── 뷰 1: 친구 선택 ──────────────────────────────── */}
        {view === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* 헤더 */}
            <header className="px-5 pt-14 pb-6 shrink-0">
              <p className="text-xs text-slate-400 font-medium tracking-widest uppercase mb-1">
                BeWing
              </p>
              <h1 className="text-2xl font-bold text-slate-950">누구를 위해?</h1>
              <p className="text-sm text-slate-500 mt-1">
                스와이프할 친구를 선택하세요.
              </p>
            </header>

            {/* 친구 목록 */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-2">

              {myFriends.length === 0 ? (
                /* 등록된 친구 없음 */
                <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                  <div className="h-16 w-16 bg-slate-100 flex items-center justify-center">
                    <User className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold text-slate-950">등록된 친구가 없어요</p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      먼저 친구 프로필을 등록해야<br />스와이프를 시작할 수 있어요.
                    </p>
                  </div>
                  <Link
                    href="/friends/register"
                    className="flex items-center gap-2 px-6 h-12 bg-slate-950 text-white text-sm font-semibold hover:bg-black transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    친구 등록하기
                  </Link>
                </div>
              ) : (
                <>
                  {myFriends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      friend={friend}
                      onSelect={handleSelectFriend}
                    />
                  ))}

                  {/* 친구 추가 버튼 (5명 미만일 때) */}
                  {myFriends.length < 5 && (
                    <Link
                      href="/friends/register"
                      className="flex items-center gap-3 px-4 py-4 border border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <div className="h-12 w-12 bg-slate-100 flex items-center justify-center shrink-0">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">친구 추가</p>
                        <p className="text-xs mt-0.5">
                          {myFriends.length}/5명 등록됨
                        </p>
                      </div>
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ── 뷰 2: 스와이프 덱 ────────────────────────────── */}
        {view === 'swipe' && selectedFriend && (
          <motion.div
            key="swipe"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* 헤더 */}
            <header className="shrink-0 px-5 pt-14 pb-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-950 transition-colors mb-4"
                aria-label="친구 선택으로 돌아가기"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs font-medium">친구 변경</span>
              </button>

              <div className="flex items-center gap-3">
                {/* 선택된 친구 아바타 */}
                <div className="h-9 w-9 bg-slate-100 overflow-hidden shrink-0">
                  {selectedFriend.photoUrl ? (
                    <Image
                      src={selectedFriend.photoUrl}
                      alt={selectedFriend.insta_id}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-500">
                        {(selectedFriend.display_name ?? selectedFriend.insta_id).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">스와이프 중인 친구</p>
                  <p className="text-sm font-bold text-slate-950 truncate">
                    {selectedFriend.display_name ?? `@${selectedFriend.insta_id}`}
                  </p>
                </div>

                {!isLoadingCards && (
                  <span className="ml-auto text-xs text-slate-400 tabular-nums shrink-0">
                    {cards.length}명
                  </span>
                )}
              </div>
            </header>

            {/* 카드 덱 */}
            <main className="flex-1 px-4 pb-4 min-h-0 overflow-hidden">
              {isLoadingCards ? (
                <SwipeLoadingSkeleton />
              ) : (
                <SwipeStack
                  cards={cards}
                  onSwipe={handleSwipe}
                />
              )}
            </main>
          </motion.div>
        )}

      </AnimatePresence>

      {/* 매칭 배너 */}
      <MatchBanner
        isVisible={matchVisible}
        matchedInstagramId={matchedInstaId}
        onClose={() => setMatchVisible(false)}
      />
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// FriendCard — 친구 선택 아이템
// ─────────────────────────────────────────────────────────────

function FriendCard({
  friend,
  onSelect,
}: {
  friend:   MyFriend
  onSelect: (f: MyFriend) => void
}) {
  const genderLabel =
    friend.gender === 'male'   ? '남성' :
    friend.gender === 'female' ? '여성' :
    friend.gender === 'other'  ? '기타' : null

  return (
    <button
      onClick={() => onSelect(friend)}
      className="w-full flex items-center gap-4 px-4 py-4 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group"
    >
      {/* 썸네일 */}
      <div className="h-14 w-14 bg-slate-100 overflow-hidden shrink-0">
        {friend.photoUrl ? (
          <Image
            src={friend.photoUrl}
            alt={friend.insta_id}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl font-bold text-slate-400">
              {(friend.display_name ?? friend.insta_id).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-950 truncate">
          {friend.display_name ?? `@${friend.insta_id}`}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          @{friend.insta_id}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          {friend.age && <span>{friend.age}세</span>}
          {genderLabel && <span>· {genderLabel}</span>}
          {friend.region && <span>· {friend.region}</span>}
        </div>
      </div>

      {/* 화살표 */}
      <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-sm shrink-0">
        →
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// 로딩 스켈레톤
// ─────────────────────────────────────────────────────────────

function SwipeLoadingSkeleton() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-slate-100 scale-[0.93] translate-y-5 origin-bottom" />
        <div className="absolute inset-0 bg-slate-200 scale-[0.97] translate-y-2.5 origin-bottom" />
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      </div>
      <div className="flex items-center justify-center gap-4 pb-2">
        <div className="h-[52px] w-28 bg-slate-100 animate-pulse" />
        <div className="h-9 w-9 bg-slate-100 animate-pulse" />
        <div className="h-[52px] w-28 bg-slate-100 animate-pulse" />
      </div>
    </div>
  )
}
