import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const supabase = createAdminClient()

  // Use events table instead of trips
  const { data: events, error } = await supabase
    .from('events')
    .select('*, operators(id, business_name)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const enriched = await Promise.all(
    (events ?? []).map(async (event) => {
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
      
      // Get destination names from metadata.destinations array (for safari events)
      const destinationNames = event.metadata?.destinations || [];
      
      // Format to match expected trip structure for backward compatibility
      return {
        id: event.id,
        trip_name: event.title, // Map title to trip_name
        start_date: event.start_date,
        end_date: event.end_date,
        status: event.status,
        operator_id: event.operator_id,
        operators: event.operators,
        destination_names: destinationNames,
        created_at: event.created_at,
        reviews_count: count ?? 0,
        // Include event-specific fields
        type: event.type,
        location: event.location,
        metadata: event.metadata,
      }
    })
  )

  return Response.json(enriched)
}
