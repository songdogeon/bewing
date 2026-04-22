/**
 * components/layout/BottomNav.tsx
 *
 * 하단 탭 네비게이션 — Black & White 미니멀
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowLeftRight, Users, User } from 'lucide-react'

interface NavTab {
  href:        string
  label:       string
  icon:        React.ComponentType<{ className?: string }>
  matchPrefix: string
}

const NAV_TABS: NavTab[] = [
  { href: '/home',    label: '홈',     icon: Home,           matchPrefix: '/home' },
  { href: '/swipe',   label: '스와이프', icon: ArrowLeftRight, matchPrefix: '/swipe' },
  { href: '/matches', label: '매칭',   icon: Users,          matchPrefix: '/matches' },
  { href: '/friends', label: '친구',   icon: User,           matchPrefix: '/friends' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-40 bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center h-16">
        {NAV_TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.matchPrefix)
          const Icon     = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1.5 transition-colors duration-150"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`h-[20px] w-[20px] transition-colors duration-150 ${
                  isActive ? 'text-slate-950' : 'text-slate-400'
                }`}
              />
              <span className={`text-[10px] leading-none transition-colors duration-150 ${
                isActive ? 'text-slate-950 font-semibold' : 'text-slate-400 font-medium'
              }`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
