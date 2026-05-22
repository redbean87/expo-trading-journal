# Setup Guide

Quick-start and detailed setup instructions for the Trading Journal app.

## Prerequisites

- Node.js 20.x (managed via Volta)
- npm
- iOS Simulator or Android Emulator (or Expo Go app)

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up Convex** (see [setup-convex.md](setup-convex.md) for detailed guide):

   ```bash
   npx convex dev
   cp .env.example .env
   # Add EXPO_PUBLIC_CONVEX_URL to .env
   ```

3. **Start the app**:

   ```bash
   # Terminal 1
   npx convex dev

   # Terminal 2
   npm start
   ```

4. **Open on device**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR with Expo Go app

## Authentication Setup

- **Email/Password**: Works out of the box with Convex Auth
- **Google Sign-In**: See [setup-google-auth.md](setup-google-auth.md)
- **Apple Sign-In** (planned): See [setup-apple-auth.md](setup-apple-auth.md)

## Development Scripts

```bash
npm start              # Start Expo dev server
npm test               # Run tests
npm run lint           # Lint code
npm run format         # Format with Prettier
npm run typecheck      # TypeScript checks
```

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

See [setup-convex.md](setup-convex.md) for more detailed troubleshooting.
