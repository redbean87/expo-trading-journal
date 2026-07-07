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

## Phase 4 — Release Configuration

- [ ] **Add iOS build number** — `ios.buildNumber` in `app.config.ts`
- [ ] **Add Android version code** — `android.versionCode` in `app.config.ts`
- [ ] **Add `expo-secure-store` plugin** — add to plugins array in
      `app.config.ts`
- [ ] **EAS production profile** — configure `ios` and `android` specifics in
      `eas.json`
- [ ] Run `npm run typecheck` — verify zero TypeScript errors
- [ ] Run `npm run lint` — verify zero lint errors
- [ ] Run `npm run format:check` — verify formatting consistency
- [ ] Run `npm test -- --coverage` — verify all tests pass
