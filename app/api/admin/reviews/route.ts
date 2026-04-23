import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const supabase = createAdminClient()

  // Use events table instead of trips
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, guest_name, email, star_rating, review_text, created_at, event_id, events(title, operators(business_name))')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Format to match expected structure for backward compatibility
  const formatted = (reviews ?? []).map(review => ({
    ...review,
    trip_id: review.event_id, // Map event_id to trip_id for backward compatibility
    trips: review.events ? {
      trip_name: (review.events as any).title,
      operators: (review.events as any).operators
    } : null
  }))

  return Response.json(formatted)
}
