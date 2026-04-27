import { notFound }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatClient       from './ChatClient'

export const metadata = { title: '채팅' }

export default async function ChatPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params
  const supabase    = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: match } = await supabase
    .from('wingman_matches')
    .select(`
      id, wingman1_id, wingman2_id, status,
      friend1:friend_profiles!friend1_id ( id, display_name, insta_id ),
      friend2:friend_profiles!friend2_id ( id, display_name, insta_id ),
      wingman1:wingman_profiles!wingman1_id ( id, display_name, insta_id ),
      wingman2:wingman_profiles!wingman2_id ( id, display_name, insta_id )
    `)
    .eq('id', matchId)
    .or(`wingman1_id.eq.${user.id},wingman2_id.eq.${user.id}`)
    .single()

  if (!match) return notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
    .limit(100)

  return (
    <ChatClient
      match={match as any}
      initialMessages={messages ?? []}
      currentUserId={user.id}
    />
  )
}
