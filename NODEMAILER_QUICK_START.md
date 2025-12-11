# GlamorByBee Nodemailer - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure SMTP
Edit `.env.local`:
```env
EMAIL_HOST=mail.glamorbybee.com
EMAIL_PORT=465
EMAIL_USER=contact@glamorbybee.com
EMAIL_PASSWORD=your_password
EMAIL_SECURE=true
ADMIN_EMAIL=contact@glamorbybee.com
PORT=3000
```

### 3. Start Server
```bash
npm run dev    # Development with file watch
npm start      # Production
```

### 4. Test It
Visit `http://localhost:3000` and submit a booking form!

---

## 📧 Email Flow

```
User Form → API (/api/booking) → Email Service → SMTP → Inbox
```

**Two emails sent automatically:**
1. Customer confirmation email
2. Admin notification email

---

## 🔧 How It Works

| Component | File | Purpose |
|-----------|------|---------|
| Server | `server.js` | Express app, API routes, static files |
| API Handler | `api/booking.js` | Validation, email orchestration |
| Email Service | `lib/email.service.js` | Nodemailer SMTP integration |
| Customer Email | `templates/customer-email.html` | Booking confirmation |
| Admin Email | `templates/admin-email.html` | Admin notification |
| Form Handler | `js/form-service.js` | Frontend form submission |

---

## 📁 Directory Structure

```
glamorbybee_modern/
├── server.js                  # Start here
├── api/booking.js             # Booking logic
├── lib/email.service.js       # Email sender
├── templates/                 # Email HTML
├── js/form-service.js         # Frontend
├── package.json               # Dependencies
├── .env.local                 # Your secrets (gitignored)
└── .env.example               # Template
```

---

## 🔑 Environment Variables

```
EMAIL_HOST        → SMTP server (mail.glamorbybee.com)
EMAIL_PORT        → 465 (SSL) or 587 (TLS)
EMAIL_USER        → Your email address
EMAIL_PASSWORD    → Email password
EMAIL_SECURE      → true (465) or false (587)
ADMIN_EMAIL       → Where admin notifications go
PORT              → Server port (default: 3000)
```

**Never commit `.env.local`** - it's already in `.gitignore`

---

## 🌐 API Endpoint

### POST `/api/booking`

Send booking data:
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
  "notes": "Please arrive early"
}
```

Response:
```json
{
  "success": true,
  "message": "Your booking has been submitted!",
  "reference": "GBB-1733937600000"
}
```

---

## ✅ Validation

Server validates:
- ✅ Name (required)
- ✅ Email (required, valid format)
- ✅ Phone (required, 7+ chars)
- ✅ Service (required)
- ✅ Date (required)
- ✅ Time (required)
- ✅ Location (studio or home)

---

## 📧 Email Templates

Located in `templates/` directory.

**Dynamic variables** (replaced automatically):
```
{{name}}            → Customer name
{{email}}           → Customer email
{{phone}}           → Customer phone
{{service}}         → Service booked
{{date}}            → Formatted date
{{time}}            → Time with timezone
{{visitType}}       → "Studio Visit" or "Home Service"
{{location}}        → Location details
{{specialRequests}} → Customer notes
{{reference}}       → Unique booking ID
{{year}}            → Current year
```

Edit templates to customize email design!

---

## 🔍 Health Check

Verify email service is working:
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

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check EMAIL_HOST, EMAIL_PORT, firewall |
| "Invalid credentials" | Verify EMAIL_USER (full email), EMAIL_PASSWORD |
| "Email not received" | Check spam folder, verify EMAIL_USER |
| Port errors | Port 465 = SSL (true), Port 587 = TLS (false) |
| "Service not ready" | Check .env.local, restart server |

---

## 📝 Server Logs

Watch console for status:
```
✅ Email service initialized
✓ FormService initialized
✉️ Form submitted
✅ Customer email sent: <id>
✅ Admin email sent: <id>
```

---

## 🚀 Getting SMTP Credentials

### Hostinger
1. Log in → Email → Email Accounts
2. Select email account
3. SMTP Settings:
   - Server: `mail.yourdomain.com`
   - Port: `465` or `587`
   - User: Full email address
   - Password: Email password

### Gmail
1. Enable 2-Step Verification
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use app password in EMAIL_PASSWORD

---

## 💡 Development Tips

**File Watch Mode:**
```bash
npm run dev
```
Auto-restarts server on file changes.

**Test Email Sending:**
```bash
curl -X POST http://localhost:3000/api/booking \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@example.com",...}'
```

**Check Email Service Health:**
Server logs show:
- Connection status
- SMTP verification
- Template loading
- Email sending results

---

## 🔒 Security

- ✅ `.env.local` is gitignored
- ✅ All inputs validated on server
- ✅ Email format verified
- ✅ Use app-specific passwords for 2FA
- ✅ Consider adding rate limiting for production

---

## 📊 What Was Changed

### Removed:
- ❌ EmailJS library
- ❌ EmailJS initialization
- ❌ EmailJS configuration

### Added:
- ✅ Express server
- ✅ Nodemailer integration
- ✅ Email templates
- ✅ Backend API
- ✅ Environment variables
- ✅ Booking API handler
- ✅ Email service module

### Updated:
- 📝 form-service.js (uses API instead of EmailJS)
- 📝 index.html (removed EmailJS script)
- 📝 package.json (added dependencies)

---

## 🎯 Next Steps

1. [✅] Install dependencies: `npm install`
2. [✅] Configure `.env.local` with your SMTP
3. [✅] Start server: `npm run dev`
4. [✅] Test booking form at localhost:3000
5. [✅] Verify emails arrive in inbox
6. [ ] (Optional) Add database logging
7. [ ] (Optional) Add rate limiting
8. [ ] (Optional) Deploy to production

---

## 📚 Documentation

- **Full Setup Guide**: `EMAIL_SETUP.md`
- **Nodemailer Docs**: https://nodemailer.com/
- **Express Docs**: https://expressjs.com/
- **Hosting Guides**: See EMAIL_SETUP.md

---

## 💬 Quick Help

**Server won't start?**
- Check `.env.local` file exists
- Verify all EMAIL_* variables filled
- Check port 3000 not already in use

**Emails not being sent?**
- Check ADMIN_EMAIL is correct
- Verify SMTP credentials
- Check spam folder
- Review server console logs

**Form not submitting?**
- Check server is running
- Verify API endpoint `/api/booking`
- Check browser console for errors
- Ensure form fields valid

---

## ✨ Architecture Benefits

- 🎯 **Reliable**: Direct SMTP connection
- 💰 **Cost-free**: No API fees
- 🔧 **Flexible**: Full control over emails
- 🎨 **Customizable**: Edit HTML templates
- 🔐 **Secure**: Credentials in .env
- 📈 **Scalable**: Modular design

Enjoy your new email system! ✨
