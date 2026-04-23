import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSubscriptionCheckout } from '@/lib/snippesh';

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

    // Get request body
    const body = await request.json();
    const { plan } = body;

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "pro" or "enterprise"' },
        { status: 400 }
      );
    }

    // Get operator details
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('id, name, business_name, email')
      .eq('id', user.id)
      .single();

    if (operatorError || !operator) {
      return NextResponse.json(
        { error: 'Operator not found' },
        { status: 404 }
      );
    }

    // Create checkout session with Snippe.sh
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const { checkoutUrl, paymentId } = await createSubscriptionCheckout({
      plan,
      operatorId: operator.id,
      operatorEmail: operator.email,
      operatorName: operator.business_name || operator.name,
      successUrl: `${baseUrl}/dashboard?payment=success&session_id=${paymentId}`,
      cancelUrl: `${baseUrl}/pricing?payment=cancelled`,
    });

    // Store pending payment record
    await supabase.from('payments').insert({
      operator_id: operator.id,
      amount: plan === 'pro' ? 75000 : 250000,
      currency: 'TZS',
      status: 'pending',
      provider: 'snippesh',
      transaction_id: paymentId,
      metadata: {
        plan,
        checkout_url: checkoutUrl,
      },
    });

    return NextResponse.json({
      checkoutUrl,
      paymentId,
    });

  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
