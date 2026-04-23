import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Mock Snippe.sh checkout page for demo purposes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get('plan');
  const operatorId = searchParams.get('operator');

  if (!plan || !operatorId) {
    return redirect('/pricing?error=invalid_params');
  }

  // Simulate successful payment after 2 seconds
  setTimeout(async () => {
    try {
      const supabase = createClient();
      
      // Create/update subscription
      await supabase
        .from('subscriptions')
        .upsert({
          operator_id: operatorId,
          plan: plan,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          snippesh_subscription_id: `sub_mock_${Date.now()}`,
          snippesh_customer_id: `cus_mock_${operatorId}`,
        });

      // Create payment record
      const planPrices = { pro: 75000, enterprise: 250000 };
      await supabase
        .from('payments')
        .insert({
          operator_id: operatorId,
          amount: planPrices[plan as keyof typeof planPrices] || 0,
          currency: 'TZS',
          status: 'completed',
          provider: 'snippesh',
          transaction_id: `txn_mock_${Date.now()}`,
          metadata: { plan, mock: true },
        });

    } catch (error) {
      console.error('Failed to process mock payment:', error);
    }
  }, 2000);

  // Return mock checkout page
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Snippe.sh Checkout (Demo)</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #1B4D3E 0%, #2D6B5A 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .container {
          background: white;
          color: #333;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 400px;
          width: 90%;
          text-align: center;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1B4D3E;
          margin-bottom: 1rem;
        }
        .plan {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .price {
          font-size: 2rem;
          font-weight: bold;
          color: #1B4D3E;
        }
        .button {
          background: #1B4D3E;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          width: 100%;
          margin-top: 1rem;
        }
        .button:hover {
          background: #2D6B5A;
        }
        .button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .spinner {
          display: none;
          width: 20px;
          height: 20px;
          border: 2px solid #fff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .processing {
          display: none;
          margin-top: 1rem;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🦁 Snippe.sh Checkout</div>
        <h2>Complete Your Purchase</h2>
        
        <div class="plan">
          <h3>${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h3>
          <div class="price">${plan === 'pro' ? 'TZS 75,000' : 'TZS 250,000'}/month</div>
        </div>
        
        <p>You're upgrading to the ${plan} plan. This is a demo checkout page.</p>
        
        <button class="button" onclick="processPayment()">
          <span id="button-text">Complete Payment</span>
          <div class="spinner" id="spinner"></div>
        </button>
        
        <div class="processing" id="processing">
          Processing your payment...
        </div>
        
        <p style="font-size: 0.8rem; color: #666; margin-top: 1rem;">
          This is a demo. No real payment will be processed.
        </p>
      </div>
      
      <script>
        function processPayment() {
          const button = document.querySelector('.button');
          const buttonText = document.getElementById('button-text');
          const spinner = document.getElementById('spinner');
          const processing = document.getElementById('processing');
          
          button.disabled = true;
          buttonText.style.display = 'none';
          spinner.style.display = 'block';
          processing.style.display = 'block';
          
          // Simulate payment processing
          setTimeout(() => {
            window.location.href = '${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&plan=${plan}';
          }, 3000);
        }
      </script>
    </body>
    </html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}