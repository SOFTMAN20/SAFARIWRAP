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

    // Get total wraps
    const { count: totalWraps } = await supabase
      .from('wraps')
      .select('*', { count: 'exact', head: true })

    // Get wraps by type (join with events)
    const { data: wrapsByType } = await supabase
      .from('wraps')
      .select('event:events(type)')

    // Count by type
    const typeCounts = {
      safari: 0,
      marathon: 0,
      tour: 0,
    }

    wrapsByType?.forEach((wrap: any) => {
      const type = wrap.event?.type
      if (type && type in typeCounts) {
        typeCounts[type as keyof typeof typeCounts]++
      }
    })

    // Calculate stats
    const stats = {
      total_wraps: totalWraps || 0,
      wraps_by_type: typeCounts,
      avg_shares: 0, // TODO: Implement when we have sharing tracking
      most_viewed: 0, // TODO: Implement when we have view tracking
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in wraps stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
