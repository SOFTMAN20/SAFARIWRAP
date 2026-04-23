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

    // Get all events
    const { data: events } = await supabase
      .from('events')
      .select('type, status')

    // Count by type
    const byType = {
      safari: 0,
      marathon: 0,
      tour: 0,
    }

    // Count by status
    const byStatus = {
      upcoming: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    }

    events?.forEach((event) => {
      // Count by type
      if (event.type in byType) {
        byType[event.type as keyof typeof byType]++
      }

      // Count by status
      if (event.status in byStatus) {
        byStatus[event.status as keyof typeof byStatus]++
      }
    })

    const stats = {
      total_events: events?.length || 0,
      by_type: byType,
      by_status: byStatus,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in events stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
