# Convex Setup Instructions

This guide will help you set up Convex authentication and cloud sync for the Trading Journal app.

## Prerequisites

- Node.js 20.x (managed via Volta)
- npm installed
- Convex account (free tier available)

## Step 1: Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Step 2: Create a Convex Account

1. Go to [https://convex.dev](https://convex.dev)
2. Sign up for a free account (GitHub, Google, or email)
3. You'll be redirected to the Convex dashboard

## Step 3: Initialize Convex Project

Run the Convex development server. This will:

- Create a new Convex project in your account
- Generate the necessary files in the `convex/` directory
- Give you a deployment URL

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

1. Copy the example environment file:

```bash
cp .env.example .env
```

1. Edit `.env` and add your Convex URL:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
```

**Important**: Make sure `.env` is in your `.gitignore` (it already is)

## Step 5: Start the Development Server

In a **separate terminal**, start the Expo development server:

```bash
npm start
```

## What's Been Configured

### Backend (Convex)

Located in the `convex/` directory:

- **[schema.ts](convex/schema.ts)** - Database schema with trades and auth tables
- **[auth.config.ts](convex/auth.config.ts)** - Email/password authentication configuration
- **[trades.ts](convex/trades.ts)** - CRUD operations for trades with user authorization
- **[http.ts](convex/http.ts)** - HTTP routes for authentication endpoints

### Frontend (React Native)

- **[ConvexProvider](src/providers/convex-provider.tsx)** - Wraps app with Convex client and secure storage
- **[AuthGate](src/components/auth-gate.tsx)** - Shows login/register screens when not authenticated
- **[useAuth](src/hooks/use-auth.ts)** - Hook for login, register, logout
- **[useTrades](src/hooks/use-trades.ts)** - Hooks for trade CRUD operations

### Authentication Flow

1. User opens app → sees login/register screen
2. After authentication → app content loads
3. Trades sync automatically with Convex cloud
4. Real-time updates across devices

## Testing the Setup

### 1. Create an Account

1. Run the app on your device/emulator
2. Click "Don't have an account? Sign Up"
3. Enter email and password (min 8 characters)
4. Click "Sign Up"

### 2. Add a Trade

1. Navigate to "Add Trade" tab
2. Fill in trade details
3. Submit the trade
4. It will sync to Convex cloud automatically

### 3. Verify Cloud Sync

1. Open the Convex dashboard: [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Click "Data" in the sidebar
4. You should see your trades in the `trades` table

### 4. Test Multi-Device Sync

1. Open the app on a second device/emulator
2. Login with the same credentials
3. You should see all your trades automatically
4. Add a trade on one device → it appears on the other instantly (reactive)

## Troubleshooting

### Error: "Missing EXPO_PUBLIC_CONVEX_URL"

- Make sure you created the `.env` file
- Restart the Expo dev server after creating `.env`
- Verify the URL starts with `https://` and ends with `.convex.cloud`

### Error: "Not authenticated"

- The AuthGate should automatically show login screen
- Try logging out and logging back in
- Check the Convex dashboard to verify your user exists in the auth tables

### Error: "Cannot find module 'convex/_generated/...'"

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

1. Start Convex dev server:

   ```bash
   npx convex dev
   ```

2. In another terminal, start Expo:

   ```bash
   npm start
   ```

### Making Schema Changes

1. Edit `convex/schema.ts`
2. Convex will automatically detect changes and update
3. TypeScript types regenerate automatically
4. Restart your app if needed

### Deploying to Production

When you're ready to deploy:

1. Push your backend to production:

   ```bash
   npx convex deploy
   ```

2. Update your `.env` with the production URL

3. Build your Expo app:

   ```bash
   npm run build
   ```

## Next Steps

- **Add password reset**: Implement forgot password flow
- **Add social auth**: Add Google/Apple sign-in
- **Add analytics queries**: Build TypeScript queries for advanced reports
- **Offline support**: Trades are already cached by Convex client
- **Real-time updates**: Already enabled! Try it across devices

## Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Convex + React Native](https://docs.convex.dev/client/react/)
- [TypeScript Queries](https://docs.convex.dev/functions/query-functions)

## Support

- Convex Discord: [https://convex.dev/community](https://convex.dev/community)
- Convex GitHub Issues: [https://github.com/get-convex/convex-js](https://github.com/get-convex/convex-js)
