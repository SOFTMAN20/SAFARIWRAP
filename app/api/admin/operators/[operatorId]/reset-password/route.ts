import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../../../utils'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ operatorId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const { operatorId } = await params
  const supabase = createAdminClient()

  // Get operator email
  const { data: authUser, error: userError } = await supabase.auth.admin.getUserById(operatorId)
  if (userError || !authUser?.user?.email) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  // Send password reset email using the regular Supabase client (which sends the email)
  const { createClient } = await import('@supabase/supabase-js')
  const regularClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await regularClient.auth.resetPasswordForEmail(authUser.user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/login`,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true, email: authUser.user.email })
}
