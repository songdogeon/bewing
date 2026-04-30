/**
 * app/login/page.tsx
 *
 * 로그인 페이지 — Black & White 미니멀
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'

import { createClient } from '@/lib/supabase/client'
import { loginAction } from './actions'

// ─────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().min(1, '이메일을 입력해주세요.').email('유효한 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.').min(6, '비밀번호는 6자 이상이어야 합니다.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPassword,   setShowPassword]   = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { isSubmitting } = form.formState
  const isLoading = isSubmitting || isGoogleLoading

  const onSubmit = async (data: LoginFormValues) => {
    const result = await loginAction(data.email, data.password)
    if (result?.error) form.setError('root', { message: result.error })
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      form.setError('root', { message: 'Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.' })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-sm space-y-10">

        {/* ── 브랜드 ─────────────────────────────────────────── */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-950">BeWing</h1>
          <p className="text-sm text-slate-500">친구가 대신 찾아주는 진지한 인연</p>
        </div>

        {/* ── 폼 ────────────────────────────────────────────── */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-950">로그인</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">이메일</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        disabled={isLoading}
                        className="h-11 border-slate-200 focus:border-slate-400 text-slate-950 placeholder:text-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="비밀번호를 입력하세요"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="h-11 border-slate-200 focus:border-slate-400 text-slate-950 placeholder:text-slate-400 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div className="border-l-2 border-slate-950 pl-3 py-1 text-sm text-slate-700">
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-slate-950 hover:bg-black text-white font-semibold text-sm mt-2"
                disabled={isLoading}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    로그인 중...
                  </span>
                ) : '로그인'}
              </Button>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors"
                >
                  비밀번호를 잊으셨나요?
                </Link>
              </div>

            </form>
          </Form>

          {/* 구분선 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">또는</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google 로그인 */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-slate-200 text-slate-700 font-medium text-sm gap-2 hover:bg-slate-50"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Google 연결 중...
              </span>
            ) : (
              <>
                <GoogleIcon />
                Google로 로그인
              </>
            )}
          </Button>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-sm text-slate-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="text-slate-950 font-semibold underline underline-offset-2 hover:opacity-70">
            회원가입
          </Link>
        </p>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
