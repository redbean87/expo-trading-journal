# Vercel Redirect Service Setup

Vercel redirect service for mobile OAuth flows. Required when using `expo-auth-session` instead of `expo-web-browser`.

## Why a Redirect Service?

Mobile OAuth flows need a web-accessible redirect endpoint that can forward the auth code back to the mobile app via a deep link (`yourapp://auth?code=...`). Vercel provides this for free.

## Prerequisites

- Vercel account (free, no credit card needed)
- Vercel CLI installed

## Step 1: Create Redirect Service

```bash
mkdir oauth-redirect-service
cd oauth-redirect-service
npm init -y
```

## Step 2: Create API Endpoint

```bash
mkdir api
```

Create `api/auth-redirect.js`:

```javascript
export default function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.redirect(
      302,
      `yourapp://auth?error=${error}&error_description=${error_description || ''}`
    );
  }

  const params = new URLSearchParams({
    code: code || '',
    state: state || '',
  }).toString();

  res.redirect(302, `yourapp://auth?${params}`);
}
```

**Replace `yourapp` with your actual app scheme** (from `app.json` expo.scheme).

## Step 3: Deploy to Vercel

Install Vercel CLI:

```bash
npm install -g vercel
```

Deploy:

```bash
vercel
```

Follow the prompts:

1. Login to Vercel
2. Confirm project settings
3. Deploy

**Save your deployment URL** (e.g., `https://your-project.vercel.app`)

Your redirect endpoint will be: `https://your-project.vercel.app/api/auth-redirect`

## Step 4: Configure OAuth Providers

Use this URL as the redirect URI in all OAuth provider configurations:

- **Google Cloud Console**: Add `https://your-project.vercel.app/api/auth-redirect` as an authorized redirect URI
- **Apple Developer Portal**: Set Return URL to `https://your-project.vercel.app/api/auth-redirect`

## Testing

Visit `https://your-project.vercel.app/api/auth-redirect?code=test123` in a browser. You should be redirected to `yourapp://auth?code=test123`.

## Maintenance

- Monitor Vercel dashboard for errors
- Review OAuth consent screen if users report issues
- Update scopes if you need additional user data

## Cost

| Service | Free Tier                              | Cost |
| ------- | -------------------------------------- | ---- |
| Vercel  | 100GB bandwidth, unlimited deployments | $0   |

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Expo AuthSession Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
