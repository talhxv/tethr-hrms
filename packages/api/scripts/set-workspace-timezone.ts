import 'reflect-metadata';
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { isValidTimeZone } from '../src/common/time/time-zone';
import { Organization } from '../src/modules/organization/entities/organization.entity';

// Sets a workspace's wall-clock zone (`organizations.settings.timezone`), which
// decides the calendar date attendance sessions are filed under. There is no
// screen for it yet. Unset means UTC.
//
//   Dry run:  npm run set:workspace-timezone -w @hrms/api -- --tethr --zone Asia/Karachi
//   Apply:    ... --apply
//   Other:    --organization <workspace id> instead of --tethr
//
// Only the `timezone` key is written; other settings are kept. Idempotent.

/* eslint-disable no-console -- a one-shot CLI script: stdout is the interface. */
const flag = (name: string): string | null => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1]?.trim() ?? null) : null;
};

const main = async (): Promise<void> => {
  const zone = flag('--zone');
  const organizationId = flag('--organization');
  const tethr = process.argv.includes('--tethr');
  const apply = process.argv.includes('--apply');
  if (!zone || (!organizationId && !tethr)) {
    throw new Error(
      'Usage: npm run set:workspace-timezone -w @hrms/api -- (--tethr | --organization <id>) --zone <IANA zone> [--apply]',
    );
  }
  if (!isValidTimeZone(zone)) {
    throw new Error(`"${zone}" is not a time zone this runtime knows (expected e.g. Asia/Karachi)`);
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const organizations = app.get<DataSource>(getDataSourceToken()).getRepository(Organization);
    const organization = await organizations.findOne({
      where: tethr ? { kind: 'tethr' } : { id: organizationId ?? '' },
    });
    if (!organization) throw new Error('Workspace not found');

    const current = organization.settings?.timezone ?? '(unset: UTC)';
    console.log(`Workspace: ${organization.displayName}`);
    console.log(`Time zone: ${String(current)} -> ${zone}`);
    if (current === zone) {
      console.log('Already set; nothing to do.');
      return;
    }
    if (!apply) {
      console.log('Dry run. Re-run with --apply to write.');
      return;
    }
    await organizations.update(
      { id: organization.id },
      { settings: { ...(organization.settings ?? {}), timezone: zone } },
    );
    console.log('Saved.');
  } finally {
    await app.close();
  }
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
