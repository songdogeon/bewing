'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link  from 'next/link'
import { Plus, User, Trash2, ArrowRight } from 'lucide-react'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { deleteFriend } from './actions'

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

export interface FriendRow {
  id:           string
  insta_id:     string
  display_name: string | null
  age:          number | null
  gender:       'male' | 'female' | 'other' | null
  region:       string | null
  photoUrl:     string | null
}

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function FriendsListClient({
  initialFriends,
}: {
  initialFriends: FriendRow[]
}) {
  const [friends,       setFriends]       = useState<FriendRow[]>(initialFriends)
  const [deletingId,    setDeletingId]     = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget]  = useState<FriendRow | null>(null)
  const [errorMsg,      setErrorMsg]       = useState<string | null>(null)

  const handleDeleteClick = (friend: FriendRow) => {
    setErrorMsg(null)
    setConfirmTarget(friend)
  }

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return
    const target = confirmTarget
    setConfirmTarget(null)
    setDeletingId(target.id)

    // Optimistic update
    setFriends((prev) => prev.filter((f) => f.id !== target.id))

    const result = await deleteFriend(target.id)

    if ('error' in result) {
      // 롤백
      setFriends((prev) => {
        const exists = prev.some((f) => f.id === target.id)
        if (exists) return prev
        return [...prev, target].sort((a, b) => a.id.localeCompare(b.id))
      })
      setErrorMsg(result.error)
    }

    setDeletingId(null)
  }

  return (
    <>
      {/* ── 에러 배너 ─────────────────────────────────────────── */}
      {errorMsg && (
        <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <p className="text-xs text-red-600">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-red-400 hover:text-red-600 ml-4 shrink-0"
          >
            닫기
          </button>
        </div>
      )}

      {/* ── 친구 목록 ─────────────────────────────────────────── */}
      {friends.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {friends.map((friend) => (
            <FriendItem
              key={friend.id}
              friend={friend}
              isDeleting={deletingId === friend.id}
              onDelete={handleDeleteClick}
            />
          ))}

          {friends.length < 5 && (
            <Link
              href="/friends/register"
              className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="h-14 w-14 bg-slate-100 flex items-center justify-center shrink-0 border border-dashed border-slate-300">
                <Plus className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-500">친구 추가하기</p>
                <p className="text-xs text-slate-400 mt-0.5">{friends.length}/5명 등록됨</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
            </Link>
          )}
        </div>
      )}

      {/* ── 삭제 확인 다이얼로그 ──────────────────────────────── */}
      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null) }}
      >
        <DialogContent className="max-w-xs mx-auto p-0 border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-950">
                친구 삭제
              </DialogTitle>
              <DialogDescription asChild>
                <p className="text-sm text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">
                    {confirmTarget?.display_name ?? `@${confirmTarget?.insta_id}`}
                  </span>
                  을(를) 삭제하면 등록된 사진과 함께 완전히 삭제됩니다.
                  진행하시겠어요?
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 h-11 border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-11 bg-slate-950 text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// FriendItem
// ─────────────────────────────────────────────────────────────

function FriendItem({
  friend,
  isDeleting,
  onDelete,
}: {
  friend:     FriendRow
  isDeleting: boolean
  onDelete:   (f: FriendRow) => void
}) {
  const name = friend.display_name ?? `@${friend.insta_id}`
  const genderLabel =
    friend.gender === 'male'   ? '남성' :
    friend.gender === 'female' ? '여성' :
    friend.gender === 'other'  ? '기타' : null

  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-slate-100 transition-opacity ${
      isDeleting ? 'opacity-40 pointer-events-none' : ''
    }`}>
      {/* 사진 */}
      <div className="h-14 w-14 bg-slate-100 overflow-hidden shrink-0">
        {friend.photoUrl ? (
          <Image
            src={friend.photoUrl}
            alt={name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-950 text-sm truncate">{name}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">@{friend.insta_id}</p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
          {friend.age && <span>{friend.age}세</span>}
          {genderLabel && <><span>·</span><span>{genderLabel}</span></>}
          {friend.region && <><span>·</span><span>{friend.region}</span></>}
        </div>
      </div>

      {/* 액션 */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/swipe"
          className="text-xs text-slate-400 hover:text-slate-950 transition-colors"
        >
          스와이프 →
        </Link>
        <button
          onClick={() => onDelete(friend)}
          disabled={isDeleting}
          className="p-1.5 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30"
          aria-label="친구 삭제"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-8 text-center">
      <div className="h-16 w-16 bg-slate-100 flex items-center justify-center">
        <User className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-slate-950">등록된 친구가 없어요</p>
        <p className="text-sm text-slate-500 leading-relaxed">
          친구 프로필을 등록하고<br />스와이프를 시작해보세요.
        </p>
      </div>
      <Link
        href="/friends/register"
        className="flex items-center gap-2 h-12 px-6 bg-slate-950 text-white text-sm font-semibold hover:bg-black transition-colors"
      >
        <Plus className="h-4 w-4" />
        친구 등록하기
      </Link>
    </div>
  )
}
