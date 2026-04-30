'use client'

import { useCallback, useRef, useState } from 'react'
import { useForm }   from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }         from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Check } from 'lucide-react'

import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

import { createClient } from '@/lib/supabase/client'
import { updateFriend } from '@/app/friends/actions'
import { REGION_OPTIONS, AGE_OPTIONS, GENDER_OPTIONS } from '@/lib/constants/regions'
import type { FriendPhoto } from './page'

// ─────────────────────────────────────────────────────────────
// 상수 / 스키마
// ─────────────────────────────────────────────────────────────

const MAX_PHOTOS = 6
const BIO_MAX    = 150

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

interface NewPhotoItem {
  tempId:     string
  file:       File
  previewUrl: string
}

interface Props {
  friendId:    string
  initialData: FormValues
  initialPhotos: FriendPhoto[]
}

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function EditFriendClient({ friendId, initialData, initialPhotos }: Props) {
  const router     = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 기존 사진 상태 — 삭제 표시 포함
  const [existingPhotos, setExistingPhotos] = useState<FriendPhoto[]>(initialPhotos)
  const [deletedIds,     setDeletedIds]     = useState<Set<string>>(new Set())

  // 새 사진 상태
  const [newPhotos,  setNewPhotos]  = useState<NewPhotoItem[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)

  // 저장 완료 피드백
  const [saved, setSaved] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  const { isSubmitting } = form.formState
  const bioLen = (form.watch('bio') ?? '').length

  // ── 사진 관련 헬퍼 ────────────────────────────────────────

  const remainingExisting = existingPhotos.filter((p) => !deletedIds.has(p.id))
  const totalPhotos       = remainingExisting.length + newPhotos.length
  const canAddMore        = totalPhotos < MAX_PHOTOS

  const handleToggleDelete = (photoId: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev)
      next.has(photoId) ? next.delete(photoId) : next.add(photoId)
      return next
    })
    setPhotoError(null)
  }

  const addNewFiles = useCallback((files: FileList | File[]) => {
    setPhotoError(null)
    const arr   = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!arr.length) return

    setNewPhotos((prev) => {
      const remaining = MAX_PHOTOS - remainingExisting.length - prev.length
      if (remaining <= 0) {
        setPhotoError(`사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있어요.`)
        return prev
      }
      const toAdd = arr.slice(0, remaining).map((file) => ({
        tempId:     crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      return [...prev, ...toAdd]
    })
  }, [remainingExisting.length])

  const removeNewPhoto = (tempId: string) => {
    setNewPhotos((prev) => {
      const item = prev.find((p) => p.tempId === tempId)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((p) => p.tempId !== tempId)
    })
    setPhotoError(null)
  }

  // ── 제출 ──────────────────────────────────────────────────

  const onSubmit = async (data: FormValues) => {
    if (totalPhotos === 0) {
      setPhotoError('사진을 최소 1장 이상 등록해주세요.')
      return
    }

    form.clearErrors('root')

    // 새 사진 업로드
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { form.setError('root', { message: '로그인이 필요합니다.' }); return }

    const newPhotoUrls: string[] = []

    for (let i = 0; i < newPhotos.length; i++) {
      const photo = newPhotos[i]
      const ext   = photo.file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path  = `${user.id}/${Date.now()}-edit-${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('friend-photos')
        .upload(path, photo.file, { upsert: false })

      if (uploadError) {
        form.setError('root', { message: `사진 업로드에 실패했습니다: ${uploadError.message}` })
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('friend-photos')
        .getPublicUrl(path)

      newPhotoUrls.push(publicUrl)
    }

    // Server Action 호출
    const result = await updateFriend(friendId, {
      display_name:     data.display_name,
      insta_id:         data.insta_id,
      age:              Number(data.age),
      gender:           data.gender,
      region:           data.region,
      bio:              data.bio ?? '',
      photoIdsToDelete: [...deletedIds],
      newPhotoUrls,
    })

    if ('error' in result) {
      form.setError('root', { message: result.error })
      return
    }

    setSaved(true)
    setTimeout(() => router.push('/friends'), 1200)
  }

  const isLoading = isSubmitting

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
          <span className="font-bold text-slate-950 text-sm flex-1">친구 정보 수정</span>
          {saved && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Check className="h-3.5 w-3.5" />
              저장됐어요!
            </span>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 pt-8 pb-28">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10" noValidate>

            {/* ── 섹션 1: 사진 관리 ─────────────────────────────── */}
            <section className="space-y-4">
              <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">사진</h2>

              <div className="grid grid-cols-3 gap-2">

                {/* 기존 사진 */}
                {existingPhotos.map((photo) => {
                  const isDeleted = deletedIds.has(photo.id)
                  return (
                    <div key={photo.id} className="relative aspect-square">
                      <img
                        src={photo.photo_url}
                        alt="사진"
                        className={`w-full h-full object-cover transition-opacity ${
                          isDeleted ? 'opacity-30' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleToggleDelete(photo.id)}
                        className={`absolute top-1 right-1 h-5 w-5 flex items-center justify-center text-white transition-colors ${
                          isDeleted
                            ? 'bg-slate-400 hover:bg-slate-500'
                            : 'bg-black/70 hover:bg-black'
                        }`}
                        aria-label={isDeleted ? '삭제 취소' : '사진 삭제'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {isDeleted && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-1">삭제</span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* 새 사진 */}
                {newPhotos.map((photo) => (
                  <div key={photo.tempId} className="relative aspect-square">
                    <img
                      src={photo.previewUrl}
                      alt="새 사진"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(photo.tempId)}
                      className="absolute top-1 right-1 h-5 w-5 bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                      aria-label="사진 삭제"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* 추가 버튼 */}
                {canAddMore && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="aspect-square border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{totalPhotos}/{MAX_PHOTOS}</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && addNewFiles(e.target.files)}
              />

              {photoError && (
                <p className="text-sm text-red-600 border-l-2 border-red-500 pl-3 py-0.5">
                  {photoError}
                </p>
              )}

              <p className="text-xs text-slate-400">
                · X 버튼으로 삭제할 사진을 표시하세요 (저장 시 적용)<br />
                · 사진은 최소 1장 이상 필요해요
              </p>
            </section>

            <div className="h-px bg-slate-200" />

            {/* ── 섹션 2: 기본 정보 ──────────────────────────────── */}
            <section className="space-y-5">
              <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">기본 정보</h2>

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

            <div className="h-px bg-slate-200" />

            {/* ── 섹션 3: 상세 정보 ──────────────────────────────── */}
            <section className="space-y-5">
              <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">상세 정보</h2>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        나이 <span className="text-slate-950">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isLoading}>
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
                      <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isLoading}>
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
                      지역 <span className="text-slate-950">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''} disabled={isLoading}>
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

            <div className="h-px bg-slate-200" />

            {/* ── 섹션 4: 소개글 ─────────────────────────────────── */}
            <section className="space-y-5">
              <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">한 줄 소개</h2>

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
                        placeholder="친구를 한 마디로 소개해주세요."
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

            {/* ── 전역 에러 ──────────────────────────────────────── */}
            {form.formState.errors.root && (
              <div className="border-l-2 border-red-500 pl-3 py-2 text-sm text-red-600 bg-red-50">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* ── 저장 버튼 ─────────────────────────────────────── */}
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isLoading || saved}
                className="w-full h-12 bg-slate-950 hover:bg-black text-white font-semibold text-sm disabled:opacity-60"
              >
                {saved ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    저장됐어요!
                  </span>
                ) : isLoading ? '저장 중...' : '수정 저장하기'}
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
