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

    // Build query
    let query = supabase
      .from('wraps')
      .select(`
        *,
        event:events (
          title,
          type,
          location
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.ilike('guest_name', `%${search}%`)
    }

    if (type && type !== 'all') {
      query = query.eq('event.type', type)
    }

    const { data: wraps, error } = await query

    if (error) {
      console.error('Error fetching wraps:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(wraps || [])
  } catch (error) {
    console.error('Error in wraps API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
