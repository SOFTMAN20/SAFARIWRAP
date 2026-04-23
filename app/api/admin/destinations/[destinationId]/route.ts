import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../../utils'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ destinationId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const { destinationId } = await params
  const body = await req.json()
  const { name, country, emoji, fun_fact, area, wildlife_highlight } = body

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('destinations')
    .update({ name, country, emoji, fun_fact, area, wildlife_highlight })
    .eq('id', destinationId)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ destinationId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const { destinationId } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('destinations')
    .delete()
    .eq('id', destinationId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
