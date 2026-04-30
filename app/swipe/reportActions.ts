'use server'

import { createClient } from '@/lib/supabase/server'

export type ReportResult =
  | { success: true }
  | { error: string }

export const REPORT_REASONS = [
  { value: 'fake_profile',        label: '사칭 / 가짜 프로필' },
  { value: 'inappropriate_photo', label: '부적절한 사진' },
  { value: 'underage',            label: '미성년자 의심' },
  { value: 'spam',                label: '스팸 계정' },
  { value: 'harassment',          label: '불쾌하거나 폭력적인 내용' },
  { value: 'other',               label: '기타' },
] as const

export type ReportReason = typeof REPORT_REASONS[number]['value']

// ─────────────────────────────────────────────────────────────
// reportFriend — 친구 프로필 신고
// ─────────────────────────────────────────────────────────────

export async function reportFriend(
  friendId: string,
  reason:   ReportReason,
  details?: string
): Promise<ReportResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('friend_reports')
    .insert({
      reporter_id: user.id,
      friend_id:   friendId,
      reason,
      details:     details?.trim() || null,
    })

  if (error) {
    if (error.code === '23505') return { success: true } // 이미 신고한 경우 성공 처리
    console.error('[reportFriend]', error.message)
    return { error: '신고 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// blockWingman — Wingman 차단 + 기존 매칭 unmatched 처리
// ─────────────────────────────────────────────────────────────

export async function blockWingman(
  wingmanId: string
): Promise<ReportResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: '로그인이 필요합니다.' }

  if (user.id === wingmanId) return { error: '자신을 차단할 수 없습니다.' }

  // 차단 등록
  const { error: blockError } = await supabase
    .from('wingman_blocks')
    .insert({ blocker_id: user.id, blocked_id: wingmanId })

  if (blockError && blockError.code !== '23505') {
    console.error('[blockWingman] 차단 실패:', blockError.message)
    return { error: '차단 처리 중 오류가 발생했습니다.' }
  }

  // 기존 매칭 unmatched 처리
  await supabase
    .from('wingman_matches')
    .update({ status: 'unmatched' })
    .or(
      `and(wingman1_id.eq.${user.id},wingman2_id.eq.${wingmanId}),` +
      `and(wingman1_id.eq.${wingmanId},wingman2_id.eq.${user.id})`
    )

  return { success: true }
}
