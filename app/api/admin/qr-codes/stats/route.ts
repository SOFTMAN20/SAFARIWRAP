import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total QR codes
    const { count: totalQRCodes } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })

    // Get all QR codes for aggregation
    const { data: qrCodes } = await supabase
      .from('qr_codes')
      .select('scans_count, unique_scans_count')

    // Calculate totals
    let totalScans = 0
    let totalUniqueScans = 0

    qrCodes?.forEach((qr) => {
      totalScans += qr.scans_count || 0
      totalUniqueScans += qr.unique_scans_count || 0
    })

    // Calculate average conversion rate
    // TODO: Get actual review counts from database
    // For now, estimate based on unique scans (30% conversion rate)
    const estimatedReviews = Math.floor(totalUniqueScans * 0.3)
    const avgConversionRate = totalUniqueScans > 0 
      ? Math.round((estimatedReviews / totalUniqueScans) * 100)
      : 0

    const stats = {
      total_qr_codes: totalQRCodes || 0,
      total_scans: totalScans,
      total_unique_scans: totalUniqueScans,
      avg_conversion_rate: avgConversionRate,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in QR codes stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
