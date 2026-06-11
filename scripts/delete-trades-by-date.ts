#!/usr/bin/env node
/**
 * Delete trades for a user within a specific date range.
 *
 * Usage:
 *   npx tsx scripts/delete-trades-by-date.ts \
 *     --email user@example.com \
 *     --start 2026-06-01 \
 *     --end 2026-06-30 \
 *     [--deployment uncommon-turtle-66]
 */

import fs from 'fs';
import path from 'path';

import { ConvexClient } from 'convex/browser';
import { config } from 'dotenv';

// Load .env.local for Convex URL
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
}

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;

interface CliArgs {
  email: string;
  startDate: string;
  endDate: string;
  deployment: string | null;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<CliArgs> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--email=')) {
      parsed.email = arg.split('=')[1];
    } else if (arg.startsWith('--start=')) {
      parsed.startDate = arg.split('=')[1];
    } else if (arg.startsWith('--end=')) {
      parsed.endDate = arg.split('=')[1];
    } else if (arg.startsWith('--deployment=')) {
      parsed.deployment = arg.split('=')[1];
    } else if (arg === '--email' && args[i + 1]) {
      parsed.email = args[i + 1];
      i++;
    } else if (arg === '--start' && args[i + 1]) {
      parsed.startDate = args[i + 1];
      i++;
    } else if (arg === '--end' && args[i + 1]) {
      parsed.endDate = args[i + 1];
      i++;
    } else if (arg === '--deployment' && args[i + 1]) {
      parsed.deployment = args[i + 1];
      i++;
    }
  }

  if (!parsed.email || !parsed.startDate) {
    console.error(
      'Usage: npx tsx scripts/delete-trades-by-date.ts --email <email> --start <YYYY-MM-DD> [--end <YYYY-MM-DD>]'
    );
    console.error('');
    console.error('Options:');
    console.error('  --email      User email address');
    console.error('  --start      Start date (inclusive)');
    console.error(
      '  --end        End date (inclusive, optional - defaults to end of start date month)'
    );
    console.error(
      '  --deployment Convex deployment URL (optional, defaults to EXPO_PUBLIC_CONVEX_URL)'
    );
    process.exit(1);
  }

  if (!parsed.endDate) {
    // Default to end of the month for the start date
    const start = new Date(parsed.startDate + 'T00:00:00');
    const end = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );
    parsed.endDate = end.toISOString().split('T')[0];
  }

  return {
    email: parsed.email,
    startDate: parsed.startDate,
    endDate: parsed.endDate,
    deployment: parsed.deployment || null,
  };
}

function getConvexUrl(deployment: string | null): string {
  if (deployment) {
    return `https://${deployment}.convex.cloud`;
  }
  if (CONVEX_URL) {
    return CONVEX_URL;
  }
  console.error(
    'Error: No Convex URL found. Set EXPO_PUBLIC_CONVEX_URL in .env.local or pass --deployment'
  );
  process.exit(1);
}

async function main() {
  const args = parseArgs();
  const convexUrl = getConvexUrl(args.deployment);

  console.log(`Connecting to Convex: ${convexUrl}`);
  const client = new ConvexClient(convexUrl);

  try {
    // Find user by email
    console.log(`Looking up user: ${args.email}...`);
    const user = (await client.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'trades:getUserByEmail' as any,
      {
        email: args.email,
      }
    )) as {
      id: string;
      email: string;
      name: string | null;
    } | null;

    if (!user) {
      console.error(`Error: User not found with email: ${args.email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name || 'Unknown'} (${user.id})`);

    // Convert dates to timestamps
    const startTime = new Date(args.startDate + 'T00:00:00').getTime();
    const endTime = new Date(args.endDate + 'T23:59:59.999').getTime();

    console.log(`\nDate range: ${args.startDate} to ${args.endDate}`);
    console.log(
      `Start time: ${startTime} (${new Date(startTime).toISOString()})`
    );
    console.log(`End time: ${endTime} (${new Date(endTime).toISOString()})`);
    console.log(`\nDeleting trades for user ${user.id}...`);

    // Confirm before deleting
    if (process.env.SKIP_CONFIRM !== 'true') {
      console.log(
        '\n⚠️  WARNING: This will permanently delete trades in the specified range.'
      );
      console.log('Set SKIP_CONFIRM=true to skip this prompt.');
      console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to proceed...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const result = (await client.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'trades:deleteUserTradesInRange' as any,
      {
        userId: user.id,
        startTime,
        endTime,
      }
    )) as { deleted: number };

    console.log(`\n✅ Deleted ${result.deleted} trades`);

    if (result.deleted === 0) {
      console.log('No trades found in the specified range.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
