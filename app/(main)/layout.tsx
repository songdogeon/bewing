/**
 * app/(main)/layout.tsx
 *
 * 인증 후 주요 페이지 공통 레이아웃
 * (home, wingman, matches 페이지가 이 레이아웃을 공유)
 *
 * 구조:
 *   ┌────────────────────────────┐
 *   │  {children}  (flex-1)      │  ← 각 페이지 콘텐츠
 *   ├────────────────────────────┤
 *   │  BottomNav (56px, fixed)   │  ← 모바일 하단 네비게이션
 *   └────────────────────────────┘
 *
 * Route Group (main):
 *   괄호로 감싼 폴더명은 URL에 포함되지 않음
 *   /home, /wingman, /matches → 실제 URL 그대로 유지
 *
 * NOTE: 이 레이아웃을 사용하려면 관련 페이지를
 *     app/(main)/home/, app/(main)/wingman/ 등으로 이동해야 합니다.
 *     지금은 app/home/page.tsx를 직접 생성하고 BottomNav만 포함합니다.
 */

import BottomNav from '@/components/layout/BottomNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* 페이지 콘텐츠 — BottomNav 높이(56px)만큼 하단 패딩 */}
      <div className="flex-1 pb-14">
        {children}
      </div>

      {/* 하단 네비게이션 (fixed) */}
      <BottomNav />
    </div>
  )
}
