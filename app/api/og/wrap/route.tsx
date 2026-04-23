import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const guestName = searchParams.get('guestName') || 'Safari Guest';
    const eventTitle = searchParams.get('eventTitle') || 'Safari Adventure';
    const rating = parseInt(searchParams.get('rating') || '5');
    const trees = searchParams.get('trees') || '0';
    const destination = searchParams.get('destination') || 'Tanzania';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FCFAF5',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #1B4D3E 2%, transparent 0%), radial-gradient(circle at 75px 75px, #F4C542 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            position: 'relative',
          }}
        >
          {/* Background Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(27, 77, 62, 0.1) 0%, rgba(244, 197, 66, 0.1) 100%)',
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Logo/Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                backgroundColor: '#1B4D3E',
                marginBottom: '40px',
                fontSize: '60px',
              }}
            >
              🦁
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 900,
                color: '#1B4D3E',
                textAlign: 'center',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {guestName}'s Safari Wrap
            </div>

            {/* Event Title */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: '#6B7280',
                textAlign: 'center',
                marginBottom: '40px',
              }}
            >
              {eventTitle}
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                gap: '60px',
                marginBottom: '40px',
              }}
            >
              {/* Rating */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '10px',
                  }}
                >
                  {'⭐'.repeat(rating)}
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#6B7280',
                  }}
                >
                  Rating
                </div>
              </div>

              {/* Trees */}
              {parseInt(trees) > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#10B981',
                      marginBottom: '10px',
                    }}
                  >
                    🌳 {trees}
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    Trees Planted
                  </div>
                </div>
              )}

              {/* Destination */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '10px',
                  }}
                >
                  📍
                </div>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#6B7280',
                  }}
                >
                  {destination}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#1B4D3E',
                }}
              >
                SafariWrap
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#F4C542',
                }}
              >
                ✨
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
