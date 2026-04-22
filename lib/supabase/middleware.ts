/**
 * lib/supabase/middleware.ts
 *
 * Next.js middleware.ts 전용 Supabase 세션 관리 + 라우트 보호 헬퍼
 *
 * 처리 흐름:
 *   요청 진입
 *     -> [1] Supabase 세션 쿠키 갱신 (access token refresh)
 *     -> [2] 유저 인증 여부 확인 (getUser)
 *         -> [비로그인] 보호 라우트 -> /login 리다이렉트
 *         -> [로그인]   인증 라우트 -> 온보딩 체크 -> /home 또는 통과
 *                       보호 라우트 -> 온보딩 체크 -> /onboarding 또는 통과
 *
 * 성능 최적화:
 *   온보딩 DB 조회는 매 요청마다 발생하면 느려집니다.
 *   쿠키 캐시(wm_onboarded)로 중복 DB 조회를 방지합니다.
 *   프로필 셋업 완료 시 해당 쿠키를 서버에서 직접 설정해야 합니다.
 */

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/types/database.types'

// ─────────────────────────────────────────────────────────────
// 라우트 분류 상수
// ─────────────────────────────────────────────────────────────

// 인증 없이 접근 가능한 공개 라우트
const PUBLIC_ROUTES = ['/', '/about', '/terms', '/privacy']

// 인증 라우트 - 비로그인: 통과 / 로그인: 온보딩 체크 후 리다이렉트
const AUTH_ROUTES = ['/login', '/signup']

// 보호된 라우트 - 비로그인: /login 리다이렉트 / 로그인: 온보딩 체크
const PROTECTED_ROUTES = ['/home', '/swipe', '/matches', '/friends', '/chat']

// 온보딩 상태 쿠키 이름 및 TTL (7일)
const ONBOARDED_COOKIE = 'wm_onboarded'
const ONBOARDED_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

// ─────────────────────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────────────────────

function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function redirectToLogin(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('next', pathname)
  return NextResponse.redirect(url)
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  return NextResponse.redirect(url)
}

// ─────────────────────────────────────────────────────────────
// 메인 함수
// ─────────────────────────────────────────────────────────────

/**
 * updateSession
 *
 * 루트 middleware.ts에서 호출하는 핵심 함수.
 * Supabase 세션 갱신 + 라우트 접근 제어를 담당합니다.
 *
 * NOTE: response를 미리 생성해두는 이유:
 *   Supabase가 setAll()에서 이 response에 갱신된 쿠키를 심습니다.
 *   최종적으로 이 response를 반환해야 브라우저에 쿠키가 전달됩니다.
 *   redirect 시에는 response 쿠키를 redirect 응답에 복사해야 합니다.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // NOTE: getSession() 대신 getUser()를 사용합니다.
  // getSession()은 로컬 쿠키만 확인(서버 검증 없음)하여 보안이 취약합니다.
  // getUser()는 Supabase 서버에서 JWT 검증 + 만료 토큰 자동 refresh를 수행합니다.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── 비로그인 유저 처리 ─────────────────────────────────────
  if (!user || userError) {
    if (matchesRoute(pathname, PUBLIC_ROUTES) || matchesRoute(pathname, AUTH_ROUTES)) {
      return supabaseResponse
    }
    if (pathname.startsWith('/onboarding')) {
      return redirectToLogin(request, pathname)
    }
    if (matchesRoute(pathname, PROTECTED_ROUTES)) {
      return redirectToLogin(request, pathname)
    }
    return supabaseResponse
  }

  // ── 로그인 유저: /onboarding은 무조건 통과 ────────────────
  // (온보딩 중인 유저를 다시 리다이렉트하면 무한 루프 발생)
  if (pathname.startsWith('/onboarding')) {
    return supabaseResponse
  }

  // ── 온보딩 상태 확인 ───────────────────────────────────────
  const needsOnboardingCheck =
    matchesRoute(pathname, AUTH_ROUTES) || matchesRoute(pathname, PROTECTED_ROUTES)

  if (needsOnboardingCheck) {
    const isOnboarded = await checkOnboardingStatus(request, supabase, user.id, supabaseResponse)

    if (!isOnboarded) {
      const setupRedirect = redirectTo(request, '/onboarding')
      // 세션 쿠키를 리다이렉트 응답에도 복사 (쿠키 유실 방지)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        setupRedirect.cookies.set(cookie.name, cookie.value)
      })
      return setupRedirect
    }

    // 온보딩 완료 + 인증 라우트(/login, /signup) -> /home으로 리다이렉트
    if (matchesRoute(pathname, AUTH_ROUTES)) {
      const homeRedirect = redirectTo(request, '/home')
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        homeRedirect.cookies.set(cookie.name, cookie.value)
      })
      return homeRedirect
    }
  }

  return supabaseResponse
}

// ─────────────────────────────────────────────────────────────
// 온보딩 상태 확인 헬퍼
// ─────────────────────────────────────────────────────────────

/**
 * checkOnboardingStatus
 *
 * 유저의 온보딩 완료 여부를 확인합니다.
 *
 * 동작 순서:
 *   1. 쿠키(wm_onboarded)에 캐시된 값이 있으면 DB 조회 없이 반환
 *   2. 없으면 Supabase profiles 테이블에서 is_onboarded 조회
 *   3. 완료 상태이면 쿠키에 캐시 (7일)
 */
async function checkOnboardingStatus(
  request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  supabaseResponse: NextResponse
): Promise<boolean> {
  // 쿠키에 캐시된 온보딩 완료 기록이 있으면 DB 조회 스킵
  const cachedOnboarded = request.cookies.get(ONBOARDED_COOKIE)?.value
  if (cachedOnboarded === '1') {
    return true
  }

  const { data: profile, error } = await supabase
    .from('wingman_profiles')
    .select('is_onboarded')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return false
  }

  // 온보딩 완료 -> 쿠키에 캐시 (이후 7일간 DB 조회 생략)
  if (profile.is_onboarded) {
    supabaseResponse.cookies.set(ONBOARDED_COOKIE, '1', {
      maxAge: ONBOARDED_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }

  return profile.is_onboarded ?? false
}
