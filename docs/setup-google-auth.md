# Google OAuth Setup

Current Google Sign-In implementation using `expo-web-browser` with Convex Auth.

## Overview

Google Sign-In authentication with Convex Auth, plus a Profile tab with logout functionality.

## Files Created

- `app/auth/callback.tsx` - OAuth callback handler that cleans URL params and redirects to home
- `src/components/google-sign-in-button.tsx` - Reusable Google sign-in button
- `src/components/auth-divider.tsx` - "OR" divider between auth methods
- `src/screens/profile-screen.tsx` - Profile screen with logout and dark mode toggle
- `app/(tabs)/profile.tsx` - Profile tab route

## Files Modified

- `convex/auth.ts` - Convex Auth is configured with the built-in Google OAuth provider (via environment variables)
- `src/hooks/use-auth.ts` - Added `signInWithGoogle` method
- `src/screens/auth/login-screen.tsx` - Added Google sign-in button
- `src/screens/auth/register-screen.tsx` - Added Google sign-in button
- `app/(tabs)/_layout.tsx` - Added Profile tab to navigation
- `src/providers/convex-provider.tsx` - Configured localStorage for web OAuth

## Convex Environment Variables

```bash
npx convex env set AUTH_GOOGLE_ID <your-google-client-id>
npx convex env set AUTH_GOOGLE_SECRET <your-google-client-secret>
npx convex env set CONVEX_SITE_URL "https://your-project-name.convex.site"
```

For local web development, also set:

```bash
npx convex env set CONVEX_SITE_URL "http://localhost:8081"
```

> The app uses `CONVEX_SITE_URL`, not `SITE_URL`.

## Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Set **Authorized redirect URI**: `https://<your-project>.convex.site/api/auth/callback/google`

## OAuth Flow

1. User clicks "Sign in with Google"
2. `useAuth` calls Convex Auth's `signIn('google')`, which returns a redirect URL
3. Web: browser navigates to the Google OAuth flow and returns to `/auth/callback`
4. Native: `expo-web-browser` opens the OAuth flow; the callback URL uses the app scheme (`trading-journal://auth/callback`)
5. The `app/auth/callback.tsx` route waits for authentication, cleans the URL, and redirects to home

## Key Issue Solved

The OAuth `?code=` query parameter was persisting in the URL after authentication. On page refresh, Convex Auth would try to re-process the stale code, invalidating the session (OAuth codes are single-use).

**Solution**: Created a dedicated `/auth/callback` route that:

- Receives the OAuth callback with query params
- Waits for Convex Auth to process the code
- Cleans the URL using `history.replaceState`
- Redirects to home with a clean URL

## Production Deployment

Update `CONVEX_SITE_URL` to your production site URL:

```bash
npx convex env set CONVEX_SITE_URL "https://your-project-name.convex.site"
```

Add your production web origin to the Google Cloud Console OAuth client.

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

## Alternative: Platform-Specific OAuth (Future)

For a more native mobile experience, a future migration could use:

- **Web**: `@react-oauth/google` (native Google button, popup flow)
- **Mobile**: `expo-auth-session` (proper native OAuth with PKCE)
- Requires a redirect service (see [setup-vercel-redirect.md](setup-vercel-redirect.md))

> This is **not currently implemented**. `expo-auth-session` is not installed in the project, and the current Google Sign-In relies on `expo-web-browser` via Convex Auth's built-in OAuth flow.
>
> This approach is documented in the Apple Sign-In guide since it's required for App Store compliance if Apple Sign-In is added later.
