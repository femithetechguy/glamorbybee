# GlamorByBee Email Setup Guide - Nodemailer Implementation

## Overview

The GlamorByBee booking system now uses **Nodemailer** with SMTP for sending booking confirmation emails, replacing the previous EmailJS implementation. This provides better control, reliability, and cost-effectiveness.

## Architecture

```
Frontend Form (index.html)
    ↓
Form Service (js/form-service.js)
    ↓
POST /api/booking (Express Server)
    ↓
Booking API Handler (api/booking.js)
    ↓
Email Service (lib/email.service.js)
    ↓
Nodemailer + SMTP
    ↓
Your Email Provider (Hostinger, Gmail, etc.)
    ↓
Customer & Admin Inboxes
```

## File Structure

```
glamorbybee_modern/
├── server.js                      # Express server entry point
├── api/
│   └── booking.js                # Booking API handler
├── lib/
│   └── email.service.js           # Nodemailer email service
├── templates/
│   ├── customer-email.html        # Customer confirmation email
│   └── admin-email.html           # Admin notification email
├── js/
│   └── form-service.js            # Updated to use API instead of EmailJS
├── package.json                   # Node.js dependencies
├── .env.example                   # Environment variables template
└── .env.local                     # Local environment variables (gitignored)
```

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd /Users/fttg/fttg_workspace/glamorbybee_modern
npm install
```

This installs:
- **express**: Web framework
- **nodemailer**: Email sending
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **body-parser**: Request body parsing

### Step 2: Configure Environment Variables

1. Open `.env.local` in your editor
2. Fill in your SMTP credentials:

```env
EMAIL_HOST=mail.glamorbybee.com        # Your SMTP server (from email provider)
EMAIL_PORT=465                          # 465 (SSL) or 587 (TLS)
EMAIL_USER=contact@glamorbybee.com     # Your email address
EMAIL_PASSWORD=your_password_here       # Your email password

EMAIL_SECURE=true                       # true for port 465, false for port 587

ADMIN_EMAIL=contact@glamorbybee.com    # Where admin notifications go
PORT=3000                               # Server port
```

### Step 3: Get SMTP Credentials

For **Hostinger** (recommended):
1. Log in to Hostinger
2. Go to Email → Your Domain → Email Accounts
3. Select your email account
4. Find SMTP Settings:
   - Server: `mail.yourdomain.com`
   - Port: `465` or `587`
   - Username: Your full email address
   - Password: Your email password

For **Gmail**:
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use as `EMAIL_PASSWORD`

### Step 4: Start the Server

```bash
# Development with file watch
npm run dev

# Production
npm start
```

The server will:
- Start on `http://localhost:3000`
- Verify SMTP connection
- Log status to console

## How It Works

### 1. User Submits Booking Form
- Form validates all required fields
- Data is sent to `/api/booking` endpoint

### 2. API Validation
The booking handler validates:
- ✅ Name (required)
- ✅ Email (required, valid format)
- ✅ Phone (required, 7+ characters)
- ✅ Service (required, non-empty)
- ✅ Date (required)
- ✅ Time (required)
- ✅ Location type (studio or home)

### 3. Email Service Sends Two Emails

**Customer Email** (`customer-email.html`):
- Sent to: Customer's email
- Contains: Booking confirmation with all details
- Subject: "✨ Your Glam Session is Booked!"

**Admin Email** (`admin-email.html`):
- Sent to: ADMIN_EMAIL (contact@glamorbybee.com)
- Contains: Full booking details with customer info
- Subject: "📅 New Booking: [Customer Name]"

### 4. Success Response
Returns booking reference number and confirmation message

## Email Template Variables

Templates support automatic variable replacement using `{{variable}}` syntax:

**Supported Variables:**
- `{{name}}` - Customer name
- `{{email}}` - Customer email
- `{{phone}}` - Customer phone
- `{{service}}` - Service booked
- `{{date}}` - Formatted booking date
- `{{time}}` - Booking time with timezone
- `{{visitType}}` - "Studio Visit" or "Home Service"
- `{{location}}` - Service location details
- `{{specialRequests}}` - Customer notes
- `{{reference}}` - Unique booking reference number
- `{{submissionTime}}` - When submitted
- `{{year}}` - Current year

## API Endpoint

### POST `/api/booking`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-678-600-5287",
  "service_name": "Bridal Makeup",
  "date": "2025-12-25",
  "time": "2:00 PM",
  "location": "studio",
  "serviceAddress": "123 Main St",
  "notes": "Please arrive 15 minutes early"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your booking has been submitted successfully!",
  "reference": "GBB-1733937600000",
  "contact": {
    "email": "john@example.com",
    "phone": "+1-678-600-5287"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Email is required"
}
```

### GET `/api/health`

Health check endpoint to verify email service status:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "operational",
  "message": "Email service is operational"
}
```

## Testing

### Option 1: Using the Web Form
1. Navigate to `http://localhost:3000`
2. Fill out the booking form
3. Click "Book Your Look"
4. Check your email for confirmation

### Option 2: Using curl
```bash
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your.email@example.com",
    "phone": "+1-678-600-5287",
    "service_name": "Bridal Makeup",
    "date": "2025-12-25",
    "time": "2:00 PM",
    "location": "studio",
    "notes": "Test booking"
  }'
```

## Troubleshooting

### "Connection refused" Error
- **Cause**: SMTP server unreachable
- **Solution**: 
  - Verify EMAIL_HOST is correct
  - Check EMAIL_PORT (465 vs 587)
  - Ensure firewall allows SMTP connections

### "Invalid credentials" Error
- **Cause**: Wrong email or password
- **Solution**:
  - Double-check EMAIL_USER (use full email address)
  - Verify EMAIL_PASSWORD is correct
  - If using 2FA, use app-specific password instead

### "Email not received"
- **Cause**: Various delivery issues
- **Solution**:
  - Check spam/junk folder
  - Verify EMAIL_USER (sender address)
  - Check email provider logs
  - Ensure ADMIN_EMAIL is valid

### Port Connection Issues
- **Port 465**: Requires SSL (EMAIL_SECURE=true)
- **Port 587**: Requires TLS (EMAIL_SECURE=false)
- **Solution**: Try port 465 first, then 587 if it doesn't work

### "Email service is not ready"
- **Cause**: Server started but SMTP not initialized
- **Solution**:
  - Check .env.local file exists and is readable
  - Verify all EMAIL_* variables are set
  - Check server console for detailed errors
  - Restart the server

## Production Deployment

### For Vercel
1. Go to Project Settings → Environment Variables
2. Add all EMAIL_* variables
3. Ensure `.env.local` is in `.gitignore` (already is)
4. Deploy as usual

### For Other Platforms (Heroku, DigitalOcean, etc.)
1. Set environment variables in your platform's dashboard
2. Ensure NODE_ENV is set to 'production'
3. Deploy your code
4. Test email sending after deployment

### Important Security Notes
- ✅ Never commit `.env.local` - it's in `.gitignore`
- ✅ Use app-specific passwords for 2FA-enabled accounts
- ✅ Enable 2FA on your email account for extra security
- ✅ All form inputs are validated on the server
- ✅ Email format is verified before sending

## Customization

### Changing Email Templates

1. Edit `templates/customer-email.html` for customer emails
2. Edit `templates/admin-email.html` for admin notifications
3. Keep `{{variable}}` placeholders for dynamic content
4. Server automatically replaces them with actual values

Example template modification:
```html
<p>Dear {{name}},</p>
<p>Your booking for {{service}} on {{date}} at {{time}} is confirmed!</p>
```

### Adding Additional Recipients

Edit `lib/email.service.js`:
```javascript
// Send to multiple recipients
const mailOptions = {
    from: this.config.auth.user,
    to: `${customerEmail}, ${anotherEmail}`, // Multiple recipients
    cc: 'cc@example.com',
    bcc: 'bcc@example.com',
    subject: 'Your Booking',
    html: html
};
```

### Rate Limiting (Optional)

To prevent spam, add rate limiting to `server.js`:
```javascript
import rateLimit from 'express-rate-limit';

const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 requests per window
});

app.post('/api/booking', bookingLimiter, async (req, res) => {
    // ... handler code
});
```

## Monitoring

### Email Service Logs

The server logs important events:
```
✅ Email service initialized successfully
✓ FormService initialized
📧 Form submitted
🚀 Sending booking request to API...
✅ Booking submitted successfully
✅ Customer email sent: <message-id>
✅ Admin email sent: <message-id>
```

### Debugging

Enable detailed logging by checking server console. Errors will show:
- SMTP connection issues
- Template loading errors
- Invalid email addresses
- Form validation failures

## Next Steps

1. ✅ Environment variables configured
2. ✅ Dependencies installed
3. ✅ Server running
4. ✅ Test booking form
5. ✅ Verify emails are received
6. (Optional) Add database logging
7. (Optional) Add rate limiting
8. (Optional) Add webhook notifications

## Support & Resources

- **Nodemailer Documentation**: https://nodemailer.com/
- **Express Documentation**: https://expressjs.com/
- **Hostinger Email Setup**: https://support.hostinger.com/
- **Gmail App Passwords**: https://myaccount.google.com/apppasswords

## Migration from EmailJS

What changed:
- ✅ Removed EmailJS library from frontend
- ✅ Removed EmailJS initialization from HTML
- ✅ Updated form-service.js to use /api/booking endpoint
- ✅ Created modular email service with Nodemailer
- ✅ Added email templates for better design control
- ✅ All booking logic now on backend

Benefits:
- 🎯 Better reliability (direct SMTP)
- 💰 No API costs (self-hosted)
- 🔧 Full control over emails
- 📧 Professional email templates
- 🔐 Secure credential handling
- 🚀 Scalable architecture

## Quick Troubleshooting Checklist

- [ ] `.env.local` file exists with all variables filled in
- [ ] `npm install` completed successfully
- [ ] Server starts without errors (`npm run dev`)
- [ ] Can access `http://localhost:3000/api/health`
- [ ] Response shows email service status
- [ ] Can submit booking form without errors
- [ ] Emails received in inbox (check spam folder)
- [ ] Email template displays correctly

If issues persist, check the server console logs for specific error messages!
