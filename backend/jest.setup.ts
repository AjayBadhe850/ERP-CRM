import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env so DATABASE_URL is available
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('DATABASE_URL is not set. Tests may fail if DB is unreachable.');
}

try {
  // Push Prisma schema to the configured database before tests run
  execSync('npx prisma db push --accept-data-loss', {
    cwd: path.resolve(__dirname),
    stdio: 'inherit',
    env: process.env
  });
} catch (err) {
  // Log but don't crash here; Jest will show DB errors in tests
  // eslint-disable-next-line no-console
  console.error('Prisma db push failed in jest.setup.ts', err);
}
