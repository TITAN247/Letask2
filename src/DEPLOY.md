# Deploy LetAsk to Render

## Prerequisites

1. Create a [Render](https://render.com) account
2. Create a [MongoDB Atlas](https://mongodb.com) cluster
3. Have your environment variables ready

## Step-by-Step Deployment

### 1. Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the repository containing your LetAsk project

### 2. Configure Build Settings

- **Name**: `letask` (or your preferred name)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Standard` (or Free for testing)

### 3. Required Environment Variables

Add these in Render Dashboard → Environment:

| Variable | Value | Example |
|----------|-------|---------|
| `NODE_ENV` | `production` | production |
| `MONGODB_URI` | Your MongoDB connection string | mongodb+srv://... |
| `JWT_SECRET` | Random secure string | your-secret-key |
| `NEXTAUTH_SECRET` | Random secure string | your-nextauth-secret |
| `NEXTAUTH_URL` | Your app URL | https://letask.onrender.com |
| `NEXT_PUBLIC_APP_URL` | Your app URL | https://letask.onrender.com |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ... |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | ... |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ... |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ... |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | ... |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | ... |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | ... |
| `EMAIL_USER` | SMTP email | ... |
| `EMAIL_PASS` | SMTP password | ... |
| `AGORA_APP_ID` | Agora App ID | ... |

### 4. Update Google OAuth Redirect URIs

In Google Cloud Console, add these redirect URIs:
- `https://your-app.onrender.com/api/auth/callback/google`
- `https://your-app.onrender.com/auth/redirect`

### 5. Deploy

Click **Create Web Service** and wait for the build to complete.

## Post-Deployment

### Health Check
Visit: `https://your-app.onrender.com/health`
Should return: `{"status":"ok","timestamp":"..."}`

### Common Issues

**Build fails:**
- Check Node version is >= 20.0.0
- Ensure all dependencies are in package.json

**MongoDB connection fails:**
- Verify MONGODB_URI is correct
- Add your Render IP to MongoDB Atlas whitelist

**Static files not loading:**
- Check `output: 'standalone'` is in next.config.ts

## Files Added for Deployment

- `render.yaml` - Render Blueprint configuration
- `DEPLOY.md` - This guide

## Support

For issues, check Render logs in Dashboard → Logs.

