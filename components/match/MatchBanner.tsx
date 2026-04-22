/**
 * components/match/MatchBanner.tsx
 *
 * 매칭 성공 오버레이 — Wingman 컨셉 / Flat B&W
 */

'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'

interface MatchBannerProps {
  isVisible:          boolean
  matchedInstagramId: string   // 매칭된 상대 친구의 insta_id
  onClose:            () => void
  autoCloseDuration?: number
}

export default function MatchBanner({
  isVisible,
  matchedInstagramId,
  onClose,
  autoCloseDuration = 8000,
}: MatchBannerProps) {
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(onClose, autoCloseDuration)
    return () => clearTimeout(timer)
  }, [isVisible, onClose, autoCloseDuration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="match-banner"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="fixed top-5 right-5 p-2 text-white/40 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 콘텐츠 */}
          <div className="flex flex-col items-center gap-8 text-center text-white max-w-xs w-full">

            {/* 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-3"
            >
              <p className="text-xs font-medium tracking-[0.3em] uppercase text-white/40">
                Match
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                두 친구가<br />매칭됐습니다!
              </h2>
            </motion.div>

            {/* 매칭된 친구 ID */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="border border-white/20 px-5 py-3 w-full"
            >
              <p className="text-xs text-white/40 mb-1">매칭된 친구</p>
              <p className="text-base font-semibold text-white">
                @{matchedInstagramId}
              </p>
            </motion.div>

            {/* 안내 문구 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-sm text-white/50 leading-relaxed"
            >
              Wingman끼리 연락해서<br />
              서로의 친구를 소개해주세요.
            </motion.p>

            {/* 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="flex flex-col gap-3 w-full"
            >
              <Link
                href="/matches"
                onClick={onClose}
                className="w-full h-12 bg-white text-slate-950 font-semibold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                매칭 확인하기
              </Link>

              <button
                onClick={onClose}
                className="w-full h-12 border border-white/20 text-white/60 font-medium text-sm hover:text-white hover:border-white/40 transition-colors"
              >
                계속 스와이프
              </button>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
