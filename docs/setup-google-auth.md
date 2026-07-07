# Google OAuth Setup

## Overview

Google Sign-In via Convex Auth's built-in OAuth flow.

## Env Vars (set per-deployment)

```bash
npx convex env set AUTH_GOOGLE_ID <client-id>
npx convex env set AUTH_GOOGLE_SECRET <client-secret>

# Controls where browser redirects after OAuth
# Dev: deployed dev app URL
# Prod: production app URL
npx convex env set SITE_URL "https://expo-trading-journal--dev.expo.app"
```

`auth.config.ts` uses `CONVEX_SITE_URL` (built-in) for the `domain` field — that controls where Convex Auth expects the browser origin during password auth. It's separate from `SITE_URL` which handles OAuth redirects.

## Google Cloud Console

OAuth 2.0 Client ID (Web application):

| Field                         | Dev Value                                                                                       | Prod Value                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Authorized JavaScript origins | `https://expo-trading-journal--dev.expo.app`, `http://localhost:8081`, `http://localhost:19006` | `https://expo-trading-journal.expo.app`                            |
| Authorized redirect URIs      | `https://uncommon-turtle-66.convex.site/api/auth/callback/google`                               | `https://proficient-orca-351.convex.site/api/auth/callback/google` |

## Local Development

Google sign-in does not work on `localhost:8081` because OAuth requires a public HTTPS origin. Use email/password auth for local testing. Test Google sign-in on the deployed dev URL (`https://expo-trading-journal--dev.expo.app`).

## OAuth Flow

1. User clicks "Sign in with Google" → `useAuth().signInWithGoogle()`
2. Convex Auth returns a redirect URL pointing to Google
3. Browser navigates to Google OAuth → user authenticates
4. Google redirects to `convex.site/api/auth/callback/google`
5. Convex processes the auth code, creates/links user account
6. Convex redirects browser back to `SITE_URL` (your app URL)
7. `app/auth/callback.tsx` cleans up OAuth params and redirects to home

## Files

- `convex/auth.ts` — `Google` provider registered alongside `Password`
- `src/hooks/use-auth.ts` — `signInWithGoogle()` method with web redirect
- `src/screens/auth/login-screen.tsx` — Google button + AuthDivider
- `src/screens/auth/register-screen.tsx` — Google button + AuthDivider
- `src/components/google-sign-in-button.tsx` — Reusable button component
- `src/components/auth-divider.tsx` — "OR" divider component
- `app/auth/callback.tsx` — OAuth callback route
