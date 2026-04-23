import { NextRequest } from 'next/server';

// Mock Snippe.sh customer portal for demo purposes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer');

  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Customer Portal (Demo)</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 2rem;
          background: #f8f9fa;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1B4D3E;
          margin-bottom: 0.5rem;
        }
        .section {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .section h3 {
          margin-top: 0;
          color: #1B4D3E;
        }
        .button {
          background: #1B4D3E;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 1rem;
          margin-bottom: 0.5rem;
        }
        .button:hover {
          background: #2D6B5A;
        }
        .button.secondary {
          background: #6c757d;
        }
        .button.danger {
          background: #dc3545;
        }
        .status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .status.active {
          background: #d4edda;
          color: #155724;
        }
        .back-link {
          text-align: center;
          margin-top: 2rem;
        }
        .back-link a {
          color: #1B4D3E;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🦁 Customer Portal</div>
          <h2>Manage Your Subscription</h2>
          <p>Customer ID: ${customerId}</p>
        </div>
        
        <div class="section">
          <h3>Current Subscription</h3>
          <p><strong>Plan:</strong> Pro Plan</p>
          <p><strong>Status:</strong> <span class="status active">Active</span></p>
          <p><strong>Next billing:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          <p><strong>Amount:</strong> TZS 75,000/month</p>
        </div>
        
        <div class="section">
          <h3>Subscription Actions</h3>
          <button class="button" onclick="alert('This is a demo. Feature not implemented.')">
            Change Plan
          </button>
          <button class="button secondary" onclick="alert('This is a demo. Feature not implemented.')">
            Update Payment Method
          </button>
          <button class="button danger" onclick="confirmCancel()">
            Cancel Subscription
          </button>
        </div>
        
        <div class="section">
          <h3>Billing History</h3>
          <p><strong>Latest Payment:</strong> TZS 75,000 on ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span class="status active">Paid</span></p>
          <button class="button secondary" onclick="alert('This is a demo. Feature not implemented.')">
            Download Invoice
          </button>
        </div>
        
        <div class="back-link">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">← Back to Dashboard</a>
        </div>
      </div>
      
      <script>
        function confirmCancel() {
          if (confirm('Are you sure you want to cancel your subscription? This is just a demo.')) {
            alert('Subscription cancelled (demo only)');
            window.location.href = '${process.env.NEXT_PUBLIC_APP_URL}/dashboard?cancelled=true';
          }
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