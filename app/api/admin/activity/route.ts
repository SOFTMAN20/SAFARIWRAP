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
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')

    // TODO: Replace with actual activity_logs table query
    // For now, return mock data
    const mockLogs = [
      {
        id: '1',
        admin_email: user.email || 'admin@safariwrap.com',
        action: 'view_dashboard',
        resource_type: 'dashboard',
        resource_id: null,
        details: { page: 'admin_dashboard' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        admin_email: user.email || 'admin@safariwrap.com',
        action: 'view_operators',
        resource_type: 'operator',
        resource_id: null,
        details: { count: 3 },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        admin_email: user.email || 'admin@safariwrap.com',
        action: 'view_events',
        resource_type: 'event',
        resource_id: null,
        details: { count: 3 },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]

    // Apply filters
    let filtered = mockLogs

    if (search) {
      filtered = filtered.filter(log =>
        log.admin_email.toLowerCase().includes(search.toLowerCase()) ||
        log.resource_type.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (action && action !== 'all') {
      filtered = filtered.filter(log => log.action.includes(action))
    }

    if (resource && resource !== 'all') {
      filtered = filtered.filter(log => log.resource_type === resource)
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Error in activity logs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
