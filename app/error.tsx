/**
 * app/error.tsx
 *
 * 전역 에러 바운더리 (Next.js App Router)
 *
 * - 'use client' 필수 (Error Boundary는 클라이언트 컴포넌트만 가능)
 * - 모든 Route Segment에서 처리되지 않은 에러를 캐치
 * - reset() 함수로 해당 Segment를 다시 렌더링 시도
 *
 * 적용 범위: app/ 전체 (root error boundary)
 * 제외:      app/layout.tsx의 에러 → global-error.tsx에서 처리
 */

'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

interface ErrorPageProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // 에러 로깅 (프로덕션에서는 Sentry 등 외부 서비스로 전송)
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 text-center max-w-sm mx-auto">

      {/* 아이콘 */}
      <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
        <AlertTriangle className="h-10 w-10 text-orange-500" />
      </div>

      {/* 메시지 */}
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        문제가 발생했어요
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
        일시적인 오류입니다. 잠시 후 다시 시도해주세요.
      </p>

      {/* 에러 digest (개발 환경 디버깅용) */}
      {process.env.NODE_ENV === 'development' && error.message && (
        <code className="text-xs bg-gray-100 rounded-lg px-3 py-2 text-gray-500 mb-6 max-w-full break-all">
          {error.message}
        </code>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
        <Button
          onClick={reset}
          className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </Button>

        <Button asChild variant="outline" className="h-12 rounded-xl">
          <Link href="/home">
            <Home className="h-4 w-4" />
            홈으로 이동
          </Link>
        </Button>
      </div>

    </div>
  )
}
