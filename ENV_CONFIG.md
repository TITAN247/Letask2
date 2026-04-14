# Environment Configuration Guide

## Required Environment Variables

Create `.env.local` file with these variables:

### 1. MongoDB Atlas (Required)
```env
# MongoDB Atlas Connection String
# Get this from: https://cloud.mongodb.com → Connect → Drivers → Node.js
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/letask?retryWrites=true&w=majority

# Optional: Local MongoDB for development
MONGODB_URI_LOCAL=mongodb://localhost:27017/letask
```

### 2. Next.js (Required)
```env
# Next.js secret for JWT signing
NEXTAUTH_SECRET=your_random_secret_key_here

# Base URL of your application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Admin Setup Key (Required for first setup)
```env
# Used to secure admin creation endpoints
ADMIN_SETUP_KEY=letask-setup-2024
```

### 4. Email SMTP (Required for email features)
```env
# Gmail SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=LetAsk Platform
```

### 5. Payment Gateway (Required for payments)
```env
# Razorpay (for INR payments)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Stripe (for international USD payments)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

### 6. Google OAuth (Optional - for social login)
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 7. Cloud Storage (Optional - for file uploads)
```env
# AWS S3 or Cloudinary for document storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=letask-documents

# Or Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 8. AI/ML Services (Optional)
```env
# OpenAI for AI recommendations
OPENAI_API_KEY=sk-xxxxxxxxxx

# For recommendation engine
RECOMMENDATION_API_URL=https://api.recommendation-service.com
```

## How to Get These Values

### MongoDB Atlas
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create cluster (M0 free tier)
3. Database Access → Add New User
4. Network Access → Add IP Address
5. Clusters → Connect → Copy connection string

### Gmail App Password
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. App passwords → Generate
4. Select "Mail" and your device
5. Copy the 16-character password

### Razorpay Test Keys
1. Sign up at https://razorpay.com
2. Dashboard → Settings → API Keys
3. Switch to Test Mode
4. Copy Key ID and Secret

### Google OAuth
1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

## Development vs Production

### Development (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/letask
```

### Production (.env.local on server)
```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/letask
```

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Use strong passwords for all services
- [ ] Rotate API keys regularly
- [ ] Use separate keys for dev/staging/prod
- [ ] Enable IP whitelisting in Atlas
- [ ] Use App Passwords for email (not real password)
- [ ] Enable 2FA on all accounts

## Verification

After setting up, verify with:

```bash
# Check database connection
npm run dev
# Visit: http://localhost:3000/api/admin/db-setup

# Check email sending
# Sign up a test user - should receive verification email

# Check payments
# Try booking a session - should redirect to payment gateway
```

## Troubleshooting

### MongoDB Connection Fails
- Check IP whitelist in Atlas
- Verify password in connection string (URL encode special chars)
- Ensure cluster is running (not paused)

### Email Not Sending
- Use App Password, not regular Gmail password
- Enable "Less secure app access" if not using App Password
- Check SMTP settings match your provider

### Payment Fails
- Use Test Mode keys for development
- Verify callback URLs are configured
- Check webhook endpoint is accessible
