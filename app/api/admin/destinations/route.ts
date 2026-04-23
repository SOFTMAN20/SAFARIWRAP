import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('destinations')
    .select('*')
    .order('country', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const body = await req.json()
  const { name, country, emoji, fun_fact, area, wildlife_highlight } = body

  if (!name || !country || !emoji) {
    return Response.json({ error: 'name, country, and emoji are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('destinations')
    .insert({ name, country, emoji, fun_fact, area, wildlife_highlight })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
