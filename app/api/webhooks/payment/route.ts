import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentProvider, getProviderConfig, WebhookEvent } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    // Get payment provider
    const paymentProvider = getPaymentProvider();
    const config = getProviderConfig();
    
    // Get raw body for signature verification
    const body = await request.text();
    
    // Get signature from headers (try multiple header names for different providers)
    const signature = request.headers.get('x-snippe-signature') || 
                     request.headers.get('x-signature') ||
                     request.headers.get('x-azampay-signature') ||
                     request.headers.get('stripe-signature') || '';

    // Verify webhook signature
    if (!paymentProvider.verifyWebhookSignature(body, signature, config.webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook event (provider-agnostic)
    const event: WebhookEvent = paymentProvider.parseWebhookEvent(body);
    
    console.log(`Received ${event.provider} webhook:`, {
      eventType: event.eventType,
      paymentId: event.paymentId,
      status: event.status,
      amount: event.amount,
    });

    const supabase = await createClient();

    // Handle different event types
    switch (event.eventType) {
      case 'payment.completed':
        await handlePaymentCompleted(supabase, event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(supabase, event);
        break;

      case 'payment.pending':
        await handlePaymentPending(supabase, event);
        break;

      case 'payment.refunded':
        await handlePaymentRefunded(supabase, event);
        break;

      default:
        console.log('Unhandled webhook event type:', event.eventType);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(supabase: any, event: WebhookEvent) {
  const { paymentId, metadata, amount, currency } = event;
  
  console.log('Processing completed payment:', paymentId);
  
  // Update payment record
  const { error: paymentUpdateError } = await supabase
    .from('payments')
    .update({ 
      status: 'completed',
      metadata: {
        ...metadata,
        completed_at: event.completedAt?.toISOString(),
        provider: event.provider,
      }
    })
    .eq('transaction_id', paymentId);

  if (paymentUpdateError) {
    console.error('Failed to update payment:', paymentUpdateError);
  }

  // If this is a subscription payment, activate subscription
  if (metadata?.subscription_type) {
    const operatorId = metadata.operator_id;
    const plan = metadata.plan;
    const isAnnual = metadata.subscription_type === 'annual';

    if (!operatorId || !plan) {
      console.error('Missing operator_id or plan in metadata');
      return;
    }

    // Check if subscription exists
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('operator_id', operatorId)
      .maybeSingle();

    // Calculate expiration date
    const daysToAdd = isAnnual ? 365 : 30;
    const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

    const subscriptionData = {
      plan,
      status: 'active',
      snippesh_subscription_id: paymentId,
      snippesh_customer_id: event.customer.email,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingSub) {
      // Update existing subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('operator_id', operatorId);

      if (subError) {
        console.error('Failed to update subscription:', subError);
      } else {
        console.log(`✅ Subscription updated for operator ${operatorId} - Plan: ${plan} (${isAnnual ? 'Annual' : 'Monthly'})`);
      }
    } else {
      // Create new subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          operator_id: operatorId,
          ...subscriptionData,
        });

      if (subError) {
        console.error('Failed to create subscription:', subError);
      } else {
        console.log(`✅ Subscription created for operator ${operatorId} - Plan: ${plan} (${isAnnual ? 'Annual' : 'Monthly'})`);
      }
    }
  }
}

async function handlePaymentFailed(supabase: any, event: WebhookEvent) {
  const { paymentId } = event;
  
  console.log('Processing failed payment:', paymentId);
  
  // Update payment record
  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'failed',
      metadata: {
        provider: event.provider,
        failed_at: new Date().toISOString(),
      }
    })
    .eq('transaction_id', paymentId);

  if (error) {
    console.error('Failed to update payment:', error);
  }

  console.log(`❌ Payment failed: ${paymentId}`);
}

async function handlePaymentPending(supabase: any, event: WebhookEvent) {
  const { paymentId } = event;
  
  console.log('Processing pending payment:', paymentId);
  
  // Update payment record to pending if it exists
  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'pending',
      metadata: {
        provider: event.provider,
      }
    })
    .eq('transaction_id', paymentId);

  if (error) {
    console.error('Failed to update payment:', error);
  }
}

async function handlePaymentRefunded(supabase: any, event: WebhookEvent) {
  const { paymentId } = event;
  
  console.log('Processing refunded payment:', paymentId);
  
  // Update payment record
  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'refunded',
      metadata: {
        provider: event.provider,
        refunded_at: new Date().toISOString(),
      }
    })
    .eq('transaction_id', paymentId);

  if (error) {
    console.error('Failed to update payment:', error);
  }

  console.log(`💰 Payment refunded: ${paymentId}`);
}
