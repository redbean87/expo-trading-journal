# Migrate Prod to Dev

Migrate user data (trades, tags, settings) from Convex production to development environment.

## Prerequisites

- Both prod and dev deployments must be accessible
- Users must exist in dev (have logged in at least once)
- Run from project root

## Usage

### Dry Run (Preview)

```bash
npx tsx scripts/migrate-prod-to-dev.ts \
  --emails user@example.com \
  --prod-deployment proficient-orca-351 \
  --dev-deployment uncommon-turtle-66 \
  --dry-run
```

### Actual Migration

```bash
npx tsx scripts/migrate-prod-to-dev.ts \
  --emails user@example.com,another@example.com \
  --prod-deployment proficient-orca-351 \
  --dev-deployment uncommon-turtle-66
```

## What Gets Migrated

- **User Settings**: displayName, timezone, themeMode, defaultTimeRange, defaultRiskPercent, customThemePreset, customColors
- **Trades**: All trade fields including psychology, whatWorked, setupQuality, etc.
- **User Tags**: Non-system tags only (system tags are already seeded in dev)

## What Does NOT Get Migrated

- **System Tags**: Already exist in dev via seed data
- **Attachment Files**: R2 objects are environment-specific and not accessible across deployments
- **Auth Credentials**: Users must log into dev to create their account

## How It Works

1. Find user in prod by email
2. Find user in dev by email
3. If user not in dev:
   - Export data summary to `exports/{email}.json`
   - Skip (user must log into dev first)
4. If user in dev:
   - Delete ALL existing dev data for that user (clean slate)
   - Import prod settings, trades, and tags

## Scheduling

Run weekly or monthly to keep dev environment in sync with production.

## Troubleshooting

**"User not found in development"**
The user must log into the dev app at least once before migration. This creates their auth-managed account.

**"Your request couldn't be completed"**
Check that the Convex deployment names are correct and accessible.
