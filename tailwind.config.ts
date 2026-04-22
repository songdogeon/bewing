/**
 * tailwind.config.ts
 *
 * Tailwind CSS v3 설정
 * - shadcn/ui CSS 변수 연동 (globals.css의 --primary 등)
 * - App Router 경로 포함 (content 스캔 범위)
 * - 애니메이션 커스텀 (스와이프 카드용)
 * - 안전 영역 (iOS Safe Area) 플러그인
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  // ── 다크모드: class 기반 (html에 .dark 클래스 토글) ──────────
  darkMode: ['class'],

  // ── 콘텐츠 스캔 범위 ─────────────────────────────────────────
  content: [
    './pages/**/*.{ts,tsx}',          // Pages Router fallback
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',            // src/ 디렉토리 사용 시 대비
  ],

  theme: {
    // ── 컨테이너 ────────────────────────────────────────────────
    container: {
      center:  true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      // ── shadcn/ui CSS 변수 연동 ─────────────────────────────────
      // globals.css의 :root { --background: ... } 와 매핑
      colors: {
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',

        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ── 테두리 반경 (shadcn/ui --radius 연동) ──────────────────
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // ── 폰트 (Inter CSS 변수 연동) ──────────────────────────────
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },

      // ── 커스텀 애니메이션 ────────────────────────────────────────
      keyframes: {
        // shadcn/ui 기본 애니메이션
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },

        // 스와이프 카드 등장 (아래에서 위로)
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },

        // 매칭 배너 하트 펄스
        'heart-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.15)' },
        },

        // 로딩 점 bounce (WingmanClient 저장 인디케이터)
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'translateY(0)' },
          '40%':           { transform: 'translateY(-6px)' },
        },

        // 페이드인 (에러/빈 상태 UI)
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },

      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'slide-up':        'slide-up 0.3s ease-out',
        'heart-pulse':     'heart-pulse 1.2s ease-in-out infinite',
        'bounce-dot':      'bounce-dot 1.2s ease-in-out infinite',
        'fade-in':         'fade-in 0.4s ease-out',
      },

      // ── 스크린 (모바일 최대 너비) ──────────────────────────────
      screens: {
        xs:  '375px',   // iPhone SE
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1536px',
      },

      // ── iOS Safe Area 간격 ──────────────────────────────────────
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left':   'env(safe-area-inset-left)',
        'safe-right':  'env(safe-area-inset-right)',
      },
    },
  },

  // ── 플러그인 ──────────────────────────────────────────────────
  plugins: [
    // tailwindcss-animate (shadcn/ui 권장) — 설치 필요:
    // npm install tailwindcss-animate
    // require('tailwindcss-animate'),
  ],
}

export default config
