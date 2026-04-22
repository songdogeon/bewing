/**
 * components/swipe/SwipeCard.tsx
 *
 * 풀블리드 친구 프로필 카드 — Flat B&W 미니멀
 * 새 Wingman 컨셉 기준: card.id = friend_profiles.id
 */

'use client'

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  animate,
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import { MapPin } from 'lucide-react'

import type { CardData, SwipeDirection } from '@/lib/types/swipe.types'

// ─────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD         = 100
const VELOCITY_THRESHOLD      = 500
const FLY_DISTANCE_MULTIPLIER = 1.5

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

export interface SwipeCardProps {
  card:       CardData
  isTop:      boolean
  stackIndex: number
  onSwipe:    (direction: SwipeDirection, card: CardData) => void
}

export interface SwipeCardHandle {
  swipeTo: (direction: SwipeDirection) => Promise<void>
}

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ card, isTop, stackIndex, onSwipe }, ref) {
    const [photoIndex, setPhotoIndex] = useState(0)
    const [photoError, setPhotoError] = useState<Record<number, boolean>>({})
    const isDraggingRef   = useRef(false)
    const dragDistanceRef = useRef(0)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const rotate      = useTransform(x, [-200, 0, 200], [-18, 0, 18])
    const likeOpacity = useTransform(x, [0, 80],  [0, 1], { clamp: true })
    const passOpacity = useTransform(x, [0, -80], [0, 1], { clamp: true })

    const flyAway = useCallback(
      async (direction: SwipeDirection) => {
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400
        const targetX = direction === 'right'
          ? screenWidth * FLY_DISTANCE_MULTIPLIER
          : -screenWidth * FLY_DISTANCE_MULTIPLIER
        await animate(x, targetX, { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] })
        onSwipe(direction, card)
      },
      [x, card, onSwipe]
    )

    useImperativeHandle(ref, () => ({ swipeTo: flyAway }), [flyAway])

    const handleDragStart = () => {
      isDraggingRef.current   = true
      dragDistanceRef.current = 0
    }

    const handleDragEnd = async (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo
    ) => {
      isDraggingRef.current = false
      const { x: offsetX   } = info.offset
      const { x: velocityX } = info.velocity
      const shouldSwipeRight = offsetX > SWIPE_THRESHOLD  || velocityX >  VELOCITY_THRESHOLD
      const shouldSwipeLeft  = offsetX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD
      if      (shouldSwipeRight) await flyAway('right')
      else if (shouldSwipeLeft)  await flyAway('left')
      else {
        animate(x, 0, { type: 'spring', stiffness: 280, damping: 22 })
        animate(y, 0, { type: 'spring', stiffness: 280, damping: 22 })
      }
    }

    const handlePhotoTap = (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDraggingRef.current) return
      if (Math.abs(dragDistanceRef.current) > 8) return
      const rect      = e.currentTarget.getBoundingClientRect()
      const isLeftSide = (e.clientX - rect.left) < rect.width / 3
      if (isLeftSide) setPhotoIndex((p) => Math.max(0, p - 1))
      else            setPhotoIndex((p) => Math.min((card.photos?.length ?? 1) - 1, p + 1))
    }

    const stackScale = 1 - stackIndex * 0.035
    const stackY     = stackIndex * 12

    const photos       = card.photos?.length > 0 ? card.photos : []
    const currentPhoto = photos.length > 0 ? photos[photoIndex] : null
    const showError    = photoError[photoIndex]

    return (
      <motion.div
        style={{
          x:          isTop ? x : 0,
          y:          isTop ? y : stackY,
          rotate:     isTop ? rotate : 0,
          scale:      stackScale,
          zIndex:     10 - stackIndex,
          willChange: isTop ? 'transform' : 'auto',
        }}
        drag={isTop}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={isTop ? {} : { scale: stackScale, y: stackY, opacity: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`absolute inset-0 overflow-hidden bg-slate-900 select-none
          ${isTop
            ? 'shadow cursor-grab active:cursor-grabbing'
            : 'shadow-sm cursor-default pointer-events-none'}
        `}
      >
        {/* ── 풀블리드 사진 ──────────────────────────────────── */}
        <div
          className="relative w-full h-full"
          onPointerUp={isTop ? handlePhotoTap : undefined}
        >
          {currentPhoto && !showError ? (
            <img
              src={currentPhoto}
              alt={`${card.insta_id}의 사진 ${photoIndex + 1}`}
              className="w-full h-full object-cover"
              draggable={false}
              onError={() => setPhotoError((prev) => ({ ...prev, [photoIndex]: true }))}
            />
          ) : (
            <PhotoPlaceholder name={card.display_name ?? card.insta_id} />
          )}

          {/* 하단 그라디언트 */}
          <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* ── 사진 인디케이터 ──────────────────────────── */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-4 right-4 flex gap-1">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-[3px] flex-1 transition-all duration-200 ${
                    i === photoIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* ── 하단 정보 ─────────────────────────────────── */}
          <div className="absolute bottom-0 inset-x-0 px-5 pb-5 text-white">

            {/* Wingman 배지 */}
            {card.wingmanName && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 backdrop-blur-sm text-white/80 px-3 py-1 border border-white/15">
                  {card.wingmanName}의 소개
                </span>
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                {/* 이름 + 나이 */}
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl font-bold leading-tight truncate">
                    {card.display_name ?? `@${card.insta_id}`}
                  </h2>
                  {card.age > 0 && (
                    <span className="text-lg font-light text-white/70 shrink-0">
                      {card.age}
                    </span>
                  )}
                </div>

                {/* 인스타 ID */}
                <p className="text-sm text-white/50 mt-0.5 truncate">
                  @{card.insta_id}
                </p>

                {/* 지역 */}
                {card.region && (
                  <div className="flex items-center gap-1 mt-1 text-white/60">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-sm">{card.region}</span>
                  </div>
                )}

                {/* Bio */}
                {card.bio && (
                  <p className="mt-2 text-sm text-white/55 line-clamp-2 leading-relaxed">
                    {card.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── LIKE 스탬프 ──────────────────────────────── */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-5 rotate-[-12deg] pointer-events-none"
          >
            <div className="border-2 border-white px-3 py-1.5">
              <span className="text-white font-black text-xl tracking-[0.15em]">LIKE</span>
            </div>
          </motion.div>

          {/* ── PASS 스탬프 ──────────────────────────────── */}
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-8 right-5 rotate-[12deg] pointer-events-none"
          >
            <div className="border-2 border-white/50 px-3 py-1.5">
              <span className="text-white/60 font-black text-xl tracking-[0.15em]">PASS</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }
)

// ─────────────────────────────────────────────────────────────
// PhotoPlaceholder
// ─────────────────────────────────────────────────────────────

function PhotoPlaceholder({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4">
      <div className="h-24 w-24 bg-slate-800 flex items-center justify-center">
        <span className="text-4xl font-bold text-slate-400">{initial}</span>
      </div>
    </div>
  )
}
