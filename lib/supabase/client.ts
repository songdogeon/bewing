/**
 * lib/supabase/client.ts
 *
 * 브라우저(클라이언트 컴포넌트) 전용 Supabase 클라이언트
 *
 * 사용 위치:
 *   - 'use client' 컴포넌트 내부
 *   - 예: 로그인 폼, 스와이프 화면, 실시간 구독 등
 *
 * NOTE: 서버 컴포넌트나 Server Action에서는 사용하지 마세요.
 *       서버 환경에서는 lib/supabase/server.ts를 사용합니다.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

/**
 * 브라우저용 Supabase 클라이언트 생성 함수
 *
 * - createBrowserClient는 내부적으로 localStorage + 쿠키를 함께 관리함
 * - 컴포넌트마다 호출해도 내부적으로 싱글턴처럼 동작 (중복 인스턴스 방지)
 * - NEXT_PUBLIC_ 접두사 변수만 사용 → 브라우저에 노출되어도 안전
 *   (RLS 정책으로 데이터 접근 제어함)
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
