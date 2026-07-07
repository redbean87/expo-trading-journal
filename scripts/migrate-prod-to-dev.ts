#!/usr/bin/env node
/**
 * Migrate user data from Convex production to development environment.
 *
 * Usage:
 *   npx tsx scripts/migrate-prod-to-dev.ts \
 *     --emails user1@example.com,user2@example.com \
 *     --prod-deployment proficient-orca-351 \
 *     --dev-deployment uncommon-turtle-66 \
 *     [--dry-run]
 *
 * Calls internal Convex functions via npx convex run --internal.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { config } from 'dotenv';

const envPath = path.join(process.cwd(), '.env.migrate');
if (fs.existsSync(envPath)) {
  config({ path: envPath });
}

interface CliArgs {
  emails: string[];
  prodDeployment: string;
  devDeployment: string;
  dryRun: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: Partial<CliArgs> = { dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--emails') {
      result.emails = args[++i].split(',').map((e) => e.trim());
    } else if (arg === '--prod-deployment') {
      result.prodDeployment = args[++i];
    } else if (arg === '--dev-deployment') {
      result.devDeployment = args[++i];
    } else if (arg === '--dry-run') {
      result.dryRun = true;
    }
  }

  if (!result.emails?.length && process.env.MIGRATE_EMAIL) {
    result.emails = process.env.MIGRATE_EMAIL.split(',').map((e) => e.trim());
  }
  if (!result.prodDeployment && process.env.MIGRATE_PROD_DEPLOYMENT) {
    result.prodDeployment = process.env.MIGRATE_PROD_DEPLOYMENT;
  }
  if (!result.devDeployment && process.env.MIGRATE_DEV_DEPLOYMENT) {
    result.devDeployment = process.env.MIGRATE_DEV_DEPLOYMENT;
  }

  if (!result.emails?.length) {
    throw new Error(
      '--emails is required (or set MIGRATE_EMAIL in .env.migrate)'
    );
  }
  if (!result.prodDeployment) {
    throw new Error(
      '--prod-deployment is required (or set MIGRATE_PROD_DEPLOYMENT in .env.migrate)'
    );
  }
  if (!result.devDeployment) {
    throw new Error(
      '--dev-deployment is required (or set MIGRATE_DEV_DEPLOYMENT in .env.migrate)'
    );
  }

  return result as CliArgs;
}

function getDeploymentName(deployment: string): string {
  if (deployment.startsWith('https://')) {
    const match = deployment.match(/https:\/\/(.+)\.convex\.cloud/);
    if (match) {
      return match[1];
    }
    return deployment;
  }
  return deployment;
}

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
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

function migrateUser(email: string, args: CliArgs): void {
  log(`\n--- Processing: ${email} ---`);

  const prodDeployment = getDeploymentName(args.prodDeployment);
  const devDeployment = getDeploymentName(args.devDeployment);

  try {
    // 1. Find user in prod
    log('Finding user in production...');
    const prodUser = convexRun<{
      _id: string;
      displayName: string | null;
    } | null>('settings:findUserByEmail', { email }, prodDeployment);

    if (!prodUser) {
      log(`⚠️  User ${email} not found in production. Skipping.`);
      return;
    }

    log(`✓ Found in production (ID: ${prodUser._id})`);

    // 2. Find user in dev
    log('Finding user in development...');
    const devUser = convexRun<{
      _id: string;
    } | null>('settings:findUserByEmail', { email }, devDeployment);

    if (!devUser) {
      log(`⚠️  User ${email} not found in development.`);
      log('   User must log into the dev app first to create their account.');

      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      log('   Exporting data summary to file for later import...');
      const exportData = {
        email,
        prodUserId: prodUser._id,
        exportedAt: new Date().toISOString(),
      };
      fs.writeFileSync(
        path.join(exportsDir, `${email.replace(/[^a-z0-9]/gi, '_')}.json`),
        JSON.stringify(exportData, null, 2)
      );
      return;
    }

    log(`✓ Found in development (ID: ${devUser._id})`);

    // 3-5. Export data from prod
    log('Exporting settings from production...');
    const settings = convexRun<Record<string, unknown> | null>(
      'settings:exportUserSettings',
      { userId: prodUser._id },
      prodDeployment
    );

    log('Exporting trades from production...');
    const trades = convexRun<Array<Record<string, unknown>> | null>(
      'trades:exportUserTrades',
      { userId: prodUser._id },
      prodDeployment
    );
    const tradeCount = trades?.length ?? 0;
    log(`✓ Found ${tradeCount} trades`);

    log('Exporting tags from production...');
    const tags = convexRun<Array<Record<string, unknown>> | null>(
      'tags:exportUserTags',
      { userId: prodUser._id },
      prodDeployment
    );
    const tagCount = tags?.length ?? 0;
    log(`✓ Found ${tagCount} user tags`);

    if (args.dryRun) {
      log('--- DRY RUN ---');
      log(`Would delete existing dev data for ${email}`);
      log(`Would import ${tradeCount} trades`);
      log(`Would import ${tagCount} tags`);
      log(`Would overwrite settings`);
      return;
    }

    // 6. Delete existing dev data
    log('Deleting existing trades in development...');
    const deleteTradesResult = convexRun<{ deleted: number } | null>(
      'trades:deleteUserTrades',
      { userId: devUser._id },
      devDeployment
    );
    log(`✓ Deleted ${deleteTradesResult?.deleted ?? 0} trades`);

    log('Deleting existing user tags in development...');
    const deleteTagsResult = convexRun<{ deleted: number } | null>(
      'tags:deleteUserTags',
      { userId: devUser._id },
      devDeployment
    );
    log(`✓ Deleted ${deleteTagsResult?.deleted ?? 0} tags`);

    // 7. Import settings
    if (settings) {
      log('Importing settings to development...');
      convexRun(
        'settings:importUserSettings',
        {
          userId: devUser._id,
          settings,
        },
        devDeployment
      );
      log('✓ Settings imported');
    }

    // 8. Import trades
    if (trades && trades.length > 0) {
      log('Importing trades to development...');
      const importResult = convexRun<{ imported: number } | null>(
        'trades:importUserTrades',
        { userId: devUser._id, trades },
        devDeployment
      );
      log(`✓ Imported ${importResult?.imported ?? 0} trades`);
    }

    // 9. Import tags
    if (tags && tags.length > 0) {
      log('Importing tags to development...');
      const importResult = convexRun<{ imported: number } | null>(
        'tags:importUserTags',
        { userId: devUser._id, tags },
        devDeployment
      );
      log(`✓ Imported ${importResult?.imported ?? 0} tags`);
    }

    log(`✅ Migration complete for ${email}`);
  } catch (error) {
    log(`❌ Error migrating ${email}: ${(error as Error).message}`);
  }
}

function main(): void {
  let args: CliArgs;
  try {
    args = parseArgs();
  } catch (error) {
    console.error('Error:', (error as Error).message);
    console.log('\nUsage:');
    console.log('  npx tsx scripts/migrate-prod-to-dev.ts \\');
    console.log('    --emails user@example.com,user2@example.com \\');
    console.log('    --prod-deployment proficient-orca-351 \\');
    console.log('    --dev-deployment uncommon-turtle-66 \\');
    console.log('    [--dry-run]');
    process.exit(1);
  }

  log('Starting migration...');
  log(`Production: ${args.prodDeployment}`);
  log(`Development: ${args.devDeployment}`);
  log(`Emails: ${args.emails.join(', ')}`);
  log(`Dry run: ${args.dryRun}`);
  log('');

  for (const email of args.emails) {
    migrateUser(email, args);
  }

  log('\n✨ Migration complete!');
}

main();
