import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('operator_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('Subscription fetch error:', subError);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    // If no subscription exists, create a free one
    if (!subscription) {
      const { data: newSub, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          operator_id: user.id,
          plan: 'free',
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        console.error('Subscription creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({ subscription: newSub });
    }

    return NextResponse.json({ subscription });

  } catch (error: any) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
