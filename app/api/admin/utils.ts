import { createClient } from '@/lib/supabase/server'

export async function checkAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

  const isAdmin =
    user.user_metadata?.is_admin === true ||
    adminEmails.includes(user.email || '')

  if (!isAdmin) return null
  return user
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
