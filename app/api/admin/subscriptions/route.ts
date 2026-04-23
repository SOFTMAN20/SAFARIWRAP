import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const supabase = createAdminClient()

  try {
    // Get all subscriptions with operator details
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        operator_id,
        plan,
        status,
        expires_at,
        snippesh_subscription_id,
        snippesh_customer_id,
        created_at,
        updated_at,
        operators (
          id,
          business_name,
          profiles (
            email
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate statistics
    const stats = {
      total: subscriptions?.length ?? 0,
      active: subscriptions?.filter(s => s.status === 'active').length ?? 0,
      free: subscriptions?.filter(s => s.plan === 'free').length ?? 0,
      pro: subscriptions?.filter(s => s.plan === 'pro').length ?? 0,
      enterprise: subscriptions?.filter(s => s.plan === 'enterprise').length ?? 0,
      cancelled: subscriptions?.filter(s => s.status === 'cancelled').length ?? 0,
      expired: subscriptions?.filter(s => s.status === 'expired').length ?? 0,
      trialing: subscriptions?.filter(s => s.status === 'trialing').length ?? 0,
    }

    // Calculate MRR (Monthly Recurring Revenue)
    const planPrices = { free: 0, pro: 75000, enterprise: 250000 }
    const mrr = subscriptions
      ?.filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (planPrices[s.plan as keyof typeof planPrices] || 0), 0) ?? 0

    return Response.json({
      subscriptions: subscriptions ?? [],
      stats,
      mrr,
      arr: mrr * 12, // Annual Recurring Revenue
    })
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return Response.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}
