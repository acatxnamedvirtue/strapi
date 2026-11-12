import { TEST_AI_PROVIDER_ENV_VAR, TEST_PLUGIN_ENV_VAR } from '../test-plugin';
import { databaseEnv, type Database } from '../db/database';
import { editionEnv, type Edition } from '../edition';
import { baseEnv } from './config';
import type { App } from './generate';

export interface AppEnvOptions {
  database: Database;
  edition: Edition;
  /** Load the test plugin (tests-next/shared/test-plugin). */
  testPlugin: boolean;
  /** Register the fake AI translations provider. */
  fakeAiProvider: boolean;
  /** The caller's env, applied last. */
  env?: NodeJS.ProcessEnv;
}

/**
 * The env of the runner, without its `DATABASE_*` variables: `databaseEnv` doesn't set every
 * one of them (`DATABASE_URL`, for example, would override the host and database on Postgres).
 */
const inheritedEnv = (): NodeJS.ProcessEnv => {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('DATABASE_')) {
      delete env[key];
    }
  }
  return env;
};

/**
 * The env a test app runs with. `startServer` and `seedApp` both build it here, so the seed
 * process loads Strapi the way the server will.
 */
export const appEnv = (
  app: App,
  { database, edition, testPlugin, fakeAiProvider, env }: AppEnvOptions
): NodeJS.ProcessEnv => ({
  ...inheritedEnv(),
  ...baseEnv(),
  ...databaseEnv(app, database),
  ...editionEnv(edition),
  [TEST_PLUGIN_ENV_VAR]: String(testPlugin),
  // Always written, so a value inherited from the shell can't turn the fake provider on.
  [TEST_AI_PROVIDER_ENV_VAR]: fakeAiProvider ? 'fake' : '',
  ...env,
});
