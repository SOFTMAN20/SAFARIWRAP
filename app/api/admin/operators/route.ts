import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const supabase = createAdminClient()

  // Get operators with profiles (for email)
  const { data: operators, error } = await supabase
    .from('operators')
    .select('id, business_name, logo_url, brand_color_1, brand_color_2, created_at, profiles(email)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Get all auth users to check ban status in one call
  const { data: authUsersData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const authMap = new Map(
    (authUsersData?.users ?? []).map(u => [u.id, u])
  )

  const enriched = await Promise.all(
    (operators ?? []).map(async (op) => {
      // Get events count (replacing trips)
      const { count: eventsCount } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('operator_id', op.id)

      // Get reviews count from events
      const { data: eventIds } = await supabase
        .from('events')
        .select('id')
        .eq('operator_id', op.id)

      const ids = (eventIds ?? []).map(e => e.id)

      const { count: reviewsCount } = ids.length > 0
        ? await supabase.from('reviews').select('id', { count: 'exact', head: true }).in('event_id', ids)
        : { count: 0 }

      const authUser = authMap.get(op.id)
      const is_suspended = authUser?.banned_until
        ? new Date(authUser.banned_until) > new Date()
        : false

      return {
        id: op.id,
        business_name: op.business_name,
        email: (op.profiles as any)?.email || 'N/A',
        logo_url: op.logo_url,
        brand_color_1: op.brand_color_1,
        brand_color_2: op.brand_color_2,
        created_at: op.created_at,
        trips_count: eventsCount ?? 0, // Keep 'trips_count' for backward compatibility
        reviews_count: reviewsCount ?? 0,
        is_suspended,
      }
    })
  )

  return Response.json(enriched)
}
