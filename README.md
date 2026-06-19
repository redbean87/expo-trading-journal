# Trading Journal - React Native App

A mobile trading journal app built with Expo/React Native for tracking and analyzing trades with cloud sync.

## Features

- Track trades with detailed entry/exit information
- View analytics and performance metrics
- **Equity curve chart** with max drawdown tracking
- P&L calendar heatmap
- Performance by time of day and day of week
- **Performance by symbol** — find which tickers you trade best
- Import/export trades via CSV (including Thinkorswim account statements)
- **Import enrichment** — re-import statements to update fees, commissions, prices, and timestamps while preserving journal fields
- **Duplicate review** — resolve duplicate candidates after import
- Track fees and commissions separately per trade
- **Stop Loss tracking** with optional field for chart-based technical levels
- **Structure Break Before Exit** — track whether price structure broke before exit (yes/no/unsure)
- **Trade Replay Decision** — track whether you'd take the trade again (yes/no/with adjustment)
- **Setup Quality** rating (1-5) instead of emotional confidence
- **Rule Violation tracking** — log mistakes and what worked/didn't work
- **Screenshot attachments** — add images to trades for chart analysis
- **Daily Digest** — copy formatted trade summaries for external review
- Cloud sync across devices with Convex
- User authentication (email/password + Google Sign-In)
- Responsive desktop layout with master-detail view and sidebar navigation
- Offline support with automatic sync and offline banner
- Dark mode support and custom accent colors

## Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (UI state) + Convex hooks (data)
- **Backend**: Convex (cloud database + auth + real-time sync)
- **Storage**: AsyncStorage (offline cache), Cloudflare R2 (trade screenshots)
- **Node**: 20.x (managed via Volta)

## Quick Start

### Prerequisites

- Node.js 20.x
- npm
- iOS Simulator or Android Emulator (or Expo Go app)

### Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up Convex** (see [docs/setup-convex.md](docs/setup-convex.md) for detailed guide):

   ```bash
   # Login and create Convex project
   npx convex dev

   # Create .env file
   cp .env.example .env
   # Add your Convex URLs to .env:
   # EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   # EXPO_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site
   ```

3. **Start the app**:

   ```bash
   # Terminal 1: Keep Convex dev server running
   npx convex dev

   # Terminal 2: Start Expo
   npm start
   ```

4. **Open on device**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR with Expo Go app

## Architecture

**Local-first with cloud sync** - Works offline, syncs when online

- **Service Layer** abstracts backend (easy to swap Convex for Firebase/Supabase)
- **Convex hooks** handle caching and data fetching with real-time sync
- **Convex Auth** provides authentication (email/password + Google OAuth)
- **AsyncStorage** caches data locally for offline use
- **Service worker** enables PWA offline support on web

See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Project Structure

```text
app/                          # Expo Router screens
  _layout.tsx                # Root layout (ConvexProvider, PaperProvider, settings sync)
  +html.tsx                  # HTML wrapper (PWA manifest, service worker)
  add-trade.tsx              # Add trade modal
  daily-digest.tsx           # Daily trade summary exporter
  duplicate-review.tsx       # Resolve duplicate import candidates
  (tabs)/                    # Tab navigation
    _layout.tsx              # Tab navigator configuration
    index.tsx                # Home dashboard
    trades/                  # Trades list with master-detail
      _layout.tsx            # Trades stack layout
      index.tsx              # Trades list
      [id].tsx               # Trade detail panel
    profile.tsx              # Profile/settings
    analytics/               # Analytics nested routes
      _layout.tsx            # Analytics tab navigator
      index.tsx              # Overview
      charts.tsx             # Charts
      psychology.tsx         # Psychology
      timing.tsx             # Timing analysis
      symbols.tsx            # Symbol performance
      strategy.tsx           # Strategy performance
      market-condition.tsx   # Market condition performance
      htf-context.tsx        # HTF context performance
      patterns.tsx           # Pattern analytics
      ai-insights.tsx        # AI-generated insights
  auth/
    callback.tsx             # OAuth callback handler

convex/                       # Backend (Convex)
  schema.ts                  # Database schema
  auth.ts                    # Auth setup (Password + Google)
  auth.config.ts             # JWT provider configuration
  trades.ts                  # Trade operations
  trades_analysis.ts         # Trade analytics queries
  settings.ts                # User settings sync
  tags.ts                    # Tag library operations
  attachments.ts             # Screenshot upload/download
  duplicate_decisions.ts     # Cross-device duplicate decisions
  http.ts                    # HTTP routes for authentication

src/
  components/                # Reusable UI components
  config/                    # App configuration
  constants/                 # Constant values (mistake categories, tags)
  hooks/                     # Custom React hooks (40+)
  polyfills/                 # Platform polyfills
  providers/                 # React context providers (Convex, settings sync)
  schemas/                   # Zod validation schemas
  screens/                   # Screen components (re-exported by app/ routes)
    <screen-name>/           # Screen-specific components (co-located)
  services/                  # Backend service abstraction
  store/                     # Zustand stores
  theme/                     # Theme configuration
  types/                     # TypeScript interfaces and types
  utils/                     # Utility functions

scripts/                      # Utility scripts
  migrate-prod-to-dev.ts     # Copy prod data to dev environment
  generate-pwa-icons.mjs     # Generate PWA icons
  build-sw.mjs               # Build service worker
```

## Key Files

- [docs/setup.md](docs/setup.md) - Setup overview and quick start
- [docs/setup-convex.md](docs/setup-convex.md) - Convex setup guide
- [docs/setup-google-auth.md](docs/setup-google-auth.md) - Google Sign-In setup
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details
- [CLAUDE.md](CLAUDE.md) - Code style guidelines
- [ROADMAP.md](ROADMAP.md) - Feature roadmap and completed features

## Development

### Scripts

```bash
npm start              # Start Expo dev server
npm test               # Run tests
npm run lint           # Lint code
npm run format         # Format with Prettier
npm run typecheck      # TypeScript checks
npm run build:web      # Build web PWA
npm run deploy:web     # Deploy web to EAS
```

### Making Changes

1. Backend changes: Edit `convex/*.ts` files
2. Frontend changes: Edit `src/` files
3. Screens: Use existing hooks from `src/hooks/use-trades.ts`
4. No need to modify screens when switching backends!

## Authentication

Email/password and Google Sign-In via Convex Auth:

- Login/register screens show automatically when not authenticated
- Google OAuth supported for quick sign-in
- Auth tokens stored securely (expo-secure-store)
- All routes protected by AuthGate component

## Switching Backends

To switch from Convex to another service:

1. Create new API service file (e.g., `firebase-trade-service.ts`)
2. Update `ConvexProvider` to initialize your service
3. Screens don't need changes - service layer handles it!

## Troubleshooting

**"Missing EXPO_PUBLIC_CONVEX_URL"**

- Create `.env` with your Convex URL
- Restart Expo

**"Not authenticated"**

- Login with the app
- Check Convex dev server is running

**Trades not syncing**

- Ensure `npx convex dev` is running
- Check internet connection

See [docs/setup-convex.md](docs/setup-convex.md) for more help.

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## License

MIT
