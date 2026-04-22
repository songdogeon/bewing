/**
 * app/matches/loading.tsx
 *
 * 매칭 페이지 로딩 스켈레톤 — Flat B&W
 */

export default function MatchesLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-white max-w-sm mx-auto">

      {/* 헤더 스켈레톤 */}
      <header className="px-5 pt-14 pb-6 border-b border-slate-100 shrink-0">
        <div className="h-3 w-12 bg-slate-100 mb-2" />
        <div className="h-7 w-16 bg-slate-200 animate-pulse" />
      </header>

      {/* 리스트 스켈레톤 */}
      <main className="flex-1 pb-20">
        <div className="flex justify-end px-5 py-3 border-b border-slate-100">
          <div className="h-3 w-16 bg-slate-100" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="px-5 py-4 border-b border-slate-100 flex items-center gap-3"
            style={{ opacity: 1 - i * 0.14 }}
          >
            {/* 겹친 아바타 */}
            <div className="relative h-14 w-[68px] shrink-0">
              <div className="absolute left-0 top-0 h-14 w-14 bg-slate-100 animate-pulse" />
              <div className="absolute left-8 top-0 h-14 w-14 bg-slate-200 animate-pulse" />
            </div>
            <div className="flex-1 pl-2 space-y-2">
              <div className="h-3.5 w-40 bg-slate-100 animate-pulse" />
              <div className="h-3 w-28 bg-slate-100 animate-pulse" />
              <div className="h-2.5 w-16 bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </main>

    </div>
  )
}
