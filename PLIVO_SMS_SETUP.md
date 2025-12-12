# Plivo SMS Integration Setup Guide

## Overview
SMS notifications have been integrated modularly into the booking system. Customers and admin receive text confirmations when bookings are completed.

## Architecture
- **SMS Service Module**: `/lib/sms.service.js` - Plivo client and message formatting
- **Integration Point**: `api/booking-handler.js` - Calls SMS after email confirmation
- **Feature Flag**: `SMS_ENABLED` environment variable (can be enabled/disabled without code changes)

## Setup Steps

### 1. Get Plivo Credentials
1. Sign up at [plivo.com](https://plivo.com)
2. Navigate to Dashboard → Phone Numbers
3. Get your **Auth ID** and **Auth Token**
4. Get your **From Number** (Plivo phone number for sending SMS)

### 2. Add Environment Variables to Vercel
Go to Vercel Dashboard → Project Settings → Environment Variables and add:

```
SMS_ENABLED=true
PLIVO_AUTH_ID=your_auth_id_here
PLIVO_AUTH_TOKEN=your_auth_token_here
PLIVO_FROM_NUMBER=+1234567890    (Your Plivo phone number)
ADMIN_PHONE=+1214XXXXXXX         (Your phone number for notifications)
```

### 3. Local Development (.env.local)
Add to `/Users/fttg/fttg_workspace/glamorbybee_modern/.env.local`:

```
SMS_ENABLED=true
PLIVO_AUTH_ID=your_auth_id_here
PLIVO_AUTH_TOKEN=your_auth_token_here
PLIVO_FROM_NUMBER=+1234567890
ADMIN_PHONE=+1214XXXXXXX
```

### 4. Test Locally
```bash
npm run dev
```
Then submit a booking form. Check logs for SMS confirmation.

### 5. Deploy to Vercel
```bash
git add .
git commit -m "feat: add Plivo SMS notifications"
git push origin phone_service_for_notification
```

## SMS Message Format

### Customer SMS
```
Hi {Name}! Your GlamorByBee booking is confirmed for {Date} at {Time}. Service: {Service}. We'll see you soon! 💄
```

### Admin SMS  
```
📅 NEW BOOKING: {Name} | {Service} | {Date} {Time} | {Location} | Phone: {Phone}
```

## Feature Flag - Enable/Disable SMS

SMS is controlled by `SMS_ENABLED` environment variable:
- Set to `true` to enable
- Set to `false` or omit to disable
- Can toggle without code changes

### Disable SMS temporarily:
```bash
# In Vercel dashboard or local .env.local:
SMS_ENABLED=false
```

### Enable SMS:
```bash
SMS_ENABLED=true
```

## How It Works

1. **Booking submitted** → Validation occurs
2. **Email sent** → Customer & admin receive confirmation emails
3. **SMS sent** (parallel) → If SMS_ENABLED=true, customer & admin receive SMS
4. **Response sent** → Client receives success message

## Non-Breaking Design

- **Email remains primary** - SMS is supplementary
- **SMS failures don't break booking** - If SMS fails, booking still succeeds
- **Gradual rollout** - SMS can be disabled while testing
- **Service isolation** - SMS service is completely separate module

## Testing

### Test SMS locally:
```bash
# Add test numbers to .env.local
PLIVO_FROM_NUMBER=+1234567890
ADMIN_PHONE=+1214XXXXXXX

# Run local server
npm run dev

# Submit booking form with valid test phone number
```

### Check logs:
```bash
# Should see:
✅ Plivo SMS service initialized
📱 Sending SMS to customer: +1234567890
✅ Customer SMS sent (Message ID: xxx)
📱 Sending SMS to admin: +1214XXXXXXX
✅ Admin SMS sent (Message ID: xxx)
```

## Troubleshooting

### "SMS service disabled: Missing Plivo credentials"
- Check all 3 Plivo env vars are set (AUTH_ID, AUTH_TOKEN, FROM_NUMBER)
- Verify they're deployed to Vercel

### SMS not received
- Verify phone numbers are in correct format: `+1214XXXXXXX`
- Check Plivo account has credits
- Verify FROM_NUMBER is your actual Plivo phone number
- Check Plivo logs at plivo.com/logs

### SMS only to customer, not admin
- Check ADMIN_PHONE is set
- Verify phone number format

## Rollback (Remove SMS)

If you need to remove SMS entirely:
1. Set `SMS_ENABLED=false` in Vercel dashboard
2. Or delete/comment out SMS initialization in booking-handler.js
3. Keep `/lib/sms.service.js` for future use

## Cost Consideration

Plivo charges per SMS sent. Consider:
- Each booking sends 2 SMS (customer + admin) = cost per booking
- Monitor SMS usage in Plivo dashboard
- Option to disable SMS during testing with feature flag
