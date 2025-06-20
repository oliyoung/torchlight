# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth authentication with Supabase for the torchlight project.

## Prerequisites

- A Google Cloud Platform account
- Access to your Supabase project dashboard
- Local development environment set up

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity and Access Management (IAM) API"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - For local development: `http://localhost:54321/auth/v1/callback`
     - For production: `https://your-supabase-project.supabase.co/auth/v1/callback`

4. **Get your credentials**
   - Copy the Client ID and Client Secret
   - You'll need these for your environment variables

## Step 2: Configure Supabase

The Google OAuth provider is already configured in `supabase/config.toml`. The configuration includes:

```toml
[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
redirect_uri = ""
skip_nonce_check = true
```

## Step 3: Set Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 4: Update Supabase Project (Production)

For your production Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider
4. Add your Google Client ID and Client Secret
5. Set the redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

## Step 5: Test the Implementation

1. **Start your local development server**
   ```bash
   npm run dev
   ```

2. **Start Supabase locally**
   ```bash
   supabase start
   ```

3. **Visit the login page**
   - Go to `http://localhost:3000/login`
   - You should see a "Continue with Google" button

4. **Test Google OAuth flow**
   - Click the Google sign-in button
   - You should be redirected to Google for authentication
   - After successful authentication, you'll be redirected back to your app

## Implementation Details

### Auth Context Updates

The authentication context (`lib/auth/context.tsx`) now includes:

- `signInWithGoogle()` method for initiating OAuth flow
- Proper session handling for OAuth callbacks
- Error handling for OAuth failures

### Login Page Updates

The login page (`app/(auth)/login/page.tsx`) now features:

- Modern UI with Shadcn components
- Google sign-in button with proper styling
- Visual separator between OAuth and email/password options
- Loading states for both OAuth and traditional auth
- Error handling for OAuth callback failures

### Auth Callback Handler

A new callback page (`app/(auth)/auth/callback/page.tsx`) handles:

- OAuth redirect processing
- Session token storage
- Error handling and user feedback
- Automatic redirection to the main app

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure your redirect URIs in Google Cloud Console match exactly
   - Check both local and production URLs

2. **"invalid_client" error**
   - Verify your Client ID and Client Secret are correct
   - Make sure the Google+ API is enabled

3. **OAuth callback fails**
   - Check browser console for errors
   - Verify environment variables are loaded correctly
   - Ensure Supabase is running locally

### Debug Steps

1. **Check environment variables**
   ```bash
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

2. **Verify Supabase configuration**
   - Check `supabase/config.toml` for correct settings
   - Ensure local Supabase is running on correct ports

3. **Test OAuth flow manually**
   - Use browser developer tools to inspect network requests
   - Check for any console errors during the OAuth flow

## Security Considerations

- Never commit your Google Client Secret to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
- Implement proper error handling to avoid exposing sensitive information

## Next Steps

After successful Google OAuth setup:

1. Test with multiple Google accounts
2. Implement user profile synchronization if needed
3. Add additional OAuth providers (GitHub, Apple, etc.)
4. Set up proper user role management
5. Configure production environment variables

## Support

If you encounter issues:

1. Check the [Supabase Auth documentation](https://supabase.com/docs/guides/auth)
2. Review [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the project's GitHub issues for similar problems