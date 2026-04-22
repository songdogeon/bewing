/**
 * components/swipe/SwipeStack.tsx
 *
 * 스와이프 카드 스택 — Black & White 미니멀
 *
 * Like / Pass: 텍스트 버튼만 사용
 */

'use client'

import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { SwipeCard, SwipeCardHandle } from './SwipeCard'
import type { CardData, SwipeDirection } from '@/lib/types/swipe.types'

const MAX_VISIBLE_CARDS = 3

export interface SwipeStackProps {
  cards:    CardData[]
  onSwipe?: (direction: SwipeDirection, card: CardData) => void
  onEmpty?: () => void
}

interface SwipeHistoryItem {
  direction: SwipeDirection
  card:      CardData
}

export function SwipeStack({ cards: initialCards, onSwipe, onEmpty }: SwipeStackProps) {
  const [activeCards,  setActiveCards]  = useState<CardData[]>(initialCards)
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryItem[]>([])
  const [isAnimating,  setIsAnimating]  = useState(false)

  const topCardRef = useRef<SwipeCardHandle>(null)

  const handleSwipe = useCallback(
    (direction: SwipeDirection, card: CardData) => {
      setIsAnimating(false)
      setSwipeHistory((prev) => {
        const next = [...prev, { direction, card }]
        return next.length > 10 ? next.slice(-10) : next
      })
      setActiveCards((prev) => {
        const next = prev.filter((c) => c.id !== card.id)
        if (next.length === 0) onEmpty?.()
        return next
      })
      onSwipe?.(direction, card)
    },
    [onSwipe, onEmpty]
  )

  const handleLike = async () => {
    if (!topCardRef.current || isAnimating) return
    setIsAnimating(true)
    await topCardRef.current.swipeTo('right')
  }

  const handlePass = async () => {
    if (!topCardRef.current || isAnimating) return
    setIsAnimating(true)
    await topCardRef.current.swipeTo('left')
  }

  const handleUndo = () => {
    if (swipeHistory.length === 0 || isAnimating) return
    const last = swipeHistory[swipeHistory.length - 1]
    setActiveCards((prev) => [last.card, ...prev])
    setSwipeHistory((prev) => prev.slice(0, -1))
  }

  const visibleCards = activeCards.slice(0, MAX_VISIBLE_CARDS)

  return (
    <div className="flex flex-col h-full">

      {/* ── 카드 스택 ──────────────────────────────────────── */}
      <div className="relative flex-1">
        <AnimatePresence>
          {visibleCards.length > 0 ? (
            [...visibleCards].reverse().map((card, reversedIndex) => {
              const stackIndex = visibleCards.length - 1 - reversedIndex
              const isTop      = stackIndex === 0
              return (
                <SwipeCard
                  key={card.id}
                  ref={isTop ? topCardRef : undefined}
                  card={card}
                  isTop={isTop}
                  stackIndex={stackIndex}
                  onSwipe={handleSwipe}
                />
              )
            })
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white border border-slate-200"
            >
              <div className="text-center space-y-2 px-8">
                <p className="font-semibold text-slate-950 text-lg leading-snug">
                  오늘의 카드를<br />모두 확인했어요
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  새 카드는 매일 업데이트돼요
                </p>
              </div>

              <Link
                href="/matches"
                className="px-6 py-3 bg-slate-950 text-white text-sm font-medium hover:bg-black transition-colors"
              >
                내 매칭 확인하기
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 남은 카드 수 ─────────────────────────────────────── */}
      <div className="h-5 flex items-center justify-center mt-2">
        {activeCards.length > 0 && (
          <p className="text-xs text-slate-400 tabular-nums">
            {activeCards.length}명 남음
          </p>
        )}
      </div>

      {/* ── 액션 버튼 ────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 pt-1 pb-3">

        {/* Pass */}
        <ActionButton
          onClick={handlePass}
          disabled={visibleCards.length === 0 || isAnimating}
          aria-label="Pass"
          className="h-13 px-10 bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 shadow-sm"
          style={{ height: '52px' }}
        >
          Pass
        </ActionButton>

        {/* Undo */}
        <ActionButton
          onClick={handleUndo}
          disabled={swipeHistory.length === 0 || isAnimating}
          aria-label="되돌리기"
          className="h-9 w-9 bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 shadow-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </ActionButton>

        {/* Like */}
        <ActionButton
          onClick={handleLike}
          disabled={visibleCards.length === 0 || isAnimating}
          aria-label="Like"
          className="h-13 px-10 bg-slate-950 text-white text-sm font-medium hover:bg-black shadow-sm"
          style={{ height: '52px' }}
        >
          Like
        </ActionButton>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ActionButton
// ─────────────────────────────────────────────────────────────

function ActionButton({
  onClick,
  disabled,
  'aria-label': ariaLabel,
  className,
  style,
  children,
}: {
  onClick:      () => void
  disabled:     boolean
  'aria-label': string
  className:    string
  style?:       React.CSSProperties
  children:     React.ReactNode
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
      className={`
        flex items-center justify-center transition-colors
        ${className}
        ${disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}
      `}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    >
      {children}
    </motion.button>
  )
}
