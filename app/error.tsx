'use client'

import { useEffect } from 'react'
import { RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6 text-center max-w-sm mx-auto">

      <div className="h-16 w-16 bg-slate-100 flex items-center justify-center mb-6">
        <span className="text-2xl font-black text-slate-400">!</span>
      </div>

      <h1 className="text-xl font-bold text-slate-950 mb-2">
        문제가 발생했어요
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mb-2">
        일시적인 오류입니다. 잠시 후 다시 시도해주세요.
      </p>

      {process.env.NODE_ENV === 'development' && error.message && (
        <code className="text-xs bg-slate-100 px-3 py-2 text-slate-500 mb-6 max-w-full break-all block">
          {error.message}
        </code>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
        <button
          onClick={reset}
          className="h-12 bg-slate-950 hover:bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>

        <Link
          href="/home"
          className="h-12 border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <Home className="h-4 w-4" />
          홈으로 이동
        </Link>
      </div>

    </div>
  )
}
