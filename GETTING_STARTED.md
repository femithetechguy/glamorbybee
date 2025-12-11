# 🚀 GlamorByBee Nodemailer Migration - Complete Guide

## Overview

You've successfully migrated from EmailJS to Nodemailer! This guide helps you get everything running.

---

## 📦 What You Have Now

### Backend Stack
- **Express.js**: Web framework
- **Nodemailer**: Email sending via SMTP
- **Node.js**: Runtime environment

### Architecture
```
User Form → Express Server → Nodemailer → Your SMTP → Email Inbox
```

### Files Created
```
server.js                    Express server
api/booking.js              Booking API handler
lib/email.service.js        Email service (reusable)
templates/customer-email.html   Customer email
templates/admin-email.html      Admin email
package.json               Dependencies
.env.example               Config template
.env.local                 Your config (secret)
```

---

## 🎯 Quick Setup (3 Steps)

### Step 1: Configure SMTP Credentials
Edit `.env.local`:
```env
EMAIL_HOST=mail.glamorbybee.com
EMAIL_PORT=465
EMAIL_USER=contact@glamorbybee.com
EMAIL_PASSWORD=YOUR_PASSWORD_HERE
EMAIL_SECURE=true
ADMIN_EMAIL=contact@glamorbybee.com
PORT=3000
```

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Test It
1. Visit `http://localhost:3000`
2. Submit booking form
3. Check your email!

---

## 🔑 Getting SMTP Credentials

### From Hostinger
1. Log in to Hostinger
2. Email → Your Domain → Email Accounts
3. Select your email account
4. Look for SMTP Settings:
   - **Server**: `mail.yourdomain.com`
   - **Port**: `465` (SSL) or `587` (TLS)
   - **Username**: Your full email address
   - **Password**: Your email password

### From Gmail
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `.env.local`

### From Other Providers
Check your email provider's SMTP settings page.

---

## 📧 How Emails Work

When someone submits a booking:

1. **Frontend** sends data to server
2. **Server** validates the booking
3. **Email Service** loads templates
4. **Templates** replace {{variables}} with real data
5. **Nodemailer** connects to your SMTP
6. **Both emails** sent simultaneously:
   - **Customer email**: Booking confirmation
   - **Admin email**: New booking notification

---

## 🛠️ Understanding the Code

### email.service.js (Core)
Modular email service that:
- Manages SMTP connection
- Loads HTML templates
- Replaces template variables
- Sends customer and admin emails
- Provides health checks

### booking.js (API Handler)
API endpoint that:
- Validates all form fields
- Formats date and time
- Calls email service
- Returns booking reference

### server.js (Express Server)
Web server that:
- Serves your landing page
- Handles `/api/booking` requests
- Provides `/api/health` status
- Manages CORS and middleware

### form-service.js (Updated)
Frontend handler that:
- Validates form before submit
- Calls `/api/booking` API
- Shows success/error messages
- No longer depends on EmailJS

---

## 📧 Email Templates

### Variables You Can Use

In `templates/customer-email.html` or `templates/admin-email.html`:

```html
<p>Hello {{name}},</p>
<p>Your {{service}} booking is confirmed for {{date}} at {{time}}.</p>
<p>Reference: {{reference}}</p>
```

**All Available Variables:**
- `{{name}}` - Customer name
- `{{email}}` - Customer email
- `{{phone}}` - Customer phone
- `{{service}}` - Service booked
- `{{date}}` - Formatted date
- `{{time}}` - Time with timezone
- `{{visitType}}` - Studio or Home Service
- `{{location}}` - Location details
- `{{specialRequests}}` - Notes
- `{{reference}}` - Unique booking ID
- `{{submissionTime}}` - When submitted
- `{{year}}` - Current year

---

## 🔌 API Reference

### POST /api/booking
Submit a booking.

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
  "notes": "Please arrive early"
}
```

**Response (Success):**
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

**Response (Error):**
```json
{
  "success": false,
  "error": "Email is required"
}
```

### GET /api/health
Check if email service is working.

**Response:**
```json
{
  "status": "operational",
  "message": "Email service is operational"
}
```

---

## ✅ Validation Rules

The API validates every booking:
- ✅ Name is required
- ✅ Email is required and valid
- ✅ Phone is required (7+ characters)
- ✅ Service is required
- ✅ Date is required
- ✅ Time is required
- ✅ Location is required (studio or home)

---

## 🧪 Testing Guide

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```
Should show: `"status": "operational"`

### 2. Test with curl
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
    "location": "studio"
  }'
```

### 3. Test with Web Form
1. Start server: `npm run dev`
2. Visit: `http://localhost:3000`
3. Fill out form
4. Click "Book Your Look"
5. Check your email!

---

## 🐛 Troubleshooting

### Server Won't Start
```
❌ Error: connect ECONNREFUSED
```
**Fix**: Check EMAIL_HOST and EMAIL_PORT in .env.local

### "Invalid credentials" Error
**Fix**: Verify:
- EMAIL_USER is full email address
- EMAIL_PASSWORD is correct
- Check for spaces in .env.local

### Email Not Received
**Fix**:
- Check spam/junk folder
- Verify ADMIN_EMAIL is correct
- Try different port (465 vs 587)
- Check firewall allows SMTP

### "Service not ready" Response
**Fix**:
- Check .env.local file exists
- All EMAIL_* variables filled in
- Server console shows error details
- Restart the server

### Port 3000 Already in Use
**Fix**: Change PORT in .env.local:
```env
PORT=3001
```

---

## 🚀 Production Deployment

### For Vercel
1. Project Settings → Environment Variables
2. Add all EMAIL_* variables
3. Deploy as usual

### For Heroku
1. `heroku config:set EMAIL_HOST=...`
2. `heroku config:set EMAIL_PORT=...`
3. (repeat for all variables)
4. Deploy

### For Other Platforms
1. Set environment variables in dashboard
2. Deploy code
3. Test email sending

---

## 🔐 Security Best Practices

✅ **Do This:**
- Keep `.env.local` private (it's gitignored)
- Use app-specific passwords for 2FA
- Enable 2FA on email account
- Monitor email sending logs

❌ **Don't Do This:**
- Don't commit `.env.local`
- Don't hardcode credentials
- Don't share EMAIL_PASSWORD
- Don't expose EMAIL_USER publicly

---

## 📊 Monitoring

### Check Server Logs
When you run `npm run dev`, watch for:
```
✅ Email service initialized successfully
✓ FormService initialized
📧 Form submitted
✅ Customer email sent: <id>
✅ Admin email sent: <id>
```

### Check Email Delivery
1. Submit test booking
2. Check customer email inbox
3. Check admin email inbox
4. Verify formatting looks good
5. Click links to verify they work

---

## 🔄 Customization

### Change Email Templates
Edit `templates/customer-email.html` or `templates/admin-email.html`:
- Keep `{{variable}}` syntax
- Add your branding
- Customize colors
- Add/remove sections

### Add More Email Types
In `lib/email.service.js`:
```javascript
async sendWelcomeEmail(customerEmail) {
    const template = await this.getTemplate('welcome');
    // ... send email
}
```

### Modify Validation Rules
In `api/booking.js`:
```javascript
if (!data.customField) {
    errors.push('Custom field is required');
}
```

---

## 📚 Documentation Files

1. **EMAIL_SETUP.md** - Comprehensive setup guide
2. **NODEMAILER_QUICK_START.md** - Quick reference
3. **IMPLEMENTATION_SUMMARY.md** - Technical overview
4. **IMPLEMENTATION_CHECKLIST.md** - Feature checklist
5. **THIS FILE** - Quick start guide

---

## 💡 Tips & Tricks

### Development Tips
```bash
# Watch mode (auto-restart on changes)
npm run dev

# Check for dependency updates
npm outdated

# Update all packages
npm update
```

### Debugging Tips
- Check `.env.local` is in correct directory
- Verify no trailing spaces in variables
- Try simpler test data first
- Check email provider's SMTP settings
- Look at server console for detailed errors

### Email Tips
- Gmail: Use app-specific password
- Hostinger: Verify sender email
- Other: Check provider's documentation
- Test health endpoint first: `/api/health`

---

## 🆘 Need Help?

### Check These First
1. `.env.local` has all variables
2. `npm install` completed
3. Server starts: `npm run dev`
4. Health check works: `/api/health`
5. Server logs show no errors

### Review Documentation
- **Setup Issues**: EMAIL_SETUP.md
- **Quick Reference**: NODEMAILER_QUICK_START.md
- **Architecture**: IMPLEMENTATION_SUMMARY.md
- **Features**: IMPLEMENTATION_CHECKLIST.md

### External Resources
- Nodemailer: https://nodemailer.com/
- Express: https://expressjs.com/
- Email Provider Docs: Check their site

---

## ✨ What's Different from EmailJS

### EmailJS (Old)
- Frontend library
- JavaScript SDK
- Limited customization
- Potential API limits
- Third-party service

### Nodemailer (New)
- Backend server
- Direct SMTP
- Full control
- Unlimited sends
- Self-hosted

**Benefits:**
- More reliable
- No API costs
- Better templates
- More scalable
- Full privacy

---

## 🎯 Success Checklist

When everything is working:
- [x] Server starts without errors
- [x] Form displays correctly
- [x] Form submits without errors
- [ ] Customer email received
- [ ] Admin email received
- [ ] Emails look good
- [ ] Booking reference shows
- [ ] Links in emails work
- [ ] Mobile form works
- [ ] No console errors

---

## 📈 Next Steps

### Immediate
1. Fill `.env.local` with SMTP credentials
2. Run `npm run dev`
3. Test booking submission
4. Verify emails received

### Soon
1. Deploy to production server
2. Set production environment variables
3. Test in production
4. Monitor email delivery

### Future
1. Add database for bookings
2. Create admin dashboard
3. Add email scheduling
4. Implement rate limiting
5. Add email templates management

---

## 🎉 You're Ready!

Everything is set up and ready to go. Just fill in your SMTP credentials and start the server!

```bash
# 1. Configure .env.local (fill in EMAIL_PASSWORD, etc)

# 2. Start the server
npm run dev

# 3. Test it
# Visit http://localhost:3000 and submit a booking!

# 4. Check your email!
```

**Questions?** Check the documentation files included!

Happy booking! ✨
