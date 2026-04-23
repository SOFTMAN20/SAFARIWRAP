import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all tree activities
    const { data: activities } = await supabase
      .from('tree_activities')
      .select('trees_planted, co2_offset_kg, event_id')

    // Get unique events count
    const uniqueEvents = new Set(activities?.map(a => a.event_id) || [])

    // Calculate totals
    let totalTrees = 0
    let totalCO2 = 0

    activities?.forEach((activity) => {
      totalTrees += activity.trees_planted || 0
      totalCO2 += activity.co2_offset_kg || 0
    })

    // Get GPS locations stats
    const { data: gpsLocations } = await supabase
      .from('gps_locations')
      .select('verified')

    const verifiedCount = gpsLocations?.filter(loc => loc.verified).length || 0
    const pendingCount = gpsLocations?.filter(loc => !loc.verified).length || 0

    const stats = {
      total_trees_planted: totalTrees,
      total_events: uniqueEvents.size,
      total_co2_offset_kg: totalCO2,
      verified_locations: verifiedCount,
      pending_verification: pendingCount,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in environmental stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
