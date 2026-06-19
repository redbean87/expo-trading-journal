# Convex Setup

Setup Convex authentication and cloud sync for the Trading Journal app.

## Prerequisites

- Node.js 20.x
- npm installed
- Convex account (free tier available)

## Step 1: Install Dependencies

Already installed via `npm install`. If reinstalling:

```bash
npm install
```

## Step 2: Create a Convex Account

1. Go to [https://convex.dev](https://convex.dev)
2. Sign up for a free account (GitHub, Google, or email)
3. You'll be redirected to the Convex dashboard

## Step 3: Initialize Convex Project

```bash
npx convex dev
```

When prompted:

- **Login**: Follow the browser authentication flow
- **Create a new project**: Choose a name (e.g., "expo-trading-journal")
- **Configure existing functions**: Yes (we already have functions set up)

The CLI will output a URL like:

```text
https://your-project-name.convex.cloud
```

## Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Convex URLs:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://your-project-name.convex.site
```

**Important**: `.env` is already in `.gitignore`

> If your `.env.example` is missing these variables, add them manually as shown above.

## Step 5: Start Development

In a **separate terminal**:

```bash
npm start
```

## What's Configured

### Backend (`convex/`)

- **schema.ts** - Database schema with trades, users, attachments, tags, import audits, and duplicate decisions
- **auth.ts** - Authentication setup (email/password + Google) and account-linking logic
- **auth.config.ts** - JWT provider configuration for Convex Auth
- **trades.ts** - CRUD operations for trades with user authorization
- **trades_analysis.ts** - Server-side trade analytics queries
- **settings.ts** - User settings sync across devices
- **tags.ts** - System and user-defined tag library
- **attachments.ts** - Screenshot upload URLs and metadata
- **duplicate_decisions.ts** - Cross-device duplicate decision persistence
- **http.ts** - HTTP routes for authentication endpoints

### Frontend

- **ConvexProvider** (`src/providers/convex-provider.tsx`) - Wraps app with Convex client and secure storage
- **AuthGate** (`src/components/auth-gate.tsx`) - Shows login/register screens when not authenticated
- **useAuth** (`src/hooks/use-auth.ts`) - Hook for login, register, logout
- **useTrades** (`src/hooks/use-trades.ts`) - Hooks for trade CRUD operations

### Authentication Flow

1. User opens app -> sees login/register screen
2. After authentication -> app content loads
3. Trades sync automatically with Convex cloud
4. Real-time updates across devices

## Testing

### Create an Account

1. Run the app on your device/emulator
2. Click "Don't have an account? Sign Up"
3. Enter email and password (min 8 characters)
4. Click "Sign Up"

### Verify Cloud Sync

1. Open the Convex dashboard: [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project -> click "Data"
3. You should see your trades in the `trades` table

### Test Multi-Device Sync

1. Open the app on a second device/emulator
2. Login with the same credentials
3. Trades appear automatically
4. Add a trade on one device -> appears on the other instantly

## Troubleshooting

### "Missing EXPO_PUBLIC_CONVEX_URL"

- Make sure you created the `.env` file
- Restart the Expo dev server after creating `.env`
- Verify the URL starts with `https://` and ends with `.convex.cloud`

### "Not authenticated"

- The AuthGate should automatically show login screen
- Try logging out and logging back in
- Check the Convex dashboard to verify your user exists in the auth tables

### "Cannot find module 'convex/\_generated/...'"

- Make sure `npx convex dev` is running in a separate terminal
- This command generates TypeScript types from your schema
- Wait for it to finish generating before starting Expo

### Trades Not Syncing

- Check that `npx convex dev` is running
- Verify you're logged in (check `isAuthenticated` in the app)
- Check the Convex dashboard logs for errors
- Ensure your internet connection is stable

## Development Workflow

### Daily Development

```bash
# Terminal 1
npx convex dev

# Terminal 2
npm start
```

### Schema Changes

1. Edit `convex/schema.ts`
2. Convex automatically detects changes and updates
3. TypeScript types regenerate automatically
4. Restart your app if needed

### Production Deployment

```bash
# Push backend to production
npx convex deploy

# Update .env with production URL
# Build your Expo app
npm run build
```

## Next Steps

- **Add social auth**: See [setup-google-auth.md](setup-google-auth.md)
- **Add Apple Sign-In**: See [setup-apple-auth.md](setup-apple-auth.md) (planned)
- **Add analytics queries**: Build TypeScript queries for advanced reports
- **Offline support**: Trades are already cached by Convex client
- **Real-time updates**: Already enabled

## Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Convex + React Native](https://docs.convex.dev/client/react/)

## Support

- Convex Discord: [https://convex.dev/community](https://convex.dev/community)
- Convex GitHub Issues: [https://github.com/get-convex/convex-js](https://github.com/get-convex/convex-js)
