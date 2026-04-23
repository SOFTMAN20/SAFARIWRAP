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
      .from('qr_codes')
      .select(`
        *,
        event:events (
          title,
          type,
          location,
          operator:operators (
            business_name
          )
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (search) {
      query = query.or(`short_code.ilike.%${search}%,event.title.ilike.%${search}%`)
    }

    if (type && type !== 'all') {
      query = query.eq('event.type', type)
    }

    const { data: qrCodes, error } = await query

    if (error) {
      console.error('Error fetching QR codes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(qrCodes || [])
  } catch (error) {
    console.error('Error in QR codes API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
