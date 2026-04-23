# Google OAuth Setup - Quick Guide

## Current Error
```
[next-auth][error][OAUTH_CALLBACK_ERROR]
invalid_client (Unauthorized)
```

This means you need to add your **Google Client Secret** to the `.env` file.

## Step 1: Get Google Client Secret

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID: `576881716684-sl6fu1p2godms6gmql4c3q82n1ee4528`
3. Click on it to view details
4. You'll see **"Client secret"** - click the copy icon
5. Copy the secret (it looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`)

## Step 2: Add to .env File

Open `career-platform/.env` and replace this line:

```env
GOOGLE_CLIENT_SECRET="your-google-client-secret-here"
```

With your actual secret:

```env
GOOGLE_CLIENT_SECRET="GOCSPX-your-actual-secret"
```

## Step 3: Add Redirect URIs in Google Console

While you're in Google Cloud Console:

1. In the same OAuth client settings
2. Find **"Authorized redirect URIs"**
3. Click **"+ ADD URI"**
4. Add these two URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   ```
5. Click **"SAVE"**

## Step 4: Add JavaScript Origins

In the same settings:

1. Find **"Authorized JavaScript origins"**
2. Click **"+ ADD URI"**
3. Add:
   ```
   http://localhost:3000
   http://localhost:3001
   ```
4. Click **"SAVE"**

## Step 5: Wait & Test

1. Wait 2-3 minutes for Google to update
2. Restart your dev server
3. Go to `http://localhost:3000/signup`
4. Click "Sign up with Google"
5. It should work now!

## What Will Happen

After adding the secret and redirect URIs:

1. Click "Sign up with Google"
2. Google popup appears
3. Select your account
4. Grant permissions
5. **Redirected to home page** (not dashboard)
6. You'll see: "Welcome, [Your Name]!" with Dashboard and Sign Out buttons

## Troubleshooting

### Still getting "invalid_client"?
- Double-check the client secret is correct (no extra spaces)
- Make sure you saved the .env file
- Restart the dev server

### Getting "redirect_uri_mismatch"?
- Add both redirect URIs in Google Console
- Wait 2-3 minutes for changes to take effect
- Clear browser cache

### User not being created?
- Check database connection in .env
- Make sure DATABASE_URL is correct
- The app will still work for Google sign-in, but won't save to database

## Current Status

✅ Email/password registration - **WORKING**
✅ Email/password login - **WORKING**  
⚠️ Google Sign-In - **Needs client secret**
✅ Redirect to home page after login - **WORKING**
✅ User welcome message - **WORKING**
✅ Sign out - **WORKING**

Just add the Google Client Secret and you're done! 🚀
