/**
 * npm run fill-check
 *
 * Starts a scratch Postgres and fake-gcs on non-default ports, runs keepid_server_next with the
 * dev profile on port 7301 (snapshot and fixture clients loaded at startup), runs the fill matrix,
 * compares findings with e2e/fill-matrix/baseline.json, and tears everything down.
 *
 * Environment:
 *   KEEPID_SERVER_DIR       server checkout to run (default: <workspace>/keepid_server_next).
 *                           Point it at the config-snapshot worktree until the snapshot merges.
 *   FILL_CHECK_BASE_URL     use an already running server instead of starting one. The database
 *                           commands below are then needed for resets and stored-answer checks.
 *   FILL_CHECK_PSQL         psql command for that server, e.g. "psql postgresql://keepid@127.0.0.1:5432/keepid".
 *   FILL_CHECK_PG_PORT      scratch Postgres host port (default 55433).
 *   FILL_CHECK_GCS_PORT     scratch fake-gcs host port (default 4444).
 *   FILL_CHECK_SERVER_PORT  server port (default 7301).
 *   FILL_CHECK_GCS_URL      fake-gcs base URL, to provision agency image assets when using a running server.
 *
 * Flags:
 *   --update-baseline       write the current findings to baseline.json and exit 0.
 */
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type DbCommand } from './lib/db';
import { runMatrix } from './lib/matrix';
import { provisionAgency } from './lib/provision';
import { diffBaseline, readBaseline, renderJson, renderMarkdown, writeBaseline } from './lib/report';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLIENT_ROOT = resolve(HERE, '../..');
const OUT = join(HERE, 'out');
const BASELINE = join(HERE, 'baseline.json');
const WORKSPACE = resolve(CLIENT_ROOT, '../../../..');

const env = process.env;
const pgPort = Number(env.FILL_CHECK_PG_PORT ?? 55433);
const gcsPort = Number(env.FILL_CHECK_GCS_PORT ?? 4444);
const serverPort = Number(env.FILL_CHECK_SERVER_PORT ?? 7301);
const serverDir = env.KEEPID_SERVER_DIR ?? join(WORKSPACE, 'keepid_server_next');
const updateBaseline = process.argv.includes('--update-baseline');

/* The orchestration steps are sequential by design; each waits on the one before it. */
/* eslint-disable no-await-in-loop */

const log = (message: string) => console.log(`[fill-check] ${message}`);
const sleep = (ms: number) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

function portFree(port: number): Promise<boolean> {
  return new Promise((resolvePort) => {
    const probe = createServer();
    probe.once('error', () => resolvePort(false));
    probe.once('listening', () => probe.close(() => resolvePort(true)));
    probe.listen(port, '127.0.0.1');
  });
}

async function waitFor(label: string, check: () => Promise<boolean>, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if (await check()) return;
    } catch {
      // not ready yet
    }
    await sleep(2000);
  }
  throw new Error(`${label} was not ready after ${Math.round(timeoutMs / 1000)}s`);
}

function docker(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync('docker', args, { encoding: 'utf8' });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

interface Managed {
  pgName: string;
  gcsName: string;
  server: ChildProcess | null;
}

async function startStack(
  managed: Managed,
  logStream: NodeJS.WritableStream,
): Promise<{ db: DbCommand; server: ChildProcess }> {
  const dockerInfo = docker(['info', '--format', '{{.ServerVersion}}']);
  if (dockerInfo.status !== 0) throw new Error('Docker is not running. Start Docker, then run fill-check again.');

  const ports = [pgPort, gcsPort, serverPort];
  const free = await Promise.all(ports.map((port) => portFree(port)));
  ports.forEach((port, i) => {
    if (!free[i]) throw new Error(`Port ${port} is already in use. Set FILL_CHECK_*_PORT to free ports.`);
  });
  if (!existsSync(join(serverDir, 'mvnw'))) {
    throw new Error(`No server checkout at ${serverDir}. Set KEEPID_SERVER_DIR.`);
  }

  log(`starting scratch Postgres (${pgPort}) and fake-gcs (${gcsPort})`);
  const pg = docker([
    'run', '-d', '--rm', '--name', managed.pgName,
    '-e', 'POSTGRES_DB=keepid', '-e', 'POSTGRES_USER=keepid', '-e', 'POSTGRES_PASSWORD=keepid',
    '-p', `127.0.0.1:${pgPort}:5432`, 'postgres:17-alpine',
  ]);
  if (pg.status !== 0) throw new Error(`could not start Postgres: ${pg.stderr.trim()}`);
  const gcs = docker([
    'run', '-d', '--rm', '--name', managed.gcsName,
    '-p', `127.0.0.1:${gcsPort}:4443`, 'fsouza/fake-gcs-server:1.49',
    '-scheme', 'http', '-external-url', `http://localhost:${gcsPort}`, '-public-host', `localhost:${gcsPort}`,
  ]);
  if (gcs.status !== 0) throw new Error(`could not start fake-gcs: ${gcs.stderr.trim()}`);

  await waitFor('Postgres', async () => docker(['exec', managed.pgName, 'pg_isready', '-U', 'keepid', '-d', 'keepid']).status === 0, 90_000);
  await waitFor('fake-gcs', async () => (await fetch(`http://127.0.0.1:${gcsPort}/storage/v1/b`)).ok, 90_000);

  log(`starting keepid_server_next from ${serverDir} on ${serverPort}`);
  const child = spawn('./mvnw', ['-q', 'spring-boot:run'], {
    cwd: serverDir,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...env,
      SPRING_PROFILES_ACTIVE: 'dev',
      PORT: String(serverPort),
      DATABASE_URL: `jdbc:postgresql://127.0.0.1:${pgPort}/keepid`,
      DATABASE_USERNAME: 'keepid',
      DATABASE_PASSWORD: 'keepid',
      KEEPID_GCS_ENDPOINT: `http://127.0.0.1:${gcsPort}`,
      KEEPID_GCS_PROJECT_ID: 'dev',
      KEEPID_GCS_BUCKET: 'keepid-dev',
    },
  });
  child.stdout?.pipe(logStream, { end: false });
  child.stderr?.pipe(logStream, { end: false });
  let exited = false;
  child.on('exit', (code) => {
    exited = true;
    log(`server process exited with code ${code}`);
  });

  const base = `http://127.0.0.1:${serverPort}`;
  await waitFor('server', async () => {
    if (exited) throw new Error('server exited during startup; see out/server.log');
    const login = await fetch(`${base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo-worker', password: 'demo-pass' }),
    });
    const json = (await login.json()) as { status?: string };
    if (json.status !== 'AUTH_SUCCESS') return false;
    const cookie = login.headers.getSetCookie().map((line) => line.split(';')[0]).join('; ');
    // Snapshot and fixture clients are loaded after the app is up. Wait for them too.
    const fixture = await fetch(`${base}/get-user-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie },
      body: JSON.stringify({ username: 'fixture-full' }),
    });
    return ((await fixture.json()) as { status?: string }).status === 'SUCCESS';
  }, 420_000);
  log('server is up and the fixture clients are loaded');

  return {
    db: { argv: ['docker', 'exec', '-i', managed.pgName, 'psql', '-U', 'keepid', '-d', 'keepid'] },
    server: child,
  };
}

async function stopStack(managed: Managed): Promise<void> {
  if (managed.server?.pid && managed.server.exitCode === null) {
    const pid = managed.server.pid;
    try {
      process.kill(-pid, 'SIGTERM');
    } catch {
      // already gone
    }
    for (let i = 0; i < 20 && managed.server.exitCode === null; i += 1) await sleep(500);
    if (managed.server.exitCode === null) {
      try {
        process.kill(-pid, 'SIGKILL');
      } catch {
        // already gone
      }
    }
  }
  docker(['rm', '-f', managed.pgName]);
  docker(['rm', '-f', managed.gcsName]);
}

async function main(): Promise<number> {
  mkdirSync(OUT, { recursive: true });
  const managed: Managed = {
    pgName: `keepid_fill_check_pg_${process.pid}`,
    gcsName: `keepid_fill_check_gcs_${process.pid}`,
    server: null,
  };
  // Ctrl-C or a terminal hang-up still tears the stack down.
  const onSignal = (signal: NodeJS.Signals) => {
    log(`received ${signal}; stopping the stack`);
    stopStack(managed).finally(() => process.exit(130));
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  const startedMs = Date.now();
  const logPath = join(OUT, 'server.log');
  const logStream = createWriteStream(logPath, { flags: 'w' });

  let baseUrl = env.FILL_CHECK_BASE_URL ?? '';
  let db: DbCommand | null = null;
  let gcsUrl: string | null = env.FILL_CHECK_GCS_URL ?? null;
  let result;
  try {
    if (baseUrl) {
      log(`using the running server at ${baseUrl}`);
      if (env.FILL_CHECK_PSQL) db = { argv: env.FILL_CHECK_PSQL.split(/\s+/).filter(Boolean) };
    } else {
      const started = await startStack(managed, logStream);
      managed.server = started.server;
      db = started.db;
      baseUrl = `http://127.0.0.1:${serverPort}`;
      gcsUrl = `http://127.0.0.1:${gcsPort}`;
    }

    const setupNotes = db ? await provisionAgency(db, gcsUrl, 'keepid-dev') : [];
    result = await runMatrix({ baseUrl, db, log, setupNotes });
  } catch (error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    log(`failed: ${(error as Error).message}${cause ? ` (${String(cause)})` : ''}`);
    if (process.env.FILL_CHECK_DEBUG) console.error(error);
    return 2;
  } finally {
    await stopStack(managed);
    logStream.end();
  }

  const baseline = readBaseline(BASELINE);
  const diff = diffBaseline(result.findings, baseline);
  const runtimeSeconds = Math.round((Date.now() - startedMs) / 1000);
  const meta = { baseUrl, dbReset: db !== null, runtimeSeconds };
  writeFileSync(join(OUT, 'report.md'), renderMarkdown(result, diff, meta));
  writeFileSync(join(OUT, 'report.json'), renderJson(result, diff));

  if (updateBaseline) {
    writeBaseline(BASELINE, result.findings);
    log(`baseline updated with ${result.findings.length} findings. See ${join(OUT, 'report.md')}.`);
    return 0;
  }

  log(`findings: ${result.findings.length} total, ${diff.added.length} new, ${diff.kept.length} baselined, ${diff.fixed.length} fixed`);
  diff.added.slice(0, 50).forEach((f) => log(`NEW ${f.key}: ${f.message}`));
  diff.fixed.forEach((f) => log(`fixed — update baseline: ${f.key}`));
  log(`report: ${join(OUT, 'report.md')}`);
  log(`runtime: ${runtimeSeconds}s`);
  if (!existsSync(BASELINE)) {
    log('no baseline file yet; run with --update-baseline to create one');
  }
  return diff.added.length > 0 || diff.fixed.length > 0 ? 1 : 0;
}

main().then((code) => {
  process.exitCode = code;
}).catch((error) => {
  console.error(error);
  process.exitCode = 2;
});
