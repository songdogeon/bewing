/**
 * app/home/loading.tsx
 *
 * 홈 페이지 로딩 스켈레톤 — Flat B&W
 */

export default function HomeLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white max-w-sm mx-auto">

      {/* 헤더 */}
      <header className="px-5 pt-14 pb-6 border-b border-slate-100 shrink-0">
        <div className="h-2.5 w-12 bg-slate-100 mb-2" />
        <div className="h-7 w-32 bg-slate-200 animate-pulse" />
      </header>

      <main className="flex-1 pb-24 space-y-8 pt-6 px-5">

        {/* 내 친구 섹션 */}
        <section className="space-y-3">
          <div className="flex justify-between">
            <div className="h-2.5 w-12 bg-slate-100" />
            <div className="h-2.5 w-6 bg-slate-100" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-4 border border-slate-100">
              <div className="h-12 w-12 bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-28 bg-slate-100 animate-pulse" />
                <div className="h-2.5 w-20 bg-slate-100 animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-slate-100 animate-pulse shrink-0" />
            </div>
          ))}
        </section>

        {/* 매칭 현황 */}
        <section className="space-y-3">
          <div className="h-2.5 w-16 bg-slate-100" />
          <div className="h-28 bg-slate-100 animate-pulse" />
        </section>

      </main>
    </div>
  )
}
