import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('events')
      .select(`
        *,
        operator:operators (
          business_name
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,operator.business_name.ilike.%${search}%`)
    }

    if (type && type !== 'all') {
      query = query.eq('type', type)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event) => {
        // Get reviews count
        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        // Get QR codes count
        const { count: qrCodesCount } = await supabase
          .from('qr_codes')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        // Get wraps count
        const { count: wrapsCount } = await supabase
          .from('wraps')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)

        return {
          ...event,
          reviews_count: reviewsCount || 0,
          qr_codes_count: qrCodesCount || 0,
          wraps_count: wrapsCount || 0,
        }
      })
    )

    return NextResponse.json(eventsWithCounts)
  } catch (error) {
    console.error('Error in events API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
