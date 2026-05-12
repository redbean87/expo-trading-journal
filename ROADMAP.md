# Trading Journal App - Roadmap

## Current State (as of March 2026)

The app has a solid foundation with:

- **4 main screens**: Home (dashboard), Trades (list), Add Trade (form), Analytics
- **Authentication**: Email/password via Convex Auth
- **Real-time sync**: Convex backend with live data updates
- **CSV import/export**: With duplicate detection, including Thinkorswim account statement import
- **Equity curve chart**: Visual P&L progression with max drawdown tracking
- **Dark/light theme**: Persisted with Zustand
- **Fees & commissions**: Separate fields for fees and commissions on each trade

---

## Planned Features

### High Priority

- [ ] **Pre-Trade Checklist** - ON HOLD pending workflow analysis
  - 4 binary questions: approved strategy, clear confirmation, risk defined, HTF supports
  - **Blocker**: Current workflow is post-trade logging (import/manual entry after trade)
  - Pre-trade questions can't be answered honestly for imported/historical trades
  - **Options to consider:**
    1. Retrospective assessment ("Did I have clear confirmation?") — works with any workflow
    2. Separate pre-trade planning flow — requires new trade planning screen before entry
    3. Only show checklist for manually entered trades with entry time in future
  - **Decision needed**: How does this fit with import workflow?

### Medium Priority

- [ ] **Append/Update Imported Trades** - Re-import same statement to append missing trades or update existing ones with new data (fees, commissions, etc.)
  - Match existing trades by symbol + entry time + quantity (or importId)
  - Update fields that were empty/missing in previous import
  - Prevent duplicates while allowing data enrichment

- [ ] **Stop Loss vs Risk Amount Comparison** - Show implied risk from stop loss vs planned risk
  - Stop loss implies: `|entry - stop| × quantity` (technical/chart-based)
  - Planned risk: user's intended dollar risk (account-based, e.g., 5%)
  - Display gap/mismatch to identify sizing errors
  - Could show in trade detail, analytics, or as a warning
  - **Decision needed**: How to best surface this data without cluttering the form

- [ ] **Automated Migration Runner** - Add data migrations to CI/CD pipeline
  - Add `npx convex run <migration> --prod` to GitHub Actions after deploy
  - Make migrations idempotent (check before running)
  - Consider migration tracking table for audit history

### Recently Completed

- [x] **Setup Quality Rename** - Renamed confidence → setupQuality with migration (700+ trades migrated)
- [x] **Structure Break Before Exit** - Enum field (yes/no/unsure) to distinguish emotional vs technical exits
- [x] **Would Take Trade Again** - Enum field (yes/no/withAdjustment) for trade replay decisions
- [x] **Stop Loss Field** - Optional field for chart-based technical stop levels

- [x] **Strategy Analytics** - Performance breakdown by strategy tag
- [x] **Screenshot Attachments** - Add images to trades for chart analysis
- [x] **Drawdown Chart** - Visual drawdown progression over time
- [x] **Win/Loss Distribution** - Histogram showing distribution of trade P&L

### Low Priority / Nice to Have

- [x] **R-Multiple Distribution** - Histogram of trades expressed in risk units (R)
- [ ] **MFE/MAE Analysis** - Max favorable/adverse excursion charts (requires additional trade data)
- [x] **Position Sizing Calculator** - Calculate size based on risk %
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

- [ ] **TOS Import Bug: Cash Balance hides Account Trade History trades** - When Cash Balance section has fills, Account Trade History is never parsed, causing missing trades for symbols that haven't settled in Cash Balance yet
  - **Fix**: Parse Account Trade History as primary source (it's more complete/real-time), fall back to Cash Balance only if Trade History is empty
  - **Trade-off**: Fees/commissions only available from Cash Balance; may need to merge both sources for complete data
- [ ] Offline mode with sync queue
- [ ] Expand test coverage
- [ ] E2E tests for critical flows

---

## Data Migration Pattern (Learned)

- [x] **Schema Evolution Workflow** - Rename `confidence` → `setupQuality` with backward compatibility
  - Keep old field in schema during transition
  - Create idempotent migration mutation
  - Test in dev: `npx convex run trades:migrateConfidenceToSetupQuality`
  - Deploy to prod via GitHub Actions (`npx convex deploy`)
  - Run in prod: `npx convex run trades:migrateConfidenceToSetupQuality --prod`
  - Verify migration count matches dev
  - Future cleanup: Remove old field from schema in subsequent release

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
- [x] Monthly/Weekly Breakdown - Performance metrics grouped by time period with toggle
- [x] Emotion/Psychology Tracking - psychology field on trades with CSV import support
- [x] Trade Notes - whatWorked and whatFailed reflection fields with CSV import support
- [x] **Setup Quality + Rule Violations** - setupQuality level (1-5) and ruleViolation field with CSV import support (renamed from confidence)
- [x] Mistakes Tracking - Categorize trading errors with analytics dashboard showing frequency and P&L impact
- [x] P&L Calendar Heatmap - Color-coded calendar showing daily profit/loss at a glance
- [x] Performance by Day of Week - Bar chart showing P&L and win rate by weekday
- [x] Performance by Time of Day - Chart showing P&L by trading hour
- [x] Desktop Layout - Responsive layout with sidebar navigation and master-detail view for trades
- [x] Thinkorswim Import - Account statement CSV import from Thinkorswim platform
- [x] Fees & Commissions Fields - Separate fees and commissions fields on trades with CSV import support
- [x] Daily P&L Bar Chart - Bar chart showing P&L by day in the analytics charts tab
- [x] Avg Daily P&L & P&L Std Dev - Statistical overview stats in analytics
- [x] Hold Time Breakdown - Hold time analysis split by win/loss/scratch in analytics overview
- [x] Trade Duration Histogram - Distribution chart of hold times across 7 duration buckets, bars colored by avg P&L
- [x] R-Multiple Distribution - Histogram showing trades in R units; risk amount entered per trade via flat $ or % of account toggle
- [x] Position Sizing Calculator - Dialog on home screen; account size, risk %, entry/stop → position size and dollar risk
- [x] **Setup Quality Rename** - Renamed confidence → setupQuality across all layers (schema, forms, analytics, CSV, tests) with idempotent migration (700 trades migrated)
