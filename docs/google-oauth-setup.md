# Google OAuth Implementation

## Overview
Google Sign-In authentication with Convex Auth, plus a Profile tab with logout functionality.

## Files Created
- `app/auth/callback.tsx` - OAuth callback handler that cleans URL params and redirects to home
- `src/components/google-sign-in-button.tsx` - Reusable Google sign-in button
- `src/components/auth-divider.tsx` - "OR" divider between auth methods
- `src/screens/profile-screen.tsx` - Profile screen with logout and dark mode toggle
- `app/(tabs)/profile.tsx` - Profile tab route

## Files Modified
- `convex/auth.ts` - Added Google provider from `@auth/core/providers/google`
- `src/hooks/use-auth.ts` - Added `signInWithGoogle` method
- `src/screens/auth/login-screen.tsx` - Added Google sign-in button
- `src/screens/auth/register-screen.tsx` - Added Google sign-in button
- `app/(tabs)/_layout.tsx` - Added Profile tab to navigation
- `src/providers/convex-provider.tsx` - Configured localStorage for web OAuth

## Convex Environment Variables
```bash
npx convex env set AUTH_GOOGLE_ID <your-google-client-id>
npx convex env set AUTH_GOOGLE_SECRET <your-google-client-secret>
npx convex env set SITE_URL "http://localhost:8081/auth/callback"
```

## Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Set **Authorized redirect URI**: `https://uncommon-turtle-66.convex.site/api/auth/callback/google`

## OAuth Flow
1. User clicks "Sign in with Google"
2. Redirects to Google → Convex backend processes OAuth
3. Convex redirects to `SITE_URL` (`/auth/callback?code=...`)
4. Callback route waits for authentication, cleans URL, redirects to `/`

## Key Issue Solved
The OAuth `?code=` query parameter was persisting in the URL after authentication. On page refresh, Convex Auth would try to re-process the stale code, which invalidated the session (OAuth codes are single-use).

**Solution**: Created a dedicated `/auth/callback` route that:
- Receives the OAuth callback with query params
- Waits for Convex Auth to process the code
- Cleans the URL using `history.replaceState`
- Redirects to home with a clean URL

## Production Deployment
Update `SITE_URL` to your production callback URL:
```bash
npx convex env set SITE_URL "https://yourdomain.com/auth/callback"
```

## Dependencies
- `expo-web-browser` - For native OAuth flow (dynamically imported only on native)
- `@auth/core` - Already installed, provides Google provider

## Testing
OAuth does NOT work in Expo Go on native. For mobile testing:
```bash
npx expo run:android
# or
npx expo run:ios
```

Web testing works with `npm run web`.
