import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Generate a random 8-character alphanumeric code
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { qrId } = await params

    // Get the existing QR code
    const { data: existingQR, error: fetchError } = await supabase
      .from('qr_codes')
      .select('event_id')
      .eq('id', qrId)
      .single()

    if (fetchError || !existingQR) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Generate new short code
    let shortCode = generateShortCode()
    let attempts = 0
    const maxAttempts = 10

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('short_code', shortCode)
        .single()

      if (!existing) break
      shortCode = generateShortCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique code' },
        { status: 500 }
      )
    }

    // Update QR code with new short code and URL
    const codeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://safariwrap.com'}/r/${shortCode}`
    
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({
        short_code: shortCode,
        code_url: codeUrl,
        scans_count: 0,
        unique_scans_count: 0,
      })
      .eq('id', qrId)

    if (updateError) {
      console.error('Error updating QR code:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      short_code: shortCode,
      code_url: codeUrl,
    })
  } catch (error) {
    console.error('Error in regenerate QR code API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
