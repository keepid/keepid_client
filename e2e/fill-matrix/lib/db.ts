import { spawnSync } from 'node:child_process';

/**
 * Narrow database access for the harness. Each trial starts from the same fixture-client rows,
 * so findings do not depend on what earlier trials saved. Stored application answers are read
 * here because the API does not expose them.
 *
 * The command is a psql invocation, for example
 * ['docker', 'exec', '-i', 'keepid_fill_matrix_pg', 'psql', '-U', 'keepid', '-d', 'keepid'].
 */
export interface DbCommand {
  argv: string[];
}

export interface FixtureUserSnapshot {
  json: string;
  columns: string[];
}

export function runSql(db: DbCommand, sql: string): string {
  const [cmd, ...args] = db.argv;
  const result = spawnSync(cmd, [...args, '-v', 'ON_ERROR_STOP=1', '-At', '-q'], {
    input: sql,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`psql failed (${result.status}): ${result.stderr.trim().slice(0, 500)}`);
  }
  return result.stdout;
}

export function snapshotFixtureUsers(db: DbCommand): FixtureUserSnapshot {
  const json = runSql(
    db,
    "select coalesce(json_agg(u order by u.username), '[]'::json) from app_user u where u.username like 'fixture-%';",
  ).trim();
  const rows = JSON.parse(json) as Array<Record<string, unknown>>;
  return { json, columns: rows.length > 0 ? Object.keys(rows[0]) : [] };
}

/** Restores every fixture-client row to its snapshot values. Other rows are not touched. */
export function restoreFixtureUsers(db: DbCommand, snapshot: FixtureUserSnapshot): void {
  if (snapshot.columns.length === 0) return;
  const cols = snapshot.columns.join(', ');
  const selectCols = snapshot.columns.map((c) => `s.${c}`).join(', ');
  const source = `jsonb_populate_recordset(null::app_user, $fm$${snapshot.json}$fm$::jsonb)`;
  runSql(
    db,
    `begin;
update app_user u set (${cols}) = (select ${selectCols} from ${source} s where s.id = u.id)
  where u.id in (select s.id from ${source} s);
commit;
`,
  );
}

export function readStoredAnswers(db: DbCommand, applicationId: string): Record<string, unknown> | null {
  if (!/^[0-9a-f-]{36}$/i.test(applicationId)) return null;
  const out = runSql(db, `select coalesce(answers::text, 'null') from application where id = '${applicationId}';`).trim();
  if (!out) return null;
  const parsed = JSON.parse(out) as unknown;
  return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
}
