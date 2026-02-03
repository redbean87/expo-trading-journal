# Trading Journal - React Native App

A mobile trading journal app built with Expo/React Native for tracking and analyzing trades with cloud sync.

## Features

- Track trades with detailed entry/exit information
- View analytics and performance metrics
- **Equity curve chart** with max drawdown tracking
- P&L calendar heatmap
- Performance by time of day and day of week
- Import/export trades via CSV
- Cloud sync across devices with Convex
- User authentication (email/password + Google Sign-In)
- Responsive desktop layout with master-detail view
- Offline support with automatic sync
- Dark mode support

## Tech Stack

- **Framework**: Expo SDK 54 / React Native 0.81
- **Language**: TypeScript
- **UI Library**: React Native Paper
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (UI state) + Convex hooks (data)
- **Backend**: Convex (cloud database + auth + real-time sync)
- **Storage**: AsyncStorage (offline cache)
- **Node**: 20.x (managed via Volta)

## Quick Start

### Prerequisites

- Node.js 20.x
- npm
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up Convex** (see [CONVEX_SETUP.md](CONVEX_SETUP.md) for detailed guide):

   ```bash
   # Login and create Convex project
   npx convex dev

   # Create .env file
   cp .env.example .env
   # Add your Convex URL to .env:
   # EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
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

See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Project Structure

```text
app/                    # Expo Router screens
  _layout.tsx          # Root layout (ConvexProvider, PaperProvider)
  add-trade.tsx        # Add trade modal
  (tabs)/              # Tab navigation
    index.tsx          # Home
    trades.tsx         # Trades list
    profile.tsx        # Profile/settings
    analytics/         # Analytics nested routes
      _layout.tsx      # Analytics tab navigator
      index.tsx        # Overview
      charts.tsx       # Charts
      psychology.tsx   # Psychology
      timing.tsx       # Timing analysis
  auth/
    callback.tsx       # OAuth callback handler
  edit-trade/
    [id].tsx           # Edit trade modal
  trade/
    [id].tsx           # Trade detail modal

convex/                # Backend (Convex)
  schema.ts           # Database schema
  auth.config.ts      # Auth setup
  trades.ts           # Trade operations

src/
  components/         # Reusable UI components
  hooks/             # Custom hooks (20+)
  screens/           # Screen components
    auth/            # Login/register
  services/          # Backend abstraction
  providers/         # React context providers
  store/             # Zustand stores
  types/             # TypeScript types
  utils/             # Utility functions
```

## Key Files

- [CONVEX_SETUP.md](CONVEX_SETUP.md) - Complete Convex setup guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details
- [CLAUDE.md](CLAUDE.md) - Code style guidelines

## Development

### Scripts

```bash
npm start              # Start Expo dev server
npm test               # Run tests
npm run lint           # Lint code
npm run format         # Format with Prettier
npm run typecheck      # TypeScript checks
```

### Making Changes

1. Backend changes: Edit `convex/*.ts` files
2. Frontend changes: Edit `src/` files
3. Screens: Use existing Convex hooks from `src/hooks/use-trades.ts`
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

See [CONVEX_SETUP.md](CONVEX_SETUP.md) for more help.

## Resources

- [Expo Docs](https://docs.expo.dev/)
- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## License

MIT
