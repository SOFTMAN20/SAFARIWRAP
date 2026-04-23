import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

async function getWrapData(wrapId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('safari_wraps')
    .select('*, reviews(*), trips(*, operators(*))')
    .eq('id', wrapId)
    .maybeSingle();

  if (error) console.error('Supabase error:', error);
  return data;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ wrapId: string }> }
) {
  try {
    const { wrapId } = await params;
    const wrap = await getWrapData(wrapId);

    if (!wrap) {
      return new Response('Wrap not found', { status: 404 });
    }

    // Supabase returns joined rows as arrays when using select('*, relation(*)')
    const trip = Array.isArray(wrap.trips) ? wrap.trips[0] : wrap.trips;
    const review = Array.isArray(wrap.reviews) ? wrap.reviews[0] : wrap.reviews;
    const operator = trip?.operators;

    const guestName = review?.guest_name || 'Explorer';
    const tripName = trip?.trip_name || 'Safari Expedition';
    const rating = review?.star_rating || 0;
    const destinations: string[] = trip?.destination_names || [];

    const animalList: string[] = [
      ...(review?.big_five_seen ? review.big_five_seen.split(',').filter(Boolean) : []),
      ...(review?.other_animals ? review.other_animals.split(',').filter(Boolean) : []),
    ];
    const animalCount = animalList.length;

    const primaryColor = operator?.brand_color_1 || '#1B4D3E';
    const accentColor = operator?.brand_color_2 || '#F4C542';
    const year = trip?.start_date ? new Date(trip.start_date).getFullYear() : new Date().getFullYear();
    const stars = Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');

    const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: 'sans-serif',
          background: primaryColor,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: `${accentColor}18`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />

        {/* Main content - must have explicit display with multiple children */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '56px 60px',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                🦁
              </div>
              <span
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {operator?.business_name || ''}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: `${accentColor}22`,
                  border: `1px solid ${accentColor}44`,
                  borderRadius: 12,
                  padding: '8px 18px',
                  width: 'auto',
                }}
              >
                <span
                  style={{
                    color: accentColor,
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  🌍 Expedition {year}
                </span>
              </div>

              <div
                style={{ fontSize: 76, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}
              >
                {guestName}'s
              </div>
              <div
                style={{ fontSize: 76, fontWeight: 900, color: accentColor, lineHeight: 1, letterSpacing: '-0.02em' }}
              >
                Explorer Wrap
              </div>

              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 22, fontWeight: 600, marginTop: 8 }}>
                📍 {tripName}
                {destinations.length > 0 ? ` · ${destinations.slice(0, 2).join(', ')}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                🐾
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700 }}>
                safariwrap.com
              </span>
            </div>
          </div>

          {/* Right column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 20,
              padding: '56px 60px 56px 40px',
              width: 320,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '28px 32px',
              }}
            >
              <span style={{ color: accentColor, fontSize: 13, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Satisfaction
              </span>
              <span style={{ color: 'white', fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
                {rating}
                <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.5)' }}>/5</span>
              </span>
              <span style={{ color: accentColor, fontSize: 24, letterSpacing: 2 }}>{stars}</span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                padding: '28px 32px',
              }}
            >
              <span style={{ color: accentColor, fontSize: 13, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Species Spotted
              </span>
              <span style={{ color: 'white', fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{animalCount}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600 }}>🐾 wildlife sightings</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: `${accentColor}20`,
                border: `1px solid ${accentColor}40`,
                borderRadius: 16,
                padding: '16px 20px',
              }}
            >
              <span style={{ fontSize: 22 }}>🌱</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: accentColor, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Tree Planted
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 }}>Conservation Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

    const filename = `${guestName.replace(/\s+/g, '-').toLowerCase()}-safari-wrap.png`;

    return new Response(imageResponse.body, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error('OG IMAGE ERROR:', err);
    return new Response('Failed to generate image', { status: 500, headers: corsHeaders });
  }
}
