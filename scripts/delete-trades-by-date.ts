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
 *
 * Requires: --deployment flag or EXPO_PUBLIC_CONVEX_URL in .env.local.
 * Calls internal Convex functions via npx convex run --internal.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { config } from 'dotenv';

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
      'Usage: npx tsx scripts/delete-trades-by-date.ts --email <email> --start <YYYY-MM-DD> [--end <YYYY-MM-DD>] [--deployment <name>]'
    );
    process.exit(1);
  }

  if (!parsed.endDate) {
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

function resolveDeployment(deployment: string | null): string | null {
  if (deployment) {
    return deployment;
  }
  if (CONVEX_URL) {
    const match = CONVEX_URL.match(/https:\/\/(.+)\.convex\.cloud/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function convexRun<T>(
  functionPath: string,
  args: Record<string, unknown>,
  deployment: string | null
): T {
  const convexArgs = [
    'convex',
    'run',
    '--internal',
    functionPath,
    '--args',
    JSON.stringify(args),
  ];
  if (deployment) {
    convexArgs.push('--deployment', deployment);
  }

  const result = spawnSync('npx', convexArgs, {
    encoding: 'utf-8',
    shell: true,
    cwd: process.cwd(),
  });

  if (result.status !== 0) {
    console.error(result.stderr);
    throw new Error(
      `convex run failed: ${result.stderr?.trim() || 'unknown error'}`
    );
  }

  const stdout = result.stdout?.trim();
  if (!stdout) {
    return null as T;
  }

  return JSON.parse(stdout) as T;
}

async function main() {
  const args = parseArgs();
  const deployment = resolveDeployment(args.deployment);

  if (!deployment) {
    console.error(
      'Error: No Convex deployment specified. Set EXPO_PUBLIC_CONVEX_URL in .env.local or pass --deployment'
    );
    process.exit(1);
  }

  try {
    console.log(`Looking up user: ${args.email}...`);
    const user = convexRun<{
      id: string;
      email: string;
      name: string | null;
    } | null>('trades:getUserByEmail', { email: args.email }, deployment);

    if (!user) {
      console.error(`Error: User not found with email: ${args.email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name || 'Unknown'} (${user.id})`);

    const startTime = new Date(args.startDate + 'T00:00:00').getTime();
    const endTime = new Date(args.endDate + 'T23:59:59.999').getTime();

    console.log(`\nDate range: ${args.startDate} to ${args.endDate}`);
    console.log(
      `Start time: ${startTime} (${new Date(startTime).toISOString()})`
    );
    console.log(`End time: ${endTime} (${new Date(endTime).toISOString()})`);
    console.log(`\nDeleting trades for user ${user.id}...`);

    if (process.env.SKIP_CONFIRM !== 'true') {
      console.log(
        '\n⚠️  WARNING: This will permanently delete trades in the specified range.'
      );
      console.log('Set SKIP_CONFIRM=true to skip this prompt.');
      console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to proceed...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const result = convexRun<{ deleted: number }>(
      'trades:deleteUserTradesInRange',
      { userId: user.id, startTime, endTime },
      deployment
    );

    console.log(`\n✅ Deleted ${result.deleted} trades`);

    if (result.deleted === 0) {
      console.log('No trades found in the specified range.');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
