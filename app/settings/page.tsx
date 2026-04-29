import { notFound }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient   from './SettingsClient'

export const metadata = { title: '프로필 설정' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const [{ data: profile }, { count: friendCount }] = await Promise.all([
    supabase
      .from('wingman_profiles')
      .select('display_name, insta_id, age, gender, region, bio')
      .eq('id', user.id)
      .single(),
    supabase
      .from('friend_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('registered_by', user.id),
  ])

  if (!profile) return notFound()

  return (
    <SettingsClient
      profile={profile}
      friendCount={friendCount ?? 0}
    />
  )
}
