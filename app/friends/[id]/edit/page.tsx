import { notFound }    from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditFriendClient from './EditFriendClient'

export const metadata = { title: '친구 정보 수정' }

export interface FriendPhoto {
  id:            string
  photo_url:     string
  display_order: number
}

export default async function EditFriendPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }   = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: friend } = await supabase
    .from('friend_profiles')
    .select(`
      id, insta_id, display_name, age, gender, region, bio,
      friend_photos ( id, photo_url, display_order )
    `)
    .eq('id', id)
    .eq('registered_by', user.id)
    .single()

  if (!friend) return notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos: FriendPhoto[] = ((friend as any).friend_photos ?? [])
    .sort((a: FriendPhoto, b: FriendPhoto) => a.display_order - b.display_order)

  return (
    <EditFriendClient
      friendId={id}
      initialData={{
        display_name: friend.display_name ?? '',
        insta_id:     friend.insta_id,
        age:          friend.age ? String(friend.age) : '',
        gender:       (friend.gender as 'male' | 'female' | 'other') ?? undefined,
        region:       friend.region ?? '',
        bio:          friend.bio ?? '',
      }}
      initialPhotos={photos}
    />
  )
}
