import { NextRequest, NextResponse } from 'next/server';
import { createTreeActivity, addGPSLocation, DEFAULT_PARTNER } from '@/lib/environmental-impact';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_id,
      trees_planted,
      gps_location,
    } = body;

    if (!event_id || !trees_planted) {
      return NextResponse.json(
        { error: 'Missing required fields: event_id, trees_planted' },
        { status: 400 }
      );
    }

    // Create tree activity
    const activityResult = await createTreeActivity(event_id, trees_planted);

    if (!activityResult.success || !activityResult.data) {
      return NextResponse.json(
        { error: activityResult.error || 'Failed to create tree activity' },
        { status: 500 }
      );
    }

    // Add GPS location (use default if not provided)
    const location = gps_location || DEFAULT_PARTNER.location;
    
    const gpsResult = await addGPSLocation(
      activityResult.data.id,
      location.latitude,
      location.longitude,
      location.name
    );

    if (!gpsResult.success) {
      console.error('Failed to add GPS location:', gpsResult.error);
      // Continue anyway - tree activity was created
    }

    return NextResponse.json({
      data: {
        tree_activity: activityResult.data,
        gps_location: gpsResult.data,
      },
      message: 'Tree activity created successfully'
    });

  } catch (error) {
    console.error('Tree activity creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}