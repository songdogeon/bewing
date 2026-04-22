/**
 * components/match/MatchCard.tsx
 *
 * 매칭 카드 — Wingman 컨셉 / Flat B&W
 *
 * 구조: myFriend ↔ theirFriend (매칭 당사자)
 *       theirWingman = 연락할 상대 Wingman
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MapPin, User, Instagram } from 'lucide-react'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import type { WingmanMatchItem } from '@/app/matches/actions'

// ─────────────────────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ko })
  } catch { return '' }
}

function Avatar({
  photoUrl, name, size = 'md',
}: {
  photoUrl: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-10 w-10' : 'h-14 w-14'
  const textSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-base'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className={`${dim} bg-slate-100 overflow-hidden shrink-0`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className={`${textSize} font-bold text-slate-400`}>{initial}</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────────────────────

export default function MatchCard({ match }: { match: WingmanMatchItem }) {
  const { myFriend, theirFriend, theirWingman, matchedAt } = match
  const [dialogOpen, setDialogOpen] = useState(false)

  const myFriendName    = myFriend.display_name    ?? `@${myFriend.insta_id}`
  const theirFriendName = theirFriend.display_name ?? `@${theirFriend.insta_id}`
  const wingmanName     = theirWingman.display_name ?? theirWingman.insta_id ?? '상대 Wingman'

  return (
    <>
      {/* ── 리스트 아이템 ─────────────────────────────────── */}
      <button
        onClick={() => setDialogOpen(true)}
        className="w-full text-left px-5 py-4 border-b border-slate-100 hover:bg-slate-50 active:bg-slate-100 transition-colors"
        aria-label="매칭 상세보기"
      >
        <div className="flex items-center gap-3">

          {/* 두 친구 아바타 (겹침) */}
          <div className="relative h-14 w-[68px] shrink-0">
            <div className="absolute left-0 top-0">
              <Avatar photoUrl={myFriend.photoUrl} name={myFriendName} />
            </div>
            <div className="absolute left-8 top-0 ring-2 ring-white">
              <Avatar photoUrl={theirFriend.photoUrl} name={theirFriendName} />
            </div>
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0 pl-2">
            <p className="font-semibold text-slate-950 text-sm truncate">
              {myFriendName} · {theirFriendName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              상대 Wingman: {wingmanName}
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              {timeAgo(matchedAt)}
            </p>
          </div>

          {/* 화살표 */}
          <span className="text-slate-300 text-sm shrink-0">→</span>
        </div>
      </button>

      {/* ── 상세 모달 ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden border-0">

          {/* 두 친구 프로필 영역 */}
          <div className="flex border-b border-slate-100">
            <FriendPanel
              label="내 친구"
              friend={myFriend}
              name={myFriendName}
            />
            <div className="w-px bg-slate-100 shrink-0" />
            <FriendPanel
              label="상대 친구"
              friend={theirFriend}
              name={theirFriendName}
            />
          </div>

          {/* 정보 영역 */}
          <div className="p-5 space-y-5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-950">
                매칭 성사!
              </DialogTitle>
              <DialogDescription asChild>
                <p className="text-sm text-slate-500 leading-relaxed">
                  두 친구가 서로 좋아했어요. Wingman끼리 연락해서 소개해주세요.
                </p>
              </DialogDescription>
            </DialogHeader>

            {/* 상대 Wingman 연락처 */}
            <div className="border border-slate-200 p-4 space-y-1">
              <p className="text-xs text-slate-400 font-medium">상대 Wingman</p>
              <p className="font-semibold text-slate-950">
                {theirWingman.display_name ?? '이름 없음'}
              </p>
              {theirWingman.insta_id && (
                <a
                  href={`https://www.instagram.com/${theirWingman.insta_id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-950 transition-colors mt-1"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  @{theirWingman.insta_id}
                </a>
              )}
            </div>

            {/* 매칭 시각 */}
            <p className="text-xs text-slate-400 text-center">
              {timeAgo(matchedAt)} 매칭됐어요
            </p>

            {/* 버튼 */}
            {theirWingman.insta_id && (
              <a
                href={`https://www.instagram.com/${theirWingman.insta_id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 bg-slate-950 text-white text-sm font-semibold hover:bg-black transition-colors"
              >
                <Instagram className="h-4 w-4" />
                Wingman에게 DM 보내기
              </a>
            )}
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// FriendPanel — 모달 내 친구 정보 패널
// ─────────────────────────────────────────────────────────────

function FriendPanel({
  label, friend, name,
}: {
  label:  string
  friend: WingmanMatchItem['myFriend']
  name:   string
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3 p-5">
      {/* 사진 */}
      <div className="h-20 w-20 bg-slate-100 overflow-hidden">
        {friend.photoUrl ? (
          <img
            src={friend.photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="text-center space-y-0.5 w-full">
        <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-950 truncate">{name}</p>
        <p className="text-xs text-slate-400 truncate">@{friend.insta_id}</p>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1">
          {friend.age && <span>{friend.age}세</span>}
          {friend.region && (
            <>
              {friend.age && <span>·</span>}
              <span className="flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" />
                {friend.region}
              </span>
            </>
          )}
        </div>
        {friend.bio && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed text-left px-1">
            {friend.bio}
          </p>
        )}
      </div>
    </div>
  )
}
