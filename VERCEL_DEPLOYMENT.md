# Vercel Deployment Configuration Guide

## Issue: Booking Stuck on Remote

Your booking works fine locally but appears to hang on the remote (Vercel) deployment. This is because **Vercel doesn't read `.env.local` files** - you must set environment variables in Vercel's dashboard.

## Solution: Add Environment Variables to Vercel

### Steps:

1. **Go to Vercel Dashboard**
   - Navigate to https://vercel.com/dashboard
   - Select your `glamorbybee` project

2. **Add Environment Variables**
   - Click "Settings" → "Environment Variables"
   - Add the following variables:

   ```
   EMAIL_HOST              = mail.glamorbybee.com
   EMAIL_PORT              = 465
   EMAIL_USER              = contact@glamorbybee.com
   EMAIL_PASSWORD          = [your actual password]
   EMAIL_SECURE            = true
   ADMIN_EMAIL             = contact@glamorbybee.com
   NODE_ENV                = production
   ```

3. **Important: Select All Environments**
   - For each variable, make sure it's set for:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

4. **Redeploy**
   - After adding variables, trigger a redeployment:
     ```bash
     git push origin your-branch
     ```
   - Or manually trigger in Vercel dashboard

### Verification

After deployment, test the booking:
1. Go to your remote URL (e.g., `https://glamorbybee.com`)
2. Fill out the booking form
3. Submit - it should process immediately
4. Check your email for confirmation

### Troubleshooting

If bookings still aren't working:

1. **Check Vercel logs:**
   ```bash
   # View Vercel logs
   vercel logs glamorbybee
   ```

2. **Test health check endpoint:**
   ```bash
   curl https://glamorbybee.com/api/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "email_service": "ready"
   }
   ```

3. **If health check fails:**
   - Email service didn't initialize
   - Double-check environment variables in Vercel
   - Verify SMTP credentials are correct
   - Check that EMAIL_PORT and EMAIL_SECURE match your provider's requirements

### Key Differences: Local vs Remote

| Aspect | Local | Remote (Vercel) |
|--------|-------|-----------------|
| Env Variables | Reads `.env.local` file | Uses Vercel dashboard settings |
| Cold Start | None | ~1s (serverless cold start) |
| Logs | Console output | Vercel logs dashboard |
| Background Jobs | Run indefinitely | Timeout after 25s (Pro) or 10s (Hobby) |

### Note on Async Email Processing

The API handler returns success immediately, then sends emails in the background. On Vercel's free tier, background jobs may timeout. If emails aren't being sent:

1. **Upgrade to Vercel Pro** for 25s timeout (vs 10s free)
2. **Or move email sending** to happen synchronously before responding

For now, test with the environment variables and monitor the results.
