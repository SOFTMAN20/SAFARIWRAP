import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkAdminAuth, unauthorized } from '../../utils'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const user = await checkAdminAuth()
  if (!user) return unauthorized()

  const { reviewId } = await params
  const supabase = createAdminClient()

  // Delete associated safari_wrap first (FK constraint)
  await supabase.from('safari_wraps').delete().eq('review_id', reviewId)

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  return new Response(null, { status: 204 })
}
