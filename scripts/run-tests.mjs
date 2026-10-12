// scripts/run-tests.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Parse arguments passed to npm script (e.g., -t "[P0]")
const extraArgs = process.argv.slice(2).join(' ');

// Generate timestamped filename
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportsDir = path.join(
  process.cwd(),
  'public',
  'reports',
  'test-results',
);

// Ensure directory exists
fs.mkdirSync(reportsDir, { recursive: true });

const timestampFile = path.join(reportsDir, `results-${timestamp}.json`);
const latestFile = path.join(reportsDir, `latest.json`);

console.log(`Running tests... Saving to ${timestampFile}`);

try {
  // Run vitest with reporters
  execSync(
    `npx vitest run ${extraArgs} --reporter=default --reporter=json --outputFile="${timestampFile}"`,
    { stdio: 'inherit' },
  );
} finally {
  // Copy latest run to latest.json if report was generated
  if (fs.existsSync(timestampFile)) {
    fs.copyFileSync(timestampFile, latestFile);
    console.log(`Updated ${latestFile}`);
  }
}
