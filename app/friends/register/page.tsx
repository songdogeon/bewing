'use client'

/**
 * app/friends/register/page.tsx
 *
 * 친구 프로필 등록 — Flat B&W 디자인
 * 사진 최대 6장 업로드 (Supabase Storage: friend-photos 버킷)
 */

import { useCallback, useRef, useState } from 'react'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { useRouter }     from 'next/navigation'
import { Plus, X, ArrowLeft } from 'lucide-react'

import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { createClient }   from '@/lib/supabase/client'
import { registerFriend } from '@/app/friends/actions'

// ─────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────

const MAX_PHOTOS = 6
const BIO_MAX    = 150

const AGE_OPTIONS = Array.from({ length: 33 }, (_, i) => i + 18)

const GENDER_OPTIONS = [
  { value: 'male',   label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other',  label: '기타' },
] as const

const REGION_OPTIONS = [
  { value: '서울', label: '서울특별시' },
  { value: '경기', label: '경기도' },
  { value: '인천', label: '인천광역시' },
  { value: '부산', label: '부산광역시' },
  { value: '대구', label: '대구광역시' },
  { value: '광주', label: '광주광역시' },
  { value: '대전', label: '대전광역시' },
  { value: '울산', label: '울산광역시' },
  { value: '세종', label: '세종특별자치시' },
  { value: '강원', label: '강원도' },
  { value: '충북', label: '충청북도' },
  { value: '충남', label: '충청남도' },
  { value: '전북', label: '전라북도' },
  { value: '전남', label: '전라남도' },
  { value: '경북', label: '경상북도' },
  { value: '경남', label: '경상남도' },
  { value: '제주', label: '제주특별자치도' },
]

// ─────────────────────────────────────────────────────────────
// 타입 / 스키마
// ─────────────────────────────────────────────────────────────

interface PhotoItem {
  id:         string
  file:       File
  previewUrl: string
}

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
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function FriendRegisterPage() {
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos,      setPhotos]      = useState<PhotoItem[]>([])
  const [isDragging,  setIsDragging]  = useState(false)
  const [photoError,  setPhotoError]  = useState<string | null>(null)
  const [statusMsg,   setStatusMsg]   = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      insta_id:     '',
      age:          '',
      gender:       undefined,
      region:       '',
      bio:          '',
    },
  })

  const { isSubmitting } = form.formState
  const bioLen = (form.watch('bio') ?? '').length

  // ── 사진 추가 ─────────────────────────────────────────────

  const addFiles = useCallback((files: FileList | File[]) => {
    setPhotoError(null)
    const arr   = Array.from(files)
    const valid = arr.filter((f) => f.type.startsWith('image/'))
    if (valid.length === 0) return

    setPhotos((prev) => {
      const remaining = MAX_PHOTOS - prev.length
      if (remaining <= 0) {
        setPhotoError(`사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있어요.`)
        return prev
      }
      const toAdd = valid.slice(0, remaining).map((file) => ({
        id:         crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      return [...prev, ...toAdd]
    })
  }, [])

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
    setPhotoError(null)
  }

  // ── 드래그 & 드롭 ─────────────────────────────────────────

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  // ── 제출 ──────────────────────────────────────────────────

  const onSubmit = async (data: FormValues) => {
    // 사진 필수 검사
    if (photos.length === 0) {
      setPhotoError('사진을 최소 1장 이상 등록해주세요.')
      return
    }

    form.clearErrors('root')
    setStatusMsg('사진 업로드 중...')

    try {
      // 1. Supabase 인증 확인
      const supabase = createClient()
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        form.setError('root', { message: '로그인이 필요합니다. 다시 로그인해주세요.' })
        return
      }

      // 2. 사진을 Supabase Storage에 업로드
      const photoUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setStatusMsg(`사진 업로드 중... (${i + 1}/${photos.length})`)
        const photo = photos[i]
        const ext   = photo.file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path  = `${user.id}/${Date.now()}-${i}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('friend-photos')
          .upload(path, photo.file, { upsert: false })

        if (uploadError) {
          // 업로드 실패 시 즉시 에러를 보여주고 중단
          form.setError('root', {
            message: `사진 업로드에 실패했습니다: ${uploadError.message}. Supabase Storage 버킷 권한을 확인해주세요.`,
          })
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('friend-photos')
          .getPublicUrl(path)

        photoUrls.push(publicUrl)
      }

      // 3. Server Action으로 DB 저장
      setStatusMsg('저장 중...')

      const result = await registerFriend({
        display_name: data.display_name,
        insta_id:     data.insta_id,
        age:          Number(data.age),
        gender:       data.gender,
        region:       data.region,
        bio:          data.bio ?? '',
        photoUrls,
      })

      // 4. 결과 처리
      if ('error' in result) {
        form.setError('root', { message: result.error })
        return
      }

      // 5. 성공 → 친구 목록 페이지로 이동 (client-side navigation)
      router.push('/friends')
      router.refresh()

    } catch (err) {
      console.error('[FriendRegisterPage] onSubmit 예외:', err)
      form.setError('root', { message: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.' })
    } finally {
      setStatusMsg(null)
    }
  }

  const isLoading = isSubmitting || statusMsg !== null

  // ─────────────────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────────────────

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
          <span className="font-bold text-slate-950 text-sm flex-1">친구 등록</span>
          <span className="text-xs text-slate-400">BeWing</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-8 pb-28">

        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-950">친구 소개하기</h1>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            친구 대신 프로필을 등록해주세요.<br />최대 5명까지 등록할 수 있어요.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10" noValidate>

            {/* ── 섹션 1: 사진 ─────────────────────────────────── */}
            <section className="space-y-4">
              <SectionHeading label="사진" />

              {/* 드래그 존 */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border border-dashed p-4 transition-colors ${
                  isDragging ? 'border-slate-950 bg-slate-50' : 'border-slate-300 bg-white'
                }`}
              >
                {/* 사진 그리드 */}
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square bg-slate-100">
                      <img
                        src={photo.previewUrl}
                        alt="미리보기"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 h-5 w-5 bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                        aria-label="사진 삭제"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* 추가 버튼 */}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-[10px] font-medium">
                        {photos.length === 0 ? '사진 추가' : `${photos.length}/${MAX_PHOTOS}`}
                      </span>
                    </button>
                  )}

                  {/* 빈 슬롯 */}
                  {photos.length === 0 && Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square border border-dashed border-slate-200 bg-slate-50"
                    />
                  ))}
                </div>

                <p className="text-center text-xs text-slate-400 mt-3">
                  {photos.length === 0
                    ? '클릭하거나 사진을 드래그해서 추가하세요'
                    : `${photos.length}/${MAX_PHOTOS}장 추가됨`}
                </p>
              </div>

              {/* 숨겨진 파일 인풋 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />

              {photoError && (
                <p className="text-sm text-red-600 border-l-2 border-red-500 pl-3 py-0.5">
                  {photoError}
                </p>
              )}

              <p className="text-xs text-slate-400">
                · 사진은 최소 1장 이상 필요해요<br />
                · 친구 본인의 실제 사진을 등록해주세요
              </p>
            </section>

            <Divider />

            {/* ── 섹션 2: 기본 정보 ──────────────────────────────── */}
            <section className="space-y-5">
              <SectionHeading label="기본 정보" />

              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      이름 <Required />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="홍길동"
                        autoComplete="off"
                        disabled={isLoading}
                        className="h-11 border-slate-200 focus:border-slate-950 text-slate-950 placeholder:text-slate-400"
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
                      인스타그램 아이디 <Required />
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
                          spellCheck={false}
                          disabled={isLoading}
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
            </section>

            <Divider />

            {/* ── 섹션 3: 상세 정보 ──────────────────────────────── */}
            <section className="space-y-5">
              <SectionHeading label="상세 정보" />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        나이 <Required />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                        disabled={isLoading}
                      >
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
                        성별 <Required />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                        disabled={isLoading}
                      >
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

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      지역 <Required />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                      disabled={isLoading}
                    >
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
            </section>

            <Divider />

            {/* ── 섹션 4: 소개글 ─────────────────────────────────── */}
            <section className="space-y-5">
              <SectionHeading label="한 줄 소개" />

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
                        placeholder="친구를 한 마디로 소개해주세요. 예) 조용한 카페를 좋아하는 개발자."
                        rows={4}
                        disabled={isLoading}
                        maxLength={BIO_MAX + 10}
                        className="border-slate-200 focus:border-slate-950 text-slate-950 placeholder:text-slate-400 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* ── 전역 에러 ────────────────────────────────────────── */}
            {form.formState.errors.root && (
              <div className="border-l-2 border-red-500 pl-3 py-2 text-sm text-red-600 bg-red-50">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* ── 제출 버튼 ─────────────────────────────────────────── */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-12 bg-slate-950 hover:bg-black text-white font-semibold text-sm disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner />
                    {statusMsg ?? '처리 중...'}
                  </span>
                ) : '친구 등록하기'}
              </Button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="w-full h-11 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
              >
                취소
              </button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 하위 컴포넌트
// ─────────────────────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
  return (
    <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
      {label}
    </h2>
  )
}

function Divider() {
  return <div className="h-px bg-slate-200" />
}

function Required() {
  return <span className="text-slate-950 ml-0.5" aria-label="필수">*</span>
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
