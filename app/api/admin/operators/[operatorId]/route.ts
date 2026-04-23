import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../../utils'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ operatorId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const { operatorId } = await params
  const supabase = createAdminClient()

  const { data: operator, error } = await supabase
    .from('operators')
    .select('*, profiles(email, full_name)')
    .eq('id', operatorId)
    .maybeSingle()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!operator) return Response.json({ error: 'Not found' }, { status: 404 })

  // Get Supabase auth user to check ban status
  const { data: authUser } = await supabase.auth.admin.getUserById(operatorId)
  const is_suspended = authUser?.user?.banned_until
    ? new Date(authUser.user.banned_until) > new Date()
    : false

  // Use events table instead of trips
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('operator_id', operatorId)
    .order('created_at', { ascending: false })

  const eventIds = (events ?? []).map(e => e.id)

  const { data: reviews } = eventIds.length > 0
    ? await supabase
        .from('reviews')
        .select('id, guest_name, star_rating, review_text, created_at, event_id')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] }

  const { count: wrapsCount } = eventIds.length > 0
    ? await supabase
        .from('wraps')
        .select('id', { count: 'exact', head: true })
        .in('event_id', eventIds)
    : { count: 0 }

  // Format events as trips for backward compatibility
  const trips = (events ?? []).map(e => ({
    id: e.id,
    trip_name: e.title,
    start_date: e.start_date,
    end_date: e.end_date,
    status: e.status,
    destination_names: [], // Could extract from metadata if needed
  }))

  return Response.json({
    operator: { 
      ...operator, 
      email: (operator.profiles as any)?.email || 'N/A',
      full_name: (operator.profiles as any)?.full_name || null,
      is_suspended 
    },
    trips,
    reviews: reviews ?? [],
    wraps_count: wrapsCount ?? 0,
  })
}

// PATCH: suspend or unsuspend an operator
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ operatorId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const { operatorId } = await params
  const { suspend } = await req.json()
  const supabase = createAdminClient()

  // Ban/unban via Supabase Auth admin API
  const { data, error } = await supabase.auth.admin.updateUserById(operatorId, {
    ban_duration: suspend ? '876600h' : 'none', // 100 years = effectively permanent
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true, suspended: suspend, user: data.user })
}

// DELETE: permanently remove an operator and all their data
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ operatorId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const { operatorId } = await params
  const supabase = createAdminClient()

  // 1. Get all event IDs belonging to this operator
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .eq('operator_id', operatorId)

  const eventIds = (events ?? []).map(e => e.id)

  // 2. Delete wraps for those events
  if (eventIds.length > 0) {
    await supabase.from('wraps').delete().in('event_id', eventIds)
  }

  // 3. Delete reviews for those events
  if (eventIds.length > 0) {
    await supabase.from('reviews').delete().in('event_id', eventIds)
  }

  // 4. Delete events
  await supabase.from('events').delete().eq('operator_id', operatorId)

  // 5. Delete operator profile row
  await supabase.from('operators').delete().eq('id', operatorId)

  // 6. Delete profile row
  await supabase.from('profiles').delete().eq('id', operatorId)

  // 7. Delete the Supabase Auth user (point of no return)
  const { error } = await supabase.auth.admin.deleteUser(operatorId)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return new Response(null, { status: 204 })
}
