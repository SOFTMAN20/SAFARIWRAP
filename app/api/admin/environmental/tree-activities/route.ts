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
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('tree_activities')
      .select(`
        *,
        event:events (
          title,
          type,
          location,
          operator:operators (
            business_name
          )
        ),
        gps_locations (
          id,
          latitude,
          longitude,
          location_name,
          verified
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`event.title.ilike.%${search}%,gps_locations.location_name.ilike.%${search}%`)
    }

    if (status === 'verified') {
      query = query.eq('gps_locations.verified', true)
    } else if (status === 'pending') {
      query = query.eq('gps_locations.verified', false)
    }

    const { data: activities, error } = await query

    if (error) {
      console.error('Error fetching tree activities:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(activities || [])
  } catch (error) {
    console.error('Error in tree activities API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
