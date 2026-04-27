/**
 * app/terms/page.tsx
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: '서비스 이용약관' }

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white max-w-sm mx-auto px-5">
      <header className="pt-14 pb-6 border-b border-slate-100">
        <Link
          href="/home"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로
        </Link>
        <h1 className="text-2xl font-bold text-slate-950">서비스 이용약관</h1>
      </header>

      <main className="py-8 space-y-6 text-sm text-slate-600 leading-relaxed pb-20">
        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">1. 서비스 이용</h2>
          <p>BeWing은 Wingman(소개자)이 친구를 대신해 소개하는 매칭 서비스입니다. 만 18세 이상만 이용 가능합니다.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">2. 금지 행위</h2>
          <p>타인을 사칭하거나 허위 정보를 등록하는 행위, 서비스를 악용하는 행위는 금지됩니다. 위반 시 계정이 즉시 정지될 수 있습니다.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">3. 책임 한계</h2>
          <p>BeWing은 매칭 연결 서비스를 제공하며, 실제 만남 이후 발생하는 상황에 대해서는 책임지지 않습니다.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">4. 서비스 변경</h2>
          <p>서비스 내용 및 약관은 사전 고지 후 변경될 수 있습니다.</p>
        </section>

        <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
          최종 업데이트: 2025년 1월
        </p>
      </main>
    </div>
  )
}
