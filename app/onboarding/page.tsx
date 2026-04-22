'use client'

/**
 * app/onboarding/page.tsx
 *
 * Wingman 온보딩 — 본인 정보 입력
 * 가입 직후 1회만 진행. 완료 후 /home으로 이동.
 */

import { useState } from 'react'
import { useForm }  from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { onboardingAction } from './actions'

// ─────────────────────────────────────────────────────────────
// 스키마
// ─────────────────────────────────────────────────────────────

const schema = z.object({
  display_name: z.string().min(1, '이름을 입력해주세요.').max(20, '20자 이하로 입력해주세요.'),
  insta_id:     z.string()
    .min(1, '인스타그램 아이디를 입력해주세요.')
    .max(30, '30자 이하로 입력해주세요.')
    .regex(/^@?[\w.]+$/, '올바른 인스타그램 아이디 형식이 아닙니다.'),
  age: z.coerce
    .number({ invalid_type_error: '나이를 입력해주세요.' })
    .int()
    .min(18, '만 18세 이상만 가입할 수 있습니다.')
    .max(100, '올바른 나이를 입력해주세요.'),
  gender: z.enum(['male', 'female', 'other'], { required_error: '성별을 선택해주세요.' }),
  region: z.string().min(1, '지역을 입력해주세요.').max(20, '20자 이하로 입력해주세요.'),
  bio:    z.string().max(200, '200자 이하로 입력해주세요.'),
})

type FormValues = z.infer<typeof schema>

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      insta_id:     '',
      age:          undefined,
      gender:       undefined,
      region:       '',
      bio:          '',
    },
  })

  const { isSubmitting } = form.formState

  // Step 1 → Step 2 전환 (display_name, insta_id 검증 후)
  const goToStep2 = async () => {
    const valid = await form.trigger(['display_name', 'insta_id'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: FormValues) => {
    const result = await onboardingAction({
      display_name: data.display_name,
      insta_id:     data.insta_id,
      age:          data.age,
      gender:       data.gender,
      region:       data.region,
      bio:          data.bio ?? '',
    })
    if (result && 'error' in result) {
      form.setError('root', { message: result.error })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── 상단 진행 표시 ────────────────────────────────────── */}
      <div className="flex gap-1 px-6 pt-14">
        <div className="h-0.5 flex-1 bg-slate-950 rounded-full" />
        <div className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-slate-950' : 'bg-slate-200'}`} />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-sm w-full mx-auto">

        {/* ── 헤더 ─────────────────────────────────────────────── */}
        <div className="mb-8 space-y-1.5">
          <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">
            {step === 1 ? '1 / 2' : '2 / 2'}
          </p>
          <h1 className="text-2xl font-bold text-slate-950">
            {step === 1 ? '내 정보 입력' : '추가 정보 입력'}
          </h1>
          <p className="text-sm text-slate-500">
            {step === 1
              ? '친구들에게 보여질 내 Wingman 프로필이에요.'
              : '더 정확한 매칭을 위해 입력해주세요.'}
          </p>
        </div>

        {/* ── 폼 ───────────────────────────────────────────────── */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-6">

            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        이름 <span className="text-slate-950">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="홍길동"
                          autoComplete="name"
                          className="h-11 rounded-md border-slate-200 focus:border-slate-400 text-slate-950 placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insta_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        인스타그램 아이디 <span className="text-slate-950">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">@</span>
                          <Input
                            placeholder="your_instagram_id"
                            autoComplete="off"
                            autoCapitalize="none"
                            className="h-11 rounded-md border-slate-200 focus:border-slate-400 text-slate-950 placeholder:text-slate-400 pl-7"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.replace(/^@/, ''))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-auto pt-4">
                  <Button
                    type="button"
                    onClick={goToStep2}
                    className="w-full h-12 rounded-lg bg-slate-950 hover:bg-black text-white font-semibold text-sm"
                  >
                    다음
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          나이 <span className="text-slate-950">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="25"
                            inputMode="numeric"
                            min={18}
                            max={100}
                            className="h-11 rounded-md border-slate-200 focus:border-slate-400 text-slate-950 placeholder:text-slate-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700">
                          성별 <span className="text-slate-950">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-md border-slate-200 text-slate-950">
                              <SelectValue placeholder="선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">남성</SelectItem>
                            <SelectItem value="female">여성</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        지역 <span className="text-slate-950">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="서울 강남구"
                          className="h-11 rounded-md border-slate-200 focus:border-slate-400 text-slate-950 placeholder:text-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        자기소개 <span className="text-slate-400 font-normal text-xs ml-1">선택</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="간단하게 본인을 소개해주세요. (200자 이내)"
                          rows={4}
                          className="rounded-md border-slate-200 focus:border-slate-400 text-slate-950 placeholder:text-slate-400 resize-none"
                          {...field}
                        />
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

                <div className="flex gap-3 mt-auto pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12 px-6 rounded-lg border-slate-200 text-slate-600 text-sm"
                    disabled={isSubmitting}
                  >
                    이전
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-lg bg-slate-950 hover:bg-black text-white font-semibold text-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner />
                        저장 중...
                      </span>
                    ) : 'Wingman 시작하기'}
                  </Button>
                </div>
              </>
            )}

          </form>
        </Form>

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
