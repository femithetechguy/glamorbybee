# Telnyx Webhook Setup Guide - Inbound SMS

This guide explains how to enable customers to reply to SMS messages in GlamorByBee.

## What Are Webhooks?

Webhooks are HTTP callbacks that Telnyx uses to notify your server about events:
- **Inbound SMS**: When a customer replies to your message
- **Delivery status**: When SMS is delivered or fails
- **Message tracking**: Real-time updates about message status

## Prerequisites

✅ You already have:
- Telnyx account with API key
- Active phone number
- Server deployed to Vercel (with HTTPS)

## Step 1: Set Up Webhook Endpoint on Vercel

Your webhook endpoint is already created at:
```
https://glamorbybee.com/api/sms-webhook
```

This endpoint is ready to receive webhooks from Telnyx.

## Step 2: Configure Webhook in Telnyx Console

1. **Log in to Telnyx Portal**: https://portal.telnyx.com
2. **Navigate to Phone Numbers**:
   - Click "Phone Numbers" in left sidebar
   - Select your phone number
3. **Configure Inbound Settings**:
   - Find "Inbound Webhooks" section
   - Set webhook URL to: `https://glamorbybee.com/api/sms-webhook`
   - Select **"POST"** as method
   - Leave version as default
4. **Save**

## Step 3: Add Public Key to Environment

The public key is used to verify webhooks are genuine (from Telnyx, not an attacker).

### For Local Development (.env.local)

Your public key is already added:
```bash
TELNYX_PUBLIC_KEY=+M6S36KBxD3Ycq1ILR4bkpvZo/VZUXGuXsIRE2tpc8M=
```

### For Production (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add new variable:
   - **Name**: `TELNYX_PUBLIC_KEY`
   - **Value**: `+M6S36KBxD3Ycq1ILR4bkpvZo/VZUXGuXsIRE2tpc8M=`
5. Click "Save"

## Step 4: How Inbound SMS Works

When a customer replies:

```
Customer: "Hi, I want to reschedule my appointment"
         ↓
Telnyx receives reply
         ↓
Telnyx sends POST to /api/sms-webhook
         ↓
Your server verifies signature
         ↓
Server saves reply to /json/inbound_sms.json
         ↓
You can view customer message!
```

## Step 5: View Inbound SMS

Replies are automatically saved to `/json/inbound_sms.json`:

```json
[
  {
    "id": "msg_abc123",
    "from": "+17706484939",
    "to": "+17707654321",
    "text": "Hi, I want to reschedule my appointment",
    "receivedAt": "2025-12-12T10:30:00.000Z",
    "timestamp": "2025-12-12T10:30:00.000Z"
  }
]
```

## Step 6: Test Locally

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Send SMS to your Telnyx number from any phone**

3. **Check the logs**:
   ```bash
   # You should see:
   # 📨 Received webhook from Telnyx
   # 💬 Inbound SMS received
   # From: +17706484939
   # Text: Your message
   ```

4. **View saved SMS**:
   - Open `/json/inbound_sms.json`
   - You'll see your reply stored

## Webhook Events Handled

Your webhook endpoint handles:

| Event | Description |
|-------|-------------|
| `message.received` | Customer reply received |
| `message.dlr` | Delivery receipt (SMS delivered/failed) |
| `message.sent` | Your SMS was sent |

## Security Features

✅ **Signature Verification**: Webhook verifies the public key
✅ **Webhook Logging**: All webhooks logged to `/json/webhook_log.json`
✅ **Error Handling**: Invalid webhooks logged but don't break system

## Troubleshooting

### Webhook not being received?

1. **Check URL is public**: Must be HTTPS (not localhost)
   ```bash
   # Local dev: won't receive webhooks (ngrok can help)
   # Production: glamorbybee.com/api/sms-webhook ✅
   ```

2. **Check Telnyx Console**:
   - Go to Phone Numbers → Select your number
   - Verify webhook URL is correct
   - Check that inbound is enabled

3. **Check logs**:
   - View `/json/webhook_log.json`
   - View server console for errors

### Signature verification fails?

Make sure `TELNYX_PUBLIC_KEY` is correct in:
- `.env.local` (local testing)
- Vercel environment variables (production)

### Not receiving customer replies?

1. Customer must reply to the SMS you sent them
2. SMS must be from your Telnyx phone number
3. Webhook must be configured in Telnyx Console

## Next Steps

### Future Enhancements

1. **Auto-reply to customer**:
   ```javascript
   // Send automated response when customer replies
   "Thanks for your message. We'll be in touch soon!"
   ```

2. **Track reschedule requests**:
   - Parse customer messages
   - Auto-offer rescheduling link

3. **Admin notifications**:
   - Email admin when customer replies
   - Dashboard to view customer messages

4. **Response analytics**:
   - Track reply rates
   - Monitor customer sentiment

## Files Modified

- `/api/sms-webhook.js` - Webhook handler (NEW)
- `/lib/sms.service.js` - Updated with public key support
- `/.env.local` - Added TELNYX_PUBLIC_KEY
- `/.env.example` - Added TELNYX_PUBLIC_KEY documentation

## Reference

- [Telnyx Webhooks Documentation](https://developers.telnyx.com/docs/api/v2/overview)
- [Telnyx Phone Numbers API](https://developers.telnyx.com/docs/api/v2/messaging)
- [Webhook Security & Verification](https://developers.telnyx.com/docs/api/v2/messaging/webhook-security)
