import type { Metadata } from 'next'

export const metadata: Metadata = { title: '비밀번호 재설정' }

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
