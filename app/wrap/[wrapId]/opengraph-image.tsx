import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Safari Wrap';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ wrapId: string }> }) {
  const { wrapId } = await params;
  
  // Fetch wrap data
  const supabase = await createClient();
  const { data: wrap } = await supabase
    .from('wraps')
    .select('*, events(*)')
    .eq('id', wrapId)
    .single();

  if (!wrap) {
    // Return default image if wrap not found
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #1B4D3E 0%, #2D6A4F 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 'bold', color: 'white' }}>
            SafariWrap
          </div>
          <div style={{ fontSize: 40, color: '#F4C542', marginTop: 20 }}>
            Your Safari, Wrapped
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const wrapData = wrap.wrap_data as any;
  const eventTitle = wrap.events?.title || 'Safari Experience';
  const guestName = wrapData?.guest_name || 'Guest';
  const rating = wrapData?.rating || 5;
  const treesPlanted = wrapData?.environmental_impact?.trees_planted || 0;
  const totalPhotos = wrapData?.photos?.length || 0;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1B4D3E 0%, #2D6A4F 50%, #F4C542 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>
            🦁 SafariWrap
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 30,
            padding: 60,
          }}
        >
          {/* Event Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: '#1B4D3E',
              marginBottom: 20,
            }}
          >
            {eventTitle}
          </div>

          {/* Guest Name */}
          <div
            style={{
              fontSize: 36,
              color: '#6B7280',
              marginBottom: 40,
            }}
          >
            {guestName}'s Safari Experience
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'flex',
              gap: 40,
            }}
          >
            {/* Rating */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#FEF3C7',
                padding: 30,
                borderRadius: 20,
                flex: 1,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 10 }}>
                {'⭐'.repeat(rating)}
              </div>
              <div style={{ fontSize: 24, color: '#92400E', fontWeight: 'bold' }}>
                Rating
              </div>
            </div>

            {/* Photos */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#DBEAFE',
                padding: 30,
                borderRadius: 20,
                flex: 1,
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 'bold', color: '#1E40AF' }}>
                {totalPhotos}
              </div>
              <div style={{ fontSize: 24, color: '#1E3A8A', fontWeight: 'bold' }}>
                📸 Photos
              </div>
            </div>

            {/* Trees */}
            {treesPlanted > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: '#D1FAE5',
                  padding: 30,
                  borderRadius: 20,
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 56, fontWeight: 'bold', color: '#065F46' }}>
                  {treesPlanted}
                </div>
                <div style={{ fontSize: 24, color: '#047857', fontWeight: 'bold' }}>
                  🌳 Trees
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 40,
            color: 'white',
          }}
        >
          <div style={{ fontSize: 28 }}>
            ✨ Created with SafariWrap
          </div>
          <div style={{ fontSize: 24, opacity: 0.8 }}>
            safariwrap.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
