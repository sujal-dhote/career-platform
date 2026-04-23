# 📧 Email OTP Verification Setup Guide

## ✅ What's Implemented

Your Career Platform now has complete OTP-based email verification:

1. **User Signup** → OTP sent to email
2. **User enters OTP** → Email verified
3. **Auto-login** → Redirected to home page

## 🔧 Gmail Setup (Required)

To send OTP emails, you need to configure Gmail App Password:

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Career Platform**
5. Click **Generate**
6. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### Step 3: Update .env File

```env
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="xxxx xxxx xxxx xxxx"
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `xxxx xxxx xxxx xxxx` with the app password you generated

## 🚀 How It Works

### User Flow:

```
1. User visits /signup
   ↓
2. Fills: Name, Email, Password
   ↓
3. Clicks "Sign Up"
   ↓
4. Backend:
   - Validates input
   - Generates 6-digit OTP
   - Saves user (emailVerified: false)
   - Sends OTP email
   ↓
5. User redirected to /verify-email
   ↓
6. User enters 6-digit OTP
   ↓
7. Backend verifies OTP
   ↓
8. Email marked as verified
   ↓
9. Auto-login
   ↓
10. Redirected to home page
```

### OTP Email Features:

- ✅ Beautiful HTML email template
- ✅ 6-digit OTP code
- ✅ 10-minute expiry
- ✅ Professional design with branding
- ✅ Clear instructions

### Verification Page Features:

- ✅ 6 separate input boxes for OTP
- ✅ Auto-focus next input
- ✅ Backspace navigation
- ✅ Resend OTP button
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages
- ✅ Auto-login after verification

## 📁 New Files Created

1. **src/lib/email.ts** - Email service with OTP generation
2. **src/app/api/auth/verify-otp/route.ts** - OTP verification API
3. **src/app/api/auth/resend-otp/route.ts** - Resend OTP API
4. **src/app/verify-email/page.tsx** - OTP verification page

## 🗄️ Database Changes

Added to User model:
- `emailVerified` (Boolean) - Email verification status
- `verificationOTP` (String) - Current OTP code
- `otpExpiry` (DateTime) - OTP expiration time

## 🔒 Security Features

1. **OTP Expiry**: 10 minutes
2. **One-time use**: OTP deleted after verification
3. **Email verification required**: Can't login without verification
4. **Secure password hashing**: bcrypt with 12 rounds
5. **Email normalization**: Stored in lowercase

## 🎨 Email Template

The OTP email includes:
- Professional header with gradient
- User's name personalization
- Large, clear OTP display
- Expiry information
- Security notice
- Branded footer

## 🧪 Testing

### Test the Flow:

1. **Start server**:
   ```bash
   npm run dev
   ```

2. **Go to signup**:
   ```
   http://localhost:3000/signup
   ```

3. **Fill form**:
   - Name: Test User
   - Email: your-email@gmail.com
   - Password: test123
   - Confirm: test123

4. **Check email**:
   - Look for "Verify Your Email - Career Platform"
   - Copy the 6-digit OTP

5. **Enter OTP**:
   - You'll be redirected to /verify-email
   - Enter the 6 digits
   - Click "Verify Email"

6. **Success**:
   - Auto-logged in
   - Redirected to home page

### Test Resend OTP:

1. On verification page, click "Resend OTP"
2. New OTP sent to email
3. Old OTP becomes invalid

### Test Login Without Verification:

1. Try to login before verifying email
2. Error: "Please verify your email before logging in"

## 🌐 Google OAuth

Google sign-in users are **auto-verified** (no OTP needed) because:
- Google already verified their email
- `emailVerified` set to `true` automatically

## ⚠️ Important Notes

1. **Gmail App Password**: Regular Gmail password won't work, you MUST use App Password
2. **2FA Required**: You need 2-Factor Authentication enabled to generate App Password
3. **Email Limits**: Gmail has sending limits (500 emails/day for free accounts)
4. **Spam Folder**: First emails might go to spam, mark as "Not Spam"

## 🔄 Alternative Email Services

If you want to use other email services:

### SendGrid:
```bash
npm install @sendgrid/mail
```

### Mailgun:
```bash
npm install mailgun-js
```

### AWS SES:
```bash
npm install @aws-sdk/client-ses
```

Just update `src/lib/email.ts` with the new service configuration.

## 📊 API Endpoints

### 1. Register (Modified)
```
POST /api/auth/register
Body: { name, email, password }
Response: { message, userId, email }
```

### 2. Verify OTP
```
POST /api/auth/verify-otp
Body: { email, otp }
Response: { message, user }
```

### 3. Resend OTP
```
POST /api/auth/resend-otp
Body: { email }
Response: { message }
```

## 🎯 Next Steps

1. **Configure Gmail App Password** (see above)
2. **Update .env file** with your credentials
3. **Restart dev server**
4. **Test the signup flow**
5. **Check your email for OTP**

## 🐛 Troubleshooting

### Email not sending?
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify 2FA is enabled on Google account
- Confirm App Password is correct (16 characters)
- Check spam folder

### OTP expired?
- OTP valid for 10 minutes only
- Click "Resend OTP" to get new code

### Can't login?
- Make sure you verified your email first
- Check for error message
- Try resetting password (future feature)

## ✨ Features Summary

✅ OTP-based email verification
✅ Beautiful email template
✅ 6-digit OTP with 10-minute expiry
✅ Resend OTP functionality
✅ Auto-login after verification
✅ Email verification required for login
✅ Google OAuth auto-verified
✅ Professional UI/UX
✅ Error handling
✅ Security best practices

Your email verification system is production-ready! 🚀
