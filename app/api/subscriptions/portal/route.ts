import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCustomerPortalUrl } from '@/lib/snippesh';

export async function POST(request: NextRequest) {
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
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.snippesh_customer_id) {
      return NextResponse.json(
        { error: 'No customer ID found. Please contact support.' },
        { status: 400 }
      );
    }

    // Create customer portal URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalUrl = await createCustomerPortalUrl(
      subscription.snippesh_customer_id,
      `${baseUrl}/dashboard`
    );

    return NextResponse.json({ portalUrl });

  } catch (error: any) {
    console.error('Customer portal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
