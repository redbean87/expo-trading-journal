# Release Polish Plan

Track, analyze, and improve your trading performance — v1.0.0 release.

## Phase 1 — Security Fix (CRITICAL)

Convert 11 unauthenticated Convex endpoints to internal functions. See
[Security Review details in AGENTS.md](./AGENTS.md) or the conversation record.

- [x] **convex/trades.ts** — `exportUserTrades`, `importUserTrades`,
      `getUserByEmail`, `deleteUserTradesInRange`, `deleteUserTrades`
- [x] **convex/settings.ts** — `findUserByEmail`, `exportUserSettings`,
      `importUserSettings`
- [x] **convex/tags.ts** — `exportUserTags`, `importUserTags`, `deleteUserTags`
- [x] **Admin scripts** — update `delete-trades-by-date.ts`,
      `migrate-prod-to-dev.ts` to use `npx convex run --internal`
- [x] Run `npx convex deploy` to push changes

## Phase 2 — Web & PWA Polish

- [x] **Fix maskable PWA icon** — update `scripts/generate-pwa-icons.mjs` to
      output `icon-512-maskable.png`
- [x] **Verify web build** — run `npm run build:web` end-to-end
- [x] **Web analytics type safety** — convert `require()` to static `import`
      for recharts in all `*.web.tsx` files under `src/screens/analytics/`
- [x] **Service worker update UX** — add loading state to update banner
      (`src/components/update-banner.tsx`)
- [x] **Verify offline.html** — confirm offline fallback loads correctly
      (`public/offline.html`)
- [x] **PWA manifest completeness** — verify `manifest.json` has all required
      fields for installability (`id`, `categories`, `display`, etc.)
- [x] **Test SW failure recovery JS** — verify the inline script in
      `app/+html.tsx` handles chunk load failures gracefully

## Phase 3 — Error Handling & UX Polish

- [x] **Wire `getUserMessage()` into error boundary** — connect the dead-code
      utility in `src/utils/errors.ts` to `src/components/error-boundary.tsx`
- [x] **Add error state to `useTrades` hook** — expose `{ error }` from
      `src/hooks/use-trades.ts` so screens can show error UIs
- [x] **Improve auth error messages** — differentiate network vs auth errors
      in `src/screens/auth/login-screen.tsx`,
      `src/screens/auth/register-screen.tsx`
- [x] **Field-level form validation** — add inline `HelperText type="error"`
      for each invalid field in `src/screens/add-trade/trade-form.tsx`
- [x] **Add "Back online!" snackbar** — show brief notification when
      connectivity is restored (`src/components/offline-banner.tsx`)
- [x] **Global snackbar system** — extract per-screen snackbar boilerplate
      into `src/store/snackbar-store.ts`
- [x] **Show CSV import errors to user** — surface import errors via snackbar
      instead of `console.error` (`src/screens/trades-screen.tsx`)

## Phase 4 — Google Auth on Web + Code Quality

> Original Phase 4 items (iOS build number, Android version code,
> `expo-secure-store` plugin, EAS profile) are **deferred** — they require
> Apple Developer ($99/yr) and Google Play ($25) accounts. The app is web/PWA
> first.

### Completed Code Changes

- [x] **convex/auth.ts** — register `Google` provider from
      `@auth/core/providers/google` alongside existing `Password` provider
- [x] **login-screen.tsx** — add `AuthDivider` + `GoogleSignInButton` below
      password form
- [x] **register-screen.tsx** — add `AuthDivider` + `GoogleSignInButton` below
      password form

### Needs Your Action (Google Cloud Console — free)

To complete the setup, you need to:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs &
   Services > Credentials
2. Create an **OAuth 2.0 Client ID** (Web application type)
3. Set **Authorized redirect URI** to:
   `https://uncommon-turtle-66.convex.site/api/auth/callback/google`
4. Copy the **Client ID** and **Client Secret**

Then run these commands to set Convex server env vars:

```bash
npx convex env set AUTH_GOOGLE_ID <your-client-id>
npx convex env set AUTH_GOOGLE_SECRET <your-client-secret>
```

After that, `npx convex deploy` to push the auth changes, then Google sign-in
will work on web.

### Code Quality Gate

- [x] Run `npm run typecheck` — 0 errors (fixed pre-existing `any` in
      `use-trades.ts` + `analytics-layout.tsx`)
- [x] Run `npm run lint` — 0 errors, 30 warnings (pre-existing)
- [x] Run `npm run format:check` — all files pass
- [x] Run `npm test -- --coverage` — all 26 test suites pass
