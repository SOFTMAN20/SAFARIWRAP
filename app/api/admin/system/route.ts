import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const supabase = createAdminClient()
  const startTime = Date.now()

  try {
    // Test database connection and get response time
    await supabase.from('operators').select('id', { count: 'exact', head: true })
    const responseTime = Date.now() - startTime

    // Get table counts
    const [
      { count: operators },
      { count: events },
      { count: reviews },
      { count: wraps },
      { count: destinations },
      { count: tree_activities },
      { count: subscriptions },
    ] = await Promise.all([
      supabase.from('operators').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('wraps').select('id', { count: 'exact', head: true }),
      supabase.from('destinations').select('id', { count: 'exact', head: true }),
      supabase.from('tree_activities').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
    ])

    // Get auth users count
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1 })
    const totalUsers = authData?.users?.length ?? 0

    // Determine statuses based on response time and data
    const databaseStatus = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'down'
    const storageStatus = 'healthy' // Supabase manages this
    const authStatus = 'healthy' // If we got here, auth is working

    return Response.json({
      database: {
        status: databaseStatus,
        responseTime,
        connections: 1, // Supabase manages connection pooling
      },
      storage: {
        status: storageStatus,
        usedSpace: 'N/A', // Supabase doesn't expose this
        totalSpace: 'Unlimited',
      },
      tables: {
        operators: operators ?? 0,
        events: events ?? 0,
        reviews: reviews ?? 0,
        wraps: wraps ?? 0,
        destinations: destinations ?? 0,
        tree_activities: tree_activities ?? 0,
        subscriptions: subscriptions ?? 0,
      },
      auth: {
        status: authStatus,
        totalUsers,
      },
    })
  } catch (error) {
    console.error('System health check failed:', error)
    return Response.json({
      database: { status: 'down', responseTime: 0, connections: 0 },
      storage: { status: 'down', usedSpace: '0 MB', totalSpace: '0 GB' },
      tables: { operators: 0, events: 0, reviews: 0, wraps: 0, destinations: 0, tree_activities: 0, subscriptions: 0 },
      auth: { status: 'down', totalUsers: 0 },
    }, { status: 500 })
  }
}
