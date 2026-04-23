# Authentication Setup Guide

## Overview
Your career platform now has complete authentication with:
- ✅ Login page with email/password
- ✅ Signup/Registration page
- ✅ Google Sign-In integration
- ✅ Protected dashboard routes
- ✅ Session management with NextAuth

## Setup Steps

### 1. Database Migration
Run the SQL migration in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-migration.sql`
4. Click "Run" to execute the migration

This will:
- Update the users table to support OAuth
- Create accounts, sessions, and verification_tokens tables
- Add necessary indexes

### 2. Google OAuth Configuration

#### Get Google Client Secret:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID: `576881716684-sl6fu1p2godms6gmql4c3q82n1ee4528.apps.googleusercontent.com`
5. Click on it to view details
6. Copy the "Client Secret"

#### Update .env file:
Replace `your-google-client-secret-here` in `.env` with your actual Google Client Secret:

```env
GOOGLE_CLIENT_SECRET="your-actual-secret-here"
```

#### Configure Authorized Redirect URIs:
In Google Cloud Console, add these redirect URIs:
- `http://localhost:3000/api/auth/callback/google` (for development)
- `https://yourdomain.com/api/auth/callback/google` (for production)

### 3. Generate NextAuth Secret
Generate a secure random string for NEXTAUTH_SECRET:

```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use this online: https://generate-secret.vercel.app/32
```

Update in `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

### 4. Update NEXTAUTH_URL for Production
When deploying to production, update:
```env
NEXTAUTH_URL="https://yourdomain.com"
```

## Pages Created

### 1. Login Page (`/login`)
- Email/password login
- Google Sign-In button
- Link to signup page
- Error handling
- Beautiful gradient UI

### 2. Signup Page (`/signup`)
- Full name, email, password fields
- Password confirmation
- Google Sign-In button
- Link to login page
- Form validation
- Auto-login after registration

### 3. Home Page Updates (`/`)
- Added navigation bar with Login/Signup buttons
- Updated CTAs to point to signup page

## API Routes Created

### 1. NextAuth API (`/api/auth/[...nextauth]`)
- Handles all authentication flows
- Google OAuth provider
- Credentials provider (email/password)
- JWT session strategy

### 2. Registration API (`/api/auth/register`)
- Creates new users
- Hashes passwords with bcrypt
- Validates input
- Checks for existing users

## Protected Routes

The `/dashboard` route is now protected by middleware. Users must be logged in to access it.

## Testing

### Test Email/Password Registration:
1. Go to `http://localhost:3000/signup`
2. Fill in the form
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to dashboard

### Test Email/Password Login:
1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Sign In"
4. Redirected to dashboard

### Test Google Sign-In:
1. Click "Sign in with Google" on login or signup page
2. Select your Google account
3. Grant permissions
4. Redirected to dashboard

## Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT-based sessions
- ✅ Protected routes with middleware
- ✅ CSRF protection (built into NextAuth)
- ✅ Secure session cookies
- ✅ Password validation (min 6 characters)
- ✅ Email uniqueness validation

## Troubleshooting

### "Invalid credentials" error:
- Check if user exists in database
- Verify password is correct
- Check database connection

### Google Sign-In not working:
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Check redirect URIs in Google Cloud Console
- Ensure you're using the correct Google account

### Database connection issues:
- Run the SQL migration in Supabase
- Check DATABASE_URL in .env
- Verify Supabase project is active

### Session not persisting:
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

## Next Steps

1. Run the database migration
2. Add your Google Client Secret to .env
3. Generate and add NEXTAUTH_SECRET
4. Test the authentication flow
5. Customize the UI to match your brand
6. Add email verification (optional)
7. Add password reset functionality (optional)
8. Add social login for other providers (optional)

## Files Modified/Created

### New Files:
- `src/app/login/page.tsx` - Login page
- `src/app/signup/page.tsx` - Signup/registration page
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `src/app/api/auth/register/route.ts` - Registration API
- `src/components/SessionProvider.tsx` - Session provider wrapper
- `src/middleware.ts` - Route protection middleware
- `src/types/next-auth.d.ts` - TypeScript types for NextAuth
- `database-migration.sql` - SQL migration script

### Modified Files:
- `src/app/layout.tsx` - Added SessionProvider
- `src/app/page.tsx` - Added login/signup buttons
- `.env` - Added Google OAuth credentials
- `prisma/schema.prisma` - Updated for OAuth support

## Support

If you encounter any issues, check:
1. All environment variables are set correctly
2. Database migration has been run
3. Google OAuth is configured properly
4. Development server is running on the correct port
