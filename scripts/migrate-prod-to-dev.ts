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
 */

import fs from 'fs';
import path from 'path';

import { ConvexClient } from 'convex/browser';
import { config } from 'dotenv';

// Load optional .env.migrate for default configuration
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

  // Fall back to .env.migrate values when CLI args are missing
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

function getDeploymentUrl(deployment: string): string {
  // If it's already a full URL, use it
  if (deployment.startsWith('https://')) {
    return deployment;
  }
  // Otherwise construct from deployment name
  return `https://${deployment}.convex.cloud`;
}

function log(message: string): void {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function migrateUser(email: string, args: CliArgs): Promise<void> {
  log(`\n--- Processing: ${email} ---`);

  const prodUrl = getDeploymentUrl(args.prodDeployment);
  const devUrl = getDeploymentUrl(args.devDeployment);

  const prodClient = new ConvexClient(prodUrl);
  const devClient = new ConvexClient(devUrl);

  try {
    // 1. Find user in prod
    log('Finding user in production...');
    const prodUser = (await prodClient.query(
      'settings:findUserByEmail' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { email }
    )) as {
      _id: string;
      displayName: string | null;
    } | null;

    if (!prodUser) {
      log(`⚠️  User ${email} not found in production. Skipping.`);
      return;
    }

    log(`✓ Found in production (ID: ${prodUser._id})`);

    // 2. Find user in dev
    log('Finding user in development...');
    const devUser = (await devClient.query(
      'settings:findUserByEmail' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        email,
      }
    )) as {
      _id: string;
    } | null;

    if (!devUser) {
      log(`⚠️  User ${email} not found in development.`);
      log('   User must log into the dev app first to create their account.');

      // Save export for later import
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

    // 3. Export settings from prod
    log('Exporting settings from production...');
    const settings = (await prodClient.query(
      'settings:exportUserSettings' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { userId: prodUser._id }
    )) as Record<string, unknown> | null;

    // 4. Export trades from prod
    log('Exporting trades from production...');
    const trades = (await prodClient.query(
      'trades:exportUserTrades' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        userId: prodUser._id,
      }
    )) as Array<Record<string, unknown>> | null;
    const tradeCount = trades?.length ?? 0;
    log(`✓ Found ${tradeCount} trades`);

    // 5. Export tags from prod
    log('Exporting tags from production...');
    const tags = (await prodClient.query(
      'tags:exportUserTags' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      {
        userId: prodUser._id,
      }
    )) as Array<Record<string, unknown>> | null;
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
    const deleteTradesResult = (await devClient.mutation(
      'trades:deleteUserTrades' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { userId: devUser._id }
    )) as { deleted: number } | null;
    log(`✓ Deleted ${deleteTradesResult?.deleted ?? 0} trades`);

    log('Deleting existing user tags in development...');
    const deleteTagsResult = (await devClient.mutation(
      'tags:deleteUserTags' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      { userId: devUser._id }
    )) as { deleted: number } | null;
    log(`✓ Deleted ${deleteTagsResult?.deleted ?? 0} tags`);

    // 7. Import settings
    if (settings) {
      log('Importing settings to development...');
      await devClient.mutation(
        'settings:importUserSettings' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        {
          userId: devUser._id,
          settings,
        }
      );
      log('✓ Settings imported');
    }

    // 8. Import trades
    if (trades && trades.length > 0) {
      log('Importing trades to development...');
      const importResult = (await devClient.mutation(
        'trades:importUserTrades' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        { userId: devUser._id, trades }
      )) as { imported: number } | null;
      log(`✓ Imported ${importResult?.imported ?? 0} trades`);
    }

    // 9. Import tags
    if (tags && tags.length > 0) {
      log('Importing tags to development...');
      const importResult = (await devClient.mutation(
        'tags:importUserTags' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        { userId: devUser._id, tags }
      )) as { imported: number } | null;
      log(`✓ Imported ${importResult?.imported ?? 0} tags`);
    }

    log(`✅ Migration complete for ${email}`);
  } finally {
    prodClient.close();
    devClient.close();
  }
}

async function main(): Promise<void> {
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
    try {
      await migrateUser(email, args);
    } catch (error) {
      log(`❌ Error migrating ${email}: ${(error as Error).message}`);
    }
  }

  log('\n✨ Migration complete!');
}

main();
