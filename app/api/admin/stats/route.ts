import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const supabase = createAdminClient()

  const [
    { count: operatorsCount },
    { count: eventsCount },
    { count: reviewsCount },
    { count: wrapsCount },
  ] = await Promise.all([
    supabase.from('operators').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('wraps').select('*', { count: 'exact', head: true }),
  ])

  // Recent operators (last 5) - join with profiles for email
  const { data: recentOperators } = await supabase
    .from('operators')
    .select('id, business_name, created_at, logo_url, profiles(email)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Format operators with email from profiles
  const formattedOperators = recentOperators?.map(op => ({
    id: op.id,
    business_name: op.business_name,
    email: (op.profiles as any)?.email || 'N/A',
    created_at: op.created_at,
    logo_url: op.logo_url
  })) ?? []

  // Recent reviews (last 5) with event and operator
  const { data: recentReviews } = await supabase
    .from('reviews')
    .select('id, guest_name, star_rating, created_at, event_id, events(title, operators(business_name))')
    .order('created_at', { ascending: false })
    .limit(5)

  return Response.json({
    operators: operatorsCount ?? 0,
    trips: eventsCount ?? 0, // Keep 'trips' key for backward compatibility
    reviews: reviewsCount ?? 0,
    wraps: wrapsCount ?? 0,
    recentOperators: formattedOperators,
    recentReviews: recentReviews ?? [],
  })
}
