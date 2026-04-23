import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'admin@safariwrap.com'
const ADMIN_PASSWORD = 'Safari@Admin2024!'

/**
 * One-time admin setup endpoint.
 * Creates the admin user in Supabase if they don't already exist.
 *
 * Usage: GET /api/admin/setup
 * Only works when NODE_ENV !== 'production' OR when ADMIN_SETUP_OPEN=true
 */
export async function GET(req: NextRequest) {
  const isOpen =
    process.env.NODE_ENV !== 'production' ||
    process.env.ADMIN_SETUP_OPEN === 'true'

  if (!isOpen) {
    return Response.json({ error: 'Setup is disabled in production. Set ADMIN_SETUP_OPEN=true to re-enable.' }, { status: 403 })
  }

  try {
    const supabase = createAdminClient()

    // Check if admin user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email === ADMIN_EMAIL)

    if (existing) {
      // Update password and ensure operator record has admin role
      await supabase.auth.admin.updateUserById(existing.id, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      })
      
      // Ensure profile record exists with admin role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', existing.id)
        .maybeSingle()
      
      if (profileData) {
        // Update existing profile to admin role
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', existing.id)
      } else {
        // Create profile record with admin role
        await supabase
          .from('profiles')
          .insert({
            id: existing.id,
            email: ADMIN_EMAIL,
            full_name: 'Platform Admin',
            role: 'admin',
          })
      }
      
      // Ensure operator record exists
      const { data: operatorData } = await supabase
        .from('operators')
        .select('id')
        .eq('id', existing.id)
        .maybeSingle()
      
      if (!operatorData) {
        // Create operator record
        await supabase
          .from('operators')
          .insert({
            id: existing.id,
            business_name: 'SafariWrap Admin',
          })
      }
      
      return Response.json({
        message: 'Admin account already exists — password reset and role updated.',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        url: '/login',
      })
    }

    // Create admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { is_admin: true, name: 'Platform Admin' },
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    // Create profile record with admin role
    if (data.user) {
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: ADMIN_EMAIL,
          full_name: 'Platform Admin',
          role: 'admin',
        })
      
      // Create operator record
      await supabase
        .from('operators')
        .insert({
          id: data.user.id,
          business_name: 'SafariWrap Admin',
        })
    }

    return Response.json({
      message: 'Admin account created successfully.',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      url: '/login',
      userId: data.user?.id,
    })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
