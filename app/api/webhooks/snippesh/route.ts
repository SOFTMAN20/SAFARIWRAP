import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature, parseWebhookEvent, type SnippeshWebhookEvent } from '@/lib/snippesh';

const WEBHOOK_SECRET = process.env.SNIPPESH_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-snippe-signature') || 
                     request.headers.get('x-signature') || '';

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook event
    const event: SnippeshWebhookEvent = parseWebhookEvent(body);
    
    console.log('Received Snippe.sh webhook:', {
      event: event.event,
      payment_id: event.payment_id,
      status: event.status,
      amount: event.amount,
    });

    const supabase = await createClient();

    // Handle different event types
    switch (event.event) {
      case 'payment.completed':
        await handlePaymentCompleted(supabase, event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(supabase, event);
        break;

      case 'payment.pending':
        await handlePaymentPending(supabase, event);
        break;

      default:
        console.log('Unhandled webhook event type:', event.event);
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

async function handlePaymentCompleted(supabase: any, event: SnippeshWebhookEvent) {
  const { payment_id, metadata, amount, currency } = event;
  
  console.log('Processing completed payment:', payment_id);
  
  // Update payment record
  const { error: paymentUpdateError } = await supabase
    .from('payments')
    .update({ 
      status: 'completed',
      metadata: {
        ...metadata,
        completed_at: event.completed_at,
      }
    })
    .eq('transaction_id', payment_id);

  if (paymentUpdateError) {
    console.error('Failed to update payment:', paymentUpdateError);
  }

  // If this is a subscription payment, activate subscription
  if (metadata?.subscription_type === 'monthly') {
    const operatorId = metadata.operator_id;
    const plan = metadata.plan;

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

    const subscriptionData = {
      plan,
      status: 'active',
      snippesh_subscription_id: payment_id,
      snippesh_customer_id: event.customer_email, // Use email as customer ID
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
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
        console.log(`✅ Subscription updated for operator ${operatorId} - Plan: ${plan}`);
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
        console.log(`✅ Subscription created for operator ${operatorId} - Plan: ${plan}`);
      }
    }
  }
}

async function handlePaymentFailed(supabase: any, event: SnippeshWebhookEvent) {
  const { payment_id } = event;
  
  console.log('Processing failed payment:', payment_id);
  
  // Update payment record
  const { error } = await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('transaction_id', payment_id);

  if (error) {
    console.error('Failed to update payment:', error);
  }

  console.log(`❌ Payment failed: ${payment_id}`);
}

async function handlePaymentPending(supabase: any, event: SnippeshWebhookEvent) {
  const { payment_id } = event;
  
  console.log('Processing pending payment:', payment_id);
  
  // Update payment record to pending if it exists
  const { error } = await supabase
    .from('payments')
    .update({ status: 'pending' })
    .eq('transaction_id', payment_id);

  if (error) {
    console.error('Failed to update payment:', error);
  }
}
