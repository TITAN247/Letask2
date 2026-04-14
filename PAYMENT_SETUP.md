# Payment Integration Setup Guide

## Overview
LetAsk supports **Razorpay** (for India/INR) and **Stripe** (for International/USD) payments for Pro-Mentor sessions.

## 1. Razorpay Setup (For Indian Payments)

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com
2. Sign up with email/business details
3. Complete KYC verification

### Step 2: Get API Keys
1. Dashboard → Settings → API Keys
2. Switch to **Test Mode** (for development)
3. Click "Generate Key"
4. Copy:
   - **Key ID**: `rzp_test_xxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxx`

### Step 3: Add to .env.local
```env
# Razorpay (INR Payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

### Step 4: Test Payment Flow
1. Book a session with a Pro-Mentor
2. Click "Pay Now"
3. Use test card: `5267 3181 8797 5449`
4. Expiry: Any future date, CVV: Any 3 digits

---

## 2. Stripe Setup (For International Payments)

### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Sign up with email
3. Activate account (requires business details for live mode)

### Step 2: Get API Keys
1. Dashboard → Developers → API Keys
2. Copy **Publishable Key**: `pk_test_xxxxxxxxxx`
3. Copy **Secret Key**: `sk_test_xxxxxxxxxx`

### Step 3: Add to .env.local
```env
# Stripe (USD/International Payments)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

### Step 4: Test Payment Flow
1. Use Stripe test card: `4242 4242 4242 4242`
2. Expiry: Any future date, CVV: Any 3 digits

---

## 3. Payment Flow

```
┌─────────────┐      ┌───────────────┐      ┌─────────────┐
│   Mentee    │─────▶│ Create Order  │─────▶│  Razorpay   │
│ Books Session      │ (Backend)     │      │   Checkout  │
└─────────────┘      └───────────────┘      └─────────────┘
       │                      │                      │
       │                      ▼                      │
       │            ┌───────────────┐              │
       │            │  Send Email   │              │
       │            │Payment Pending│              │
       │            └───────────────┘              │
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────┐      ┌───────────────┐      ┌─────────────┐
│  Payment    │◀─────│ Verify Payment│◀─────│   Success   │
│   Success   │      │   (Webhook)   │      │   Callback  │
└─────────────┘      └───────────────┘      └─────────────┘
       │                      │
       │                      ▼
       │            ┌───────────────┐
       │            │  Send Emails  │
       │            │ • Mentee: Confirmed
       │            │ • Mentor: Payment Received
       └───────────▶│ • Admin: Alert
                    └───────────────┘
```

---

## 4. API Endpoints

### Create Razorpay Order
```http
POST /api/payments/create-order
Content-Type: application/json

{
  "sessionId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 500,  // Amount in rupees
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxxxxxxxxx",
    "amount": 50000,  // Amount in paise
    "currency": "INR",
    "key": "rzp_test_xxxxxxxxxx",
    "paymentId": "64l1m2n3o4p5q6r7s8t9u0v1"
  }
}
```

### Verify Razorpay Payment
```http
POST /api/payments/verify-razorpay
Content-Type: application/json

{
  "razorpay_order_id": "order_xxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxx",
  "razorpay_signature": "xxxxxxxxxxxxxxxx"
}
```

### Create Stripe Session
```http
POST /api/payments/create-stripe-session
Content-Type: application/json

{
  "sessionId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "amount": 10,  // Amount in USD
  "currency": "usd"
}
```

---

## 5. Commission Structure

| Role | Share |
|------|-------|
| Pro-Mentor | 80% |
| Platform | 20% |

Example: ₹500 session
- Mentor earns: ₹400
- Platform fee: ₹100

---

## 6. Email Notifications

### 1. Payment Pending (Order Created)
- **To**: Mentee
- **When**: Order created, awaiting payment
- **Content**: Payment link, session details, amount

### 2. Payment Confirmed (Successful)
- **To**: Mentee
- **When**: Payment verified
- **Content**: Receipt, session confirmation, join link

### 3. Payment Received
- **To**: Pro-Mentor
- **When**: Payment verified
- **Content**: Earnings amount, session details

### 4. Admin Alert
- **To**: Admin
- **When**: Any payment event
- **Content**: Transaction details, user info

---

## 7. Frontend Integration

### React Component Example
```tsx
import { useState } from 'react';

export function PaymentButton({ sessionId, amount, mentorName }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    // 1. Create order
    const response = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, amount, currency: 'INR' })
    });
    
    const { data } = await response.json();
    
    // 2. Open Razorpay checkout
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.orderId,
      name: 'LetAsk',
      description: `Session with ${mentorName}`,
      handler: async (response) => {
        // 3. Verify payment
        await fetch('/api/payments/verify-razorpay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        
        alert('Payment successful!');
      }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  );
}
```

---

## 8. Webhook Setup (Production)

### Razorpay Webhook
1. Dashboard → Settings → Webhooks
2. Add URL: `https://yourdomain.com/api/payments/razorpay-webhook`
3. Select events: `payment.captured`, `order.paid`

### Stripe Webhook
1. Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe-webhook`
3. Select events: `checkout.session.completed`

---

## 9. Testing

### Razorpay Test Cards
| Card Number | Status |
|-------------|--------|
| 5267 3181 8797 5449 | Success |
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Failure |

### Stripe Test Cards
| Card Number | Status |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

---

## 10. Go Live Checklist

- [ ] Switch to Live Mode in Razorpay/Stripe
- [ ] Replace test keys with live keys
- [ ] Update webhook URLs to production
- [ ] Test with real small amount
- [ ] Set up payout method for mentors
- [ ] Configure tax/GST settings
- [ ] Add refund policy to terms

---

## Troubleshooting

### "Invalid API Key"
- Check `.env.local` has correct keys
- Restart server after changing env vars

### "Payment Failed"
- Use test cards only in test mode
- Check amount is in correct units (paise for INR)

### "Webhook Not Working"
- Ensure URL is publicly accessible (use ngrok for local testing)
- Check webhook secret is correct

---

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Stripe Docs: https://stripe.com/docs
- LetAsk Support: support@letask.in
