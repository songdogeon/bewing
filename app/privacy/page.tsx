/**
 * app/privacy/page.tsx
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: '개인정보 처리방침' }

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-slate-950">개인정보 처리방침</h1>
      </header>

      <main className="py-8 space-y-6 text-sm text-slate-600 leading-relaxed pb-20">
        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">1. 수집하는 정보</h2>
          <p>BeWing은 서비스 제공을 위해 이메일 주소, 인스타그램 아이디, 나이, 지역 등 최소한의 정보를 수집합니다.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">2. 정보 이용 목적</h2>
          <p>수집된 정보는 매칭 서비스 제공 및 계정 관리 목적으로만 사용됩니다. 제3자에게 판매하거나 공유하지 않습니다.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">3. 정보 보유 기간</h2>
          <p>계정 탈퇴 시 모든 개인정보는 즉시 삭제됩니다. 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관 후 삭제합니다.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-slate-950">4. 문의</h2>
          <p>개인정보 관련 문의사항은 서비스 내 문의 채널을 통해 접수하실 수 있습니다.</p>
        </section>

        <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
          최종 업데이트: 2025년 1월
        </p>
      </main>
    </div>
  )
}
