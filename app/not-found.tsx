/**
 * app/not-found.tsx
 *
 * 404 Not Found 페이지 — Flat B&W
 */

import Link from 'next/link'
import { Home, ArrowRight } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center max-w-sm mx-auto">

      {/* 숫자 */}
      <span className="text-[120px] font-black text-slate-100 leading-none select-none">
        404
      </span>

      {/* 메시지 */}
      <h1 className="text-xl font-bold text-slate-950 mt-4 mb-2">
        페이지를 찾을 수 없어요
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed">
        주소가 잘못됐거나 삭제된 페이지예요.
        <br />
        아래 버튼으로 돌아가세요.
      </p>

      {/* 버튼 */}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-10">
        <Link
          href="/home"
          className="flex items-center justify-center gap-2 h-12 bg-slate-950 text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          <Home className="h-4 w-4" />
          홈으로 가기
        </Link>

        <Link
          href="/swipe"
          className="flex items-center justify-center gap-2 h-12 border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          스와이프하러 가기
        </Link>
      </div>

    </div>
  )
}
