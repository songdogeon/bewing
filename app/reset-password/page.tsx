'use client'

import { useState }   from 'react'
import { useRouter }  from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password,        setPassword]        = useState('')
  const [confirm,         setConfirm]         = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      setError('비밀번호는 영문자와 숫자를 포함해야 합니다.')
      return
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (updateError) {
      if (updateError.message.includes('same password')) {
        setError('이전과 다른 비밀번호를 입력해주세요.')
      } else {
        setError('비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있어요.')
      }
      return
    }

    router.push('/home')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm space-y-10">

        {/* 헤더 */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">BeWing</p>
          <h1 className="text-2xl font-bold text-slate-950">새 비밀번호 설정</h1>
          <p className="text-sm text-slate-500">
            영문자와 숫자를 포함해 8자 이상으로 설정해주세요.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* 새 비밀번호 */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder="영문+숫자 포함 8자 이상"
                autoComplete="new-password"
                disabled={loading}
                className="w-full h-11 px-3 pr-10 border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-950 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium text-slate-700">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(null) }}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                disabled={loading}
                className="w-full h-11 px-3 pr-10 border border-slate-200 text-slate-950 placeholder:text-slate-400 text-sm focus:outline-none focus:border-slate-950 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
                aria-label={showConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="border-l-2 border-red-500 pl-3 py-2 text-sm text-red-600 bg-red-50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="w-full h-12 bg-slate-950 hover:bg-black text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? '변경 중...' : '비밀번호 변경하기'}
          </button>

        </form>

      </div>
    </div>
  )
}
