import { NextRequest, NextResponse } from 'next/server';
import { getOperatorImpactStats } from '@/lib/environmental-impact';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operatorId = searchParams.get('operator_id');

    if (!operatorId) {
      return NextResponse.json(
        { error: 'operator_id is required' },
        { status: 400 }
      );
    }

    const result = await getOperatorImpactStats(operatorId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
    });

  } catch (error) {
    console.error('Environmental stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}