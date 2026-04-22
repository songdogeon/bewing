import { redirect } from 'next/navigation';

export default function RootPage() {
  // 로그인되지 않은 사용자는 로그인 페이지로, 
  // 로그인된 사용자는 홈으로 리다이렉트
  redirect('/home');
}