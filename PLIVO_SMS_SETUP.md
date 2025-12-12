# Twilio SMS Integration Setup Guide

## Overview
SMS notifications have been integrated modularly into the booking system. Customers and admin receive text confirmations when bookings are completed.

## Architecture
- **SMS Service Module**: `/lib/sms.service.js` - Twilio client and message formatting
- **Integration Point**: `api/booking-handler.js` - Calls SMS after email confirmation
- **Feature Flag**: `SMS_ENABLED` environment variable (can be enabled/disabled without code changes)

## Setup Steps

### 1. Get Twilio Credentials
1. Sign up at [twilio.com](https://www.twilio.com)
2. Navigate to Console → Account Info
3. Copy your **Account SID** and **Auth Token**
4. Go to Phone Numbers section and get your **From Number** (or buy a new one)

### 2. Add Environment Variables to Vercel
Go to Vercel Dashboard → Project Settings → Environment Variables and add:

```
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
ADMIN_PHONE=+1214XXXXXXX
```

### 3. Local Development (.env.local)
Add to `/Users/fttg/fttg_workspace/glamorbybee_modern/.env.local`:

```
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
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
git commit -m "feat: switch to Twilio SMS notifications"
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
TWILIO_FROM_NUMBER=+1234567890
ADMIN_PHONE=+1214XXXXXXX

# Run local server
npm run dev

# Submit booking form with valid test phone number
```

### Check logs:
```bash
# Should see:
✅ Twilio SMS service initialized
📱 Sending SMS to customer: +1234567890
✅ Customer SMS sent (Message SID: SM...)
📱 Sending SMS to admin: +1214XXXXXXX
✅ Admin SMS sent (Message SID: SM...)
```

## Troubleshooting

### "SMS service disabled: Missing Twilio credentials"
- Check all 3 Twilio env vars are set (ACCOUNT_SID, AUTH_TOKEN, FROM_NUMBER)
- Verify they're deployed to Vercel

### SMS not received
- Verify phone numbers are in correct format: `+1214XXXXXXX` (country code required)
- Check Twilio account has credits and trial period not expired
- Verify FROM_NUMBER is your actual Twilio phone number
- Check Twilio logs at console.twilio.com/logs

### SMS only to customer, not admin
- Check ADMIN_PHONE is set
- Verify phone number format includes country code

## Rollback (Remove SMS)

If you need to remove SMS entirely:
1. Set `SMS_ENABLED=false` in Vercel dashboard
2. Or delete/comment out SMS initialization in booking-handler.js
3. Keep `/lib/sms.service.js` for future use

## Cost Consideration

Twilio charges per SMS sent (typically $0.0075 per SMS). Consider:
- Each booking sends 2 SMS (customer + admin) = cost per booking
- Monitor SMS usage in Twilio Console
- Option to disable SMS during testing with feature flag
- Twilio free trial includes $15 credit

