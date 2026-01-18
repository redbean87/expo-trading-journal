# Social Login Setup Guide
## Expo + React Native + Convex

**Last Updated:** January 2026  
**Stack:** Expo, React Native, Convex, Vercel (free redirect service)

---

## Overview

This guide walks through implementing social login (Google + Apple) for a React Native app using:
- **Frontend:** Expo with React Native
- **Backend:** Convex
- **Authentication:** Convex Auth + OAuth
- **Redirect Service:** Vercel (free tier)

**Why these providers?**
- Google: Highest reach across platforms
- Apple: Required by App Store if you offer any social login
- Together they cover 95%+ of users

---

## Prerequisites

- [ ] Expo project initialized (`npx create-expo-app`)
- [ ] Convex project setup (`npx convex dev`)
- [ ] Node.js and npm installed
- [ ] Expo account (free)
- [ ] Vercel account (free, no credit card needed)

---

## Part 1: Setup Vercel Redirect Service

### 1.1 Create Redirect Service

Create a new folder for your redirect service:

```bash
mkdir oauth-redirect-service
cd oauth-redirect-service
npm init -y
```

### 1.2 Create API Endpoint

Create the file structure:

```bash
mkdir api
```

Create `api/auth-redirect.js`:

```javascript
// api/auth-redirect.js
export default function handler(req, res) {
  const { code, state, error, error_description } = req.query;
  
  // Handle errors from OAuth provider
  if (error) {
    return res.redirect(302, `yourapp://auth?error=${error}&error_description=${error_description || ''}`);
  }
  
  // Redirect back to app with auth code
  const params = new URLSearchParams({
    code: code || '',
    state: state || ''
  }).toString();
  
  res.redirect(302, `yourapp://auth?${params}`);
}
```

**Replace `yourapp` with your actual app scheme (we'll set this up later).**

### 1.3 Deploy to Vercel

Install Vercel CLI:

```bash
npm install -g vercel
```

Deploy:

```bash
vercel
```

Follow the prompts:
1. Login to Vercel (creates account if needed)
2. Confirm project settings
3. Deploy

**Save your deployment URL** (e.g., `https://your-project.vercel.app`)

Your redirect endpoint will be: `https://your-project.vercel.app/api/auth-redirect`

---

## Part 2: Configure Convex Backend

### 2.1 Install Convex Auth

In your Expo project root:

```bash
npm install @convex-dev/auth convex
```

### 2.2 Setup Convex Schema

Create or update `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Your other tables here
});
```

### 2.3 Configure Auth in Convex

Create `convex/auth.config.ts`:

```typescript
import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
  ],
});
```

### 2.4 Create Auth HTTP Actions

Create `convex/http.ts`:

```typescript
import { httpRouter } from "convex/server";
import { auth } from "./auth.config";

const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
```

### 2.5 Set Environment Variables

Create `.env.local` in your Convex project root:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

**We'll get these values in the next sections.**

Push to Convex:

```bash
npx convex env set GOOGLE_CLIENT_ID your-value
npx convex env set GOOGLE_CLIENT_SECRET your-value
npx convex env set APPLE_CLIENT_ID your-value
npx convex env set APPLE_CLIENT_SECRET your-value
```

---

## Part 3: Configure Google OAuth

### 3.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**

### 3.2 Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `https://your-project.vercel.app/api/auth-redirect`
   - `https://your-convex-site.convex.site/api/auth/callback/google`
5. Click **Create**

### 3.3 Save Credentials

Copy the **Client ID** and **Client Secret** and add them to your Convex environment variables (see Part 2.5).

### 3.4 Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **External** (for public apps)
3. Fill in required information:
   - App name
   - User support email
   - Developer contact email
4. Add scopes: `email`, `profile`
5. Save

---

## Part 4: Configure Apple Sign In

### 4.1 Setup App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add)
4. Select **App IDs** → Continue
5. Choose **App** → Continue
6. Fill in:
   - Description: Your app name
   - Bundle ID: `com.yourcompany.yourapp` (must match Expo)
7. Enable **Sign in with Apple**
8. Click **Continue** → **Register**

### 4.2 Create Service ID

1. Click **Identifiers** → **+** (Add)
2. Select **Services IDs** → Continue
3. Fill in:
   - Description: "Your App - Web Service"
   - Identifier: `com.yourcompany.yourapp.service`
4. Enable **Sign in with Apple**
5. Click **Configure**:
   - Primary App ID: Select your App ID from 4.1
   - Website URLs:
     - Domain: `your-project.vercel.app`
     - Return URL: `https://your-project.vercel.app/api/auth-redirect`
   - Click **Next** → **Done** → **Continue** → **Register**

### 4.3 Create Private Key

1. Click **Keys** → **+** (Add)
2. Key Name: "Sign in with Apple Key"
3. Enable **Sign in with Apple**
4. Click **Configure** → Select your Primary App ID
5. Click **Save** → **Continue** → **Register**
6. **Download the key file** (you can only do this once!)
7. Note the **Key ID** shown

### 4.4 Generate Client Secret

Apple Sign In requires a JWT as the client secret. You'll need to generate this.

Create a script `generate-apple-secret.js`:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Configuration
const teamId = 'YOUR_TEAM_ID'; // From Apple Developer account
const clientId = 'com.yourcompany.yourapp.service'; // Your Service ID
const keyId = 'YOUR_KEY_ID'; // From the key you created
const privateKey = fs.readFileSync('./AuthKey_XXXXX.p8', 'utf8'); // Downloaded key file

// Generate JWT (valid for 6 months)
const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  audience: 'https://appleid.apple.com',
  issuer: teamId,
  subject: clientId,
  header: {
    kid: keyId,
    alg: 'ES256'
  }
});

console.log('Apple Client Secret (JWT):');
console.log(token);
```

Install dependencies and run:

```bash
npm install jsonwebtoken
node generate-apple-secret.js
```

Copy the generated token - this is your `APPLE_CLIENT_SECRET`.

### 4.5 Save Apple Credentials

Add to Convex environment variables:
- `APPLE_CLIENT_ID`: Your Service ID (e.g., `com.yourcompany.yourapp.service`)
- `APPLE_CLIENT_SECRET`: The JWT you just generated

**Note:** The JWT expires, so you'll need to regenerate it every 6 months.

---

## Part 5: Setup Expo App

### 5.1 Install Dependencies

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
npm install @convex-dev/auth convex
```

### 5.2 Configure App Scheme

In `app.json`, add your custom URL scheme:

```json
{
  "expo": {
    "scheme": "yourapp",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

**Important:** The `scheme` should match what you used in the Vercel redirect and Apple configuration.

### 5.3 Setup Convex Provider

Update your root layout or App.js:

```javascript
// app/_layout.js or App.js
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ConvexAuthProvider>
        {/* Your app components */}
      </ConvexAuthProvider>
    </ConvexProvider>
  );
}
```

Create `.env`:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 5.4 Create Social Login Component

Create `components/SocialLogin.js`:

```javascript
import React, { useEffect, useState } from 'react';
import { View, Button, Alert, ActivityIndicator } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuthActions } from '@convex-dev/auth/react';

// Needed for web browser to close properly
WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = 'https://your-project.vercel.app/api/auth-redirect';

export default function SocialLogin() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);

  // Google Sign In
  const googleDiscovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  
  const [googleRequest, googleResponse, googlePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      redirectUri: REDIRECT_URI,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'code',
    },
    googleDiscovery
  );

  // Apple Sign In
  const appleDiscovery = AuthSession.useAutoDiscovery('https://appleid.apple.com');
  
  const [appleRequest, appleResponse, applePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: 'com.yourcompany.yourapp.service',
      redirectUri: REDIRECT_URI,
      scopes: ['email', 'name'],
      responseType: 'code',
    },
    appleDiscovery
  );

  // Handle Google Response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleOAuthCallback('google', googleResponse.params.code);
    } else if (googleResponse?.type === 'error') {
      Alert.alert('Error', 'Google sign in failed');
      setLoading(false);
    }
  }, [googleResponse]);

  // Handle Apple Response
  useEffect(() => {
    if (appleResponse?.type === 'success') {
      handleOAuthCallback('apple', appleResponse.params.code);
    } else if (appleResponse?.type === 'error') {
      Alert.alert('Error', 'Apple sign in failed');
      setLoading(false);
    }
  }, [appleResponse]);

  const handleOAuthCallback = async (provider, code) => {
    try {
      setLoading(true);
      await signIn(provider, { code });
      Alert.alert('Success', 'Signed in successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await googlePromptAsync();
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    await applePromptAsync();
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ gap: 10, padding: 20 }}>
      <Button
        title="Sign in with Google"
        onPress={handleGoogleSignIn}
        disabled={!googleRequest}
      />
      <Button
        title="Sign in with Apple"
        onPress={handleAppleSignIn}
        disabled={!appleRequest}
      />
    </View>
  );
}
```

### 5.5 Use the Auth State

In any component:

```javascript
import { useConvexAuth } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";

function MyApp() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <Authenticated>
        {/* Show this when user is logged in */}
        <Text>Welcome! You're signed in.</Text>
      </Authenticated>
      
      <Unauthenticated>
        {/* Show this when user is logged out */}
        <SocialLogin />
      </Unauthenticated>
    </>
  );
}
```

### 5.6 Add Sign Out

```javascript
import { useAuthActions } from "@convex-dev/auth/react";

function SignOutButton() {
  const { signOut } = useAuthActions();
  
  return (
    <Button 
      title="Sign Out" 
      onPress={() => signOut()} 
    />
  );
}
```

---

## Part 6: Testing

### 6.1 Test in Development

```bash
# Start Expo
npx expo start

# Start Convex
npx convex dev
```

**Scan QR code** with Expo Go app or run on simulator.

### 6.2 Test OAuth Flow

1. Tap "Sign in with Google" or "Sign in with Apple"
2. Browser should open with OAuth provider
3. Grant permissions
4. Should redirect back to app
5. Check that you're authenticated

### 6.3 Common Issues

**Issue:** "Redirect URI mismatch"
- **Fix:** Ensure redirect URI in OAuth provider matches exactly: `https://your-project.vercel.app/api/auth-redirect`

**Issue:** App doesn't open after OAuth
- **Fix:** Check that `scheme` in `app.json` matches the scheme in your redirect URL

**Issue:** "Invalid client"
- **Fix:** Double-check Client ID and Client Secret in Convex environment variables

**Issue:** Apple JWT expired
- **Fix:** Regenerate the JWT using the script in Part 4.4

---

## Part 7: Production Deployment

### 7.1 Build Expo App

```bash
# For iOS
eas build --platform ios

# For Android
eas build --platform android
```

### 7.2 Update OAuth Configs

Ensure all OAuth providers have the production redirect URI configured.

### 7.3 Test Production Build

Install the production build on a device and test the full OAuth flow.

---

## Part 8: Maintenance

### Regular Tasks

**Every 6 months:**
- [ ] Regenerate Apple JWT token (Part 4.4)
- [ ] Update `APPLE_CLIENT_SECRET` in Convex

**As needed:**
- [ ] Monitor Vercel deployment (check dashboard for errors)
- [ ] Review OAuth consent screen (user complaints may indicate issues)
- [ ] Update scopes if you need additional user data

---

## Security Considerations

1. **Never commit secrets** - Keep `.env` files out of git
2. **Use environment variables** - Store all credentials in Convex environment
3. **Validate tokens** - Convex Auth handles this automatically
4. **Limit scopes** - Only request necessary permissions
5. **Monitor access** - Check OAuth provider dashboards for suspicious activity

---

## Debugging Tips

### Check Convex Logs

```bash
npx convex logs
```

### Check Vercel Logs

Visit: `https://vercel.com/your-username/your-project/deployments`

### Enable Debug Mode

In your Expo app, add console logs:

```javascript
useEffect(() => {
  console.log('Auth Response:', response);
}, [response]);
```

---

## Cost Breakdown

| Service | Free Tier | Cost for This Setup |
|---------|-----------|---------------------|
| Vercel | 100GB bandwidth, unlimited deployments | $0 |
| Convex | 1M function calls/month | $0 (likely) |
| Google OAuth | Unlimited | $0 |
| Apple Developer | Required for App Store | $99/year |

**Total estimated annual cost: $99** (just the Apple Developer account)

---

## Resources

- [Expo AuthSession Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Convex Auth Docs](https://docs.convex.dev/auth)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)
- [Vercel Documentation](https://vercel.com/docs)

---

## Quick Reference Commands

```bash
# Deploy redirect service
cd oauth-redirect-service && vercel

# Start Expo dev server
npx expo start

# Start Convex dev
npx convex dev

# Set Convex environment variable
npx convex env set VAR_NAME value

# Build for production
eas build --platform ios
eas build --platform android

# View Convex logs
npx convex logs
```

---

## Checklist

- [ ] Vercel redirect service deployed
- [ ] Google OAuth credentials created
- [ ] Apple Sign In configured
- [ ] Apple JWT generated
- [ ] Convex environment variables set
- [ ] Expo app configured with correct scheme
- [ ] Dependencies installed
- [ ] Auth components implemented
- [ ] Testing completed in development
- [ ] Production build tested
- [ ] Monitoring setup for errors

---

**Setup Complete!** 🎉

You now have a fully functional social login system with Google and Apple, using only free services (except the required Apple Developer account).
