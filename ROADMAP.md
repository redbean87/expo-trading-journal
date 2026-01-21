# Trading Journal App - Roadmap

## Current State (as of January 2026)

The app has a solid foundation with:
- **4 main screens**: Home (dashboard), Trades (list), Add Trade (form), Analytics
- **Authentication**: Email/password via Convex Auth
- **Real-time sync**: Convex backend with live data updates
- **CSV import/export**: With duplicate detection
- **Equity curve chart**: Visual P&L progression with max drawdown tracking
- **Dark/light theme**: Persisted with Zustand

---

## Planned Features

### Medium Priority

- [ ] **Desktop Layout** - Responsive layout optimized for larger screens (web/tablet)
- [ ] **Monthly/Weekly Breakdown** - Performance grouped by time period
- [ ] **Trade Duration Analysis** - Average time in trades

### Low Priority / Nice to Have

- [ ] **Screenshot Attachments** - Add images to trades for chart analysis
- [ ] **Position Sizing Calculator** - Calculate size based on risk %
- [ ] **Trade Goals** - Daily/weekly/monthly P&L targets
- [ ] **Notifications** - Milestone alerts (reached $X profit, etc.)
- [ ] **Onboarding Tutorial** - First-time user walkthrough

---

## Auth Enhancements

- [ ] Password reset / forgot password flow
- [ ] **Platform-Specific Google Auth** - see details below
- [ ] Social auth (Apple)
- [ ] User profile management
- [ ] Account deletion

### Platform-Specific Google Authentication (Planned)

Migrate from `expo-web-browser` to platform-optimized libraries for better UX:

**Target Architecture:**
- **Web**: `@react-oauth/google` (native Google button, popup flow)
- **Mobile**: `expo-auth-session` (proper native OAuth with PKCE)
- **Backend**: Custom `ConvexCredentials` provider to verify ID tokens

**Dependencies to Add:**
```bash
npx expo install expo-auth-session expo-crypto
npm install @react-oauth/google google-auth-library
```

**Files to Modify:**
- `convex/auth.ts` - Add GoogleIdToken provider using ConvexCredentials
- `src/hooks/use-auth.ts` - Platform-specific auth logic
- `src/components/google-sign-in-button.tsx` - Render platform-specific buttons
- `app/_layout.tsx` - Add GoogleOAuthProvider wrapper for web

**New Files:**
- `src/auth/google-auth-native.ts` - expo-auth-session configuration
- `src/auth/google-auth-web.ts` - @react-oauth/google exports

**Google Cloud Console Setup Required:**
1. Web Client ID (JS origins: localhost:8081, production URL)
2. iOS Client ID (Bundle ID: com.tradingjournal.app)
3. Android Client ID (Package name + SHA-1 fingerprint)

**Environment Variables:**
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web-client-id>
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios-client-id>
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<android-client-id>
```

**Note:** expo-auth-session requires custom dev build (no Expo Go support)

## Convex Backend Enhancements

- [ ] Advanced analytics queries (TypeScript queries for reports)
- [ ] Offline support improvements (mutation queue when offline)
- [ ] Test real-time sync across multiple devices

---

## Technical Improvements

- [ ] Offline mode with sync queue
- [ ] Expand test coverage
- [ ] E2E tests for critical flows

---

## Completed Features

- [x] Home dashboard with key metrics
- [x] Trades list with delete functionality
- [x] Add trade form with P&L preview
- [x] Analytics screen with win rate, profit factor, side analysis
- [x] CSV import with duplicate detection
- [x] Email/password authentication
- [x] Dark/light theme toggle
- [x] Real-time data sync via Convex
- [x] Date/time pickers for entry and exit times in Add Trade form
- [x] CSV side detection (long/short) via column names or negative quantity
- [x] Trade Edit - Modify existing trades
- [x] Search & Filter - Filter trades by symbol, side, date range, strategy
- [x] Trade Detail Screen - Modal/screen to view full trade details
- [x] Pull-to-Refresh - On trades list
- [x] Loading Indicator - Simple spinner during initial data fetch
- [x] Social auth (Google) - basic implementation with expo-web-browser
- [x] CSV Export - Export trades to CSV for backup/analysis
- [x] Equity Curve Chart - Visual chart showing cumulative P&L over time with max drawdown
- [x] Risk/Reward Analysis - Realized R:R ratio, expected value, required win rate, side-specific breakdown
