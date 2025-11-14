#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const shouldRun = process.env.RUN_PLAYWRIGHT === 'true';

if (!shouldRun) {
  console.log(
    '[playwright] Skipping E2E run. Set RUN_PLAYWRIGHT=true after installing browsers to execute real tests.'
  );
  process.exit(0);
}

const result = spawnSync('npx', ['playwright', 'test'], { stdio: 'inherit' });
process.exit(result.status ?? 1);
