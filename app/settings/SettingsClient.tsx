'use client'

import { useState } from 'react'
import { useForm }  from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'

import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { updateWingmanProfile } from './actions'
import { REGION_OPTIONS, AGE_OPTIONS, GENDER_OPTIONS } from '@/lib/constants/regions'

// ─────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────

const BIO_MAX = 200

// ─────────────────────────────────────────────────────────────
// 스키마
// ─────────────────────────────────────────────────────────────

const schema = z.object({
  display_name: z.string().min(1, '이름을 입력해주세요.').max(20, '20자 이하로 입력해주세요.'),
  insta_id: z.string()
    .min(1, '인스타그램 아이디를 입력해주세요.')
    .max(30, '30자 이하로 입력해주세요.')
    .regex(/^@?[\w.]+$/, '올바른 인스타그램 아이디 형식이 아닙니다.'),
  age:    z.string().min(1, '나이를 선택해주세요.'),
  gender: z.enum(['male', 'female', 'other'], { required_error: '성별을 선택해주세요.' }),
  region: z.string().min(1, '지역을 선택해주세요.'),
  bio:    z.string().max(BIO_MAX, `${BIO_MAX}자 이하로 입력해주세요.`),
})

type FormValues = z.infer<typeof schema>

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface WingmanProfile {
  display_name: string | null
  insta_id:     string | null
  age:          number | null
  gender:       string | null
  region:       string | null
  bio:          string | null
}

interface Props {
  profile:      WingmanProfile
  friendCount:  number
}

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function SettingsClient({ profile, friendCount }: Props) {
  const router  = useRouter()
  const [saved, setSaved] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile.display_name ?? '',
      insta_id:     profile.insta_id     ?? '',
      age:          profile.age          ? String(profile.age) : '',
      gender:       (profile.gender as 'male' | 'female' | 'other') ?? undefined,
      region:       profile.region       ?? '',
      bio:          profile.bio          ?? '',
    },
  })

  const { isSubmitting } = form.formState
  const bioLen = (form.watch('bio') ?? '').length

  const onSubmit = async (data: FormValues) => {
    setSaved(false)
    const result = await updateWingmanProfile({
      display_name: data.display_name,
      insta_id:     data.insta_id,
      age:          Number(data.age),
      gender:       data.gender,
      region:       data.region,
      bio:          data.bio ?? '',
    })

    if ('error' in result) {
      form.setError('root', { message: result.error })
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 text-slate-500 hover:text-slate-950 transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-bold text-slate-950 text-sm flex-1">프로필 설정</span>
          <span className="text-xs text-slate-400">BeWing</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-8 pb-28">

        {/* ── 현황 요약 ──────────────────────────────────────── */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium">등록된 친구</p>
            <p className="text-2xl font-black text-slate-950 tabular-nums mt-1">
              {friendCount}
              <span className="text-sm font-medium text-slate-400">/5</span>
            </p>
          </div>
          <div className="flex-1 border border-slate-200 p-4">
            <p className="text-xs text-slate-400 font-medium">Wingman 상태</p>
            <p className="text-sm font-semibold text-slate-950 mt-1">활성</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>

            {/* ── 이름 ─────────────────────────────────────────── */}
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
                      autoComplete="off"
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 focus:border-slate-950 text-slate-950 placeholder:text-slate-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── 인스타그램 ───────────────────────────────────── */}
            <FormField
              control={form.control}
              name="insta_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    인스타그램 아이디 <span className="text-slate-950">*</span>
                  </FormLabel>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-medium select-none">
                      @
                    </span>
                    <FormControl>
                      <Input
                        placeholder="instagram_id"
                        autoComplete="off"
                        autoCapitalize="none"
                        disabled={isSubmitting}
                        className="h-11 border-slate-200 focus:border-slate-950 text-slate-950 placeholder:text-slate-400"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/^@/, '').toLowerCase().trimStart()
                          )
                        }
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── 나이 / 성별 ──────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      나이 <span className="text-slate-950">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="mt-1 h-11 border-slate-200">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AGE_OPTIONS.map((a) => (
                          <SelectItem key={a} value={String(a)}>{a}세</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="mt-1 h-11 border-slate-200">
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── 지역 ─────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700">
                    지역 <span className="text-slate-950">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="mt-1 h-11 border-slate-200">
                        <SelectValue placeholder="거주 지역 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REGION_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── 소개글 ───────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-slate-700">
                      소개글
                      <span className="text-slate-400 font-normal ml-1 text-xs">(선택)</span>
                    </FormLabel>
                    <span className={`text-xs tabular-nums ${
                      bioLen > BIO_MAX ? 'text-red-500 font-semibold' : 'text-slate-400'
                    }`}>
                      {bioLen}/{BIO_MAX}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="간단하게 본인을 소개해주세요."
                      rows={3}
                      disabled={isSubmitting}
                      maxLength={BIO_MAX + 10}
                      className="border-slate-200 focus:border-slate-950 text-slate-950 placeholder:text-slate-400 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── 전역 에러 ──────────────────────────────────────── */}
            {form.formState.errors.root && (
              <div className="border-l-2 border-red-500 pl-3 py-2 text-sm text-red-600 bg-red-50">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* ── 저장 버튼 ─────────────────────────────────────── */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-slate-950 hover:bg-black text-white font-semibold text-sm disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  저장 중...
                </span>
              ) : saved ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  저장됐어요!
                </span>
              ) : '저장하기'}
            </Button>

          </form>
        </Form>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
