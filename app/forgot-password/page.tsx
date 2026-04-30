'use client'

import { useState }  from 'react'
import Link          from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export const metadata = { title: '비밀번호 재설정' }

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) { setError('이메일을 입력해주세요.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('유효한 이메일 형식이 아닙니다.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: supaError } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    setLoading(false)

    if (supaError) {
      setError('이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setSent(true)
  }

  // ── 전송 완료 화면 ─────────────────────────────────────────

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm space-y-8">

          <div className="h-14 w-14 bg-slate-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-slate-600" />
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-950">이메일을 확인해주세요</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-950">{email}</span>으로
              비밀번호 재설정 링크를 보냈어요.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              이메일을 받지 못하셨나요? 스팸 폴더를 확인하거나 잠시 후 다시 시도해주세요.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-sm text-slate-950 font-medium underline underline-offset-2 hover:opacity-70"
            >
              다른 이메일로 다시 시도
            </button>

            <p className="text-sm text-slate-500">
              <Link href="/login" className="text-slate-950 font-semibold underline underline-offset-2 hover:opacity-70">
                로그인으로 돌아가기
              </Link>
            </p>
          </div>

        </div>
      </div>
    )
  }

  // ── 이메일 입력 폼 ─────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm space-y-10">

        {/* 뒤로 가기 */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          로그인으로 돌아가기
        </Link>

        {/* 헤더 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-950">비밀번호 재설정</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            가입 시 사용한 이메일을 입력하면<br />
            비밀번호 재설정 링크를 보내드려요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null) }}
              placeholder="example@email.com"
              autoComplete="email"
              autoCapitalize="none"
              disabled={loading}
              className="w-full h-11 px-3 border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-950 transition-colors disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="border-l-2 border-red-500 pl-3 py-2 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-slate-950 hover:bg-black text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? '전송 중...' : '재설정 링크 보내기'}
          </button>

        </form>

      </div>
    </div>
  )
}
