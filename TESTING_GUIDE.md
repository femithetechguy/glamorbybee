# Local Testing Guide - GlamorByBee Nodemailer Integration

## Step 1: Configure SMTP Credentials

Edit `.env.local` in the project root and add your SMTP credentials:

```env
EMAIL_HOST=mail.glamorbybee.com        # Your SMTP server
EMAIL_PORT=465                         # 465 for SSL or 587 for TLS
EMAIL_USER=contact@glamorbybee.com     # Your email address
EMAIL_PASSWORD=your_password_here      # Your email password
EMAIL_SECURE=true                      # true for 465, false for 587
ADMIN_EMAIL=contact@glamorbybee.com    # Where admin notifications go
```

### Getting SMTP Credentials

**From Hostinger (or similar provider):**
1. Log in to your hosting account
2. Go to Email → Email Accounts → Select your email
3. Look for SMTP settings or "Email Client Settings"
4. Note down:
   - SMTP Server (e.g., mail.glamorbybee.com)
   - SMTP Port (usually 465 or 587)
   - Username (full email address)
   - Password

**Port Configuration:**
- Port 465: SSL (EMAIL_SECURE=true)
- Port 587: TLS (EMAIL_SECURE=false)

---

## Step 2: Start the Development Server

Run the server in watch mode (auto-restarts on file changes):

```bash
npm run dev
```

Or regular start:

```bash
npm start
```

Expected output:
```
🌟 GlamorByBee Server
📍 Running on http://localhost:3000
📧 Email service status: ✅ Ready
✨ Server is ready to receive bookings!
```

---

## Step 3: Test Health Check Endpoint

Verify the email service is connected:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "operational",
  "message": "Email service is operational"
}
```

---

## Step 4: Test Booking Submission

**Option A: Via Browser Form**

1. Open http://localhost:3000 in your browser
2. Fill out the booking form:
   - Name: Test User
   - Email: your-email@example.com
   - Phone: (555) 123-4567
   - Service: Select any service
   - Date: Any future date
   - Time: Any time
   - Location: Studio or Home
3. Click "Book Your Look"

**Option B: Via curl (Command Line)**

```bash
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com",
    "phone": "(555) 123-4567",
    "service_name": "Bridal",
    "date": "2025-12-25",
    "time": "2:00 PM",
    "location": "studio",
    "serviceAddress": "",
    "notes": "Test booking"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Your booking has been submitted successfully! We will get in touch with you shortly.",
  "reference": "GBB-1733961234567",
  "contact": {
    "email": "your-email@example.com",
    "phone": "(555) 123-4567"
  }
}
```

---

## Step 5: Check Your Emails

After submitting a booking, you should receive:

1. **Customer Email** (sent to the customer):
   - Booking confirmation with details
   - Reference number
   - Contact information

2. **Admin Email** (sent to ADMIN_EMAIL):
   - Full booking details
   - Customer contact info
   - Special requests
   - Action buttons

---

## Troubleshooting

### "Email service is not ready"

**Problem:** Server returns status 503 on /api/booking

**Solutions:**
1. Check .env.local has all required fields:
   ```bash
   cat .env.local | grep EMAIL_
   ```

2. Verify SMTP credentials are correct:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Check server logs for error messages during startup

---

### "Connection refused" Error

**Problem:** SMTP connection fails with "Connection refused"

**Solutions:**
- Verify EMAIL_HOST is correct (e.g., mail.glamorbybee.com)
- Verify EMAIL_PORT is correct (465 or 587)
- Check EMAIL_SECURE matches port:
  - Port 465 → EMAIL_SECURE=true
  - Port 587 → EMAIL_SECURE=false
- Try the other port (465 vs 587)

---

### "Invalid credentials" Error

**Problem:** SMTP authentication fails

**Solutions:**
- Verify EMAIL_USER is the full email address (e.g., contact@glamorbybee.com)
- Verify EMAIL_PASSWORD is correct (copy-paste carefully)
- If your email has 2FA enabled, use an app-specific password instead
- Check for leading/trailing spaces in credentials

---

### "Email not received"

**Problem:** Booking succeeds but no email arrives

**Solutions:**
- Check spam/junk folder
- Verify ADMIN_EMAIL is correct
- Check server logs for send errors:
  ```bash
  # Watch server output during booking submission
  npm run dev
  ```
- Verify the email template files exist:
  ```bash
  ls -la templates/
  ```

---

## File Structure Created

```
glamorbybee_modern/
├── server.js                    # Main Express server
├── package.json                 # Dependencies
├── .env.local                   # Your credentials (git-ignored)
├── .env.example                 # Template for credentials
├── lib/
│   └── email.service.js         # Nodemailer email handling
├── api/
│   └── booking.js               # Booking API logic
├── templates/
│   ├── customer-email.html      # Customer confirmation template
│   └── admin-email.html         # Admin notification template
└── [existing files...]
```

---

## Next Steps After Testing

1. ✅ Verify emails are sending correctly
2. ✅ Check email formatting and content
3. ✅ Test error handling (invalid emails, missing fields, etc.)
4. 🔧 (Optional) Add rate limiting to prevent spam
5. 🔧 (Optional) Add database logging of submissions
6. 🚀 Deploy to production (Vercel, Render, etc.)

---

## Quick Command Reference

```bash
# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Test health check
curl http://localhost:3000/api/health

# Test booking submission
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com",...}'
```

---

## Support & Resources

- **Nodemailer Docs:** https://nodemailer.com/
- **Express Docs:** https://expressjs.com/
- **Environment Variables:** .env.example shows all available options
- **Email Templates:** Customize customer-email.html and admin-email.html

Good luck! 🚀✨
