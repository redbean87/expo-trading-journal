# Apple Sign-In Setup

Reference guide for implementing Apple Sign-In. This is **not yet implemented** but required for App Store submission if any social login is offered.

## Overview

Apple Sign-In uses the same architecture as platform-specific OAuth:

- **Mobile**: `expo-auth-session` with PKCE
- **Backend**: Convex Auth with custom `ConvexCredentials` provider
- **Redirect**: Vercel redirect service (see [setup-vercel-redirect.md](setup-vercel-redirect.md))

## Prerequisites

- Apple Developer account ($99/year)
- Vercel redirect service deployed
- `expo-auth-session` and `expo-crypto` installed

## Part 1: Configure Apple Developer Portal

### 1.1 Setup App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** -> **+** (Add)
4. Select **App IDs** -> Continue
5. Choose **App** -> Continue
6. Fill in:
   - Description: Your app name
   - Bundle ID: `com.tradingjournal.app` (must match Expo config)
7. Enable **Sign in with Apple**
8. Click **Continue** -> **Register**

### 1.2 Create Service ID

1. Click **Identifiers** -> **+** (Add)
2. Select **Services IDs** -> Continue
3. Fill in:
   - Description: "Trading Journal - Web Service"
   - Identifier: `com.tradingjournal.app.service`
4. Enable **Sign in with Apple**
5. Click **Configure**:
   - Primary App ID: Select your App ID from 1.1
   - Website URLs:
     - Domain: `your-project.vercel.app`
     - Return URL: `https://your-project.vercel.app/api/auth-redirect`
   - Click **Next** -> **Done** -> **Continue** -> **Register**

### 1.3 Create Private Key

1. Click **Keys** -> **+** (Add)
2. Key Name: "Sign in with Apple Key"
3. Enable **Sign in with Apple**
4. Click **Configure** -> Select your Primary App ID
5. Click **Save** -> **Continue** -> **Register**
6. **Download the key file** (you can only do this once!)
7. Note the **Key ID** shown

### 1.4 Generate Client Secret

Apple Sign In requires a JWT as the client secret.

Create `generate-apple-secret.js`:

```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const teamId = 'YOUR_TEAM_ID';
const clientId = 'com.tradingjournal.app.service';
const keyId = 'YOUR_KEY_ID';
const privateKey = fs.readFileSync('./AuthKey_XXXXX.p8', 'utf8');

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  audience: 'https://appleid.apple.com',
  issuer: teamId,
  subject: clientId,
  header: {
    kid: keyId,
    alg: 'ES256',
  },
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

## Part 2: Configure Convex Backend

Add to Convex environment variables:

```bash
npx convex env set APPLE_CLIENT_ID com.tradingjournal.app.service
npx convex env set APPLE_CLIENT_SECRET <generated-jwt>
```

Update `convex/auth.config.ts`:

```typescript
import { convexAuth } from '@convex-dev/auth/server';
import Google from '@auth/core/providers/google';
import Apple from '@auth/core/providers/apple';

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    }),
  ],
});
```

## Part 3: Expo App Configuration

### 3.1 Install Dependencies

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
```

### 3.2 Configure App Scheme

Ensure `app.json` includes:

```json
{
  "expo": {
    "scheme": "tradingjournal",
    "ios": {
      "bundleIdentifier": "com.tradingjournal.app"
    },
    "android": {
      "package": "com.tradingjournal.app"
    }
  }
}
```

### 3.3 Create Apple Sign-In Component

```javascript
import { useEffect, useState } from 'react';
import { View, Button, Alert, ActivityIndicator } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuthActions } from '@convex-dev/auth/react';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = 'https://your-project.vercel.app/api/auth-redirect';

export default function AppleSignIn() {
  const { signIn } = useAuthActions();
  const [loading, setLoading] = useState(false);

  const appleDiscovery = AuthSession.useAutoDiscovery(
    'https://appleid.apple.com'
  );

  const [appleRequest, appleResponse, applePromptAsync] =
    AuthSession.useAuthRequest(
      {
        clientId: 'com.tradingjournal.app.service',
        redirectUri: REDIRECT_URI,
        scopes: ['email', 'name'],
        responseType: 'code',
      },
      appleDiscovery
    );

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
        title="Sign in with Apple"
        onPress={handleAppleSignIn}
        disabled={!appleRequest}
      />
    </View>
  );
}
```

## Part 4: Testing

### Test in Development

```bash
npx expo start
npx convex dev
```

**Note**: `expo-auth-session` requires a custom dev build (no Expo Go support).

### Common Issues

**"Redirect URI mismatch"**

- Ensure redirect URI in Apple Developer Portal matches exactly: `https://your-project.vercel.app/api/auth-redirect`

**App doesn't open after OAuth**

- Check that `scheme` in `app.json` matches the scheme in your redirect URL

**Apple JWT expired**

- Regenerate the JWT using the script in Part 1.4

## Maintenance

**Every 6 months:**

- Regenerate Apple JWT token
- Update `APPLE_CLIENT_SECRET` in Convex

## Cost

| Service         | Cost                             |
| --------------- | -------------------------------- |
| Apple Developer | $99/year                         |
| Vercel          | $0 (free tier)                   |
| Convex          | $0 (free tier likely sufficient) |

**Total estimated annual cost: $99**
