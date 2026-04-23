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

    // TODO: Replace with actual activity_logs table query
    // For now, return mock stats
    const stats = {
      total_actions: 3,
      actions_today: 3,
      unique_admins: 1,
      by_action_type: {
        create: 0,
        update: 0,
        delete: 0,
        view: 3,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in activity stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
