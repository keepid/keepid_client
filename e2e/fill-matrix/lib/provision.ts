import { type DbCommand, runSql } from './db';

/** A 1x1 PNG. The org-scoped image assets only need valid bytes so documents can embed them. */
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const ASSET_ROLES = ['org-letterhead-image', 'director-signature-image', 'director-photo-id'];

/**
 * The server's integrity test configures the agency before it runs templates: an EIN, a website,
 * and three image assets. Those are not in the config snapshot, so the scratch database gets the
 * same values here. Only the demo agency is touched, and only where a value is still missing.
 */
export async function provisionAgency(db: DbCommand, gcsUploadBase: string | null, bucket: string): Promise<string[]> {
  const notes: string[] = [];
  runSql(db, `begin;
update organization set ein = '12-3456789',
  info = coalesce(info, '{}'::jsonb) || '{"website": "https://example.org"}'::jsonb
  where name = 'Demo Org' and ein is null;
commit;
`);
  if (!gcsUploadBase) {
    notes.push('Agency image assets were not provisioned (no GCS upload URL). Selector materialization may fail for templates that need them.');
    return notes;
  }
  const admin = runSql(db, "select id from app_user where username = 'demo-admin';").trim();
  const org = runSql(db, "select id from organization where name = 'Demo Org';").trim();
  if (!admin || !org) {
    notes.push('Demo Org or demo-admin not found; agency assets not provisioned.');
    return notes;
  }
  const png = Buffer.from(PNG_BASE64, 'base64');
  await ASSET_ROLES.reduce(async (previous, roleKey) => {
    await previous;
    const assigned = runSql(db, `select count(*) from organization_document_role_assignment a
      join organization_document_role r on r.id = a.role_id
      where a.org_id = '${org}' and r.role_key = '${roleKey}';`).trim();
    if (assigned !== '0') return;
    const documentId = crypto.randomUUID();
    const key = `assets/${documentId}`;
    // Upload first, so a failed upload never leaves a document row that points at nothing.
    const res = await fetch(`${gcsUploadBase}/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: png,
    });
    if (!res.ok) {
      notes.push(`asset ${roleKey} upload returned HTTP ${res.status}`);
      return;
    }
    runSql(db, `begin;
insert into document (id, scope, org_id, created_by_user_id, filename, mime_type, byte_size, s3_bucket, s3_key, category)
  values ('${documentId}', 'ORG', '${org}', '${admin}', '${roleKey}.png', 'image/png', ${png.length}, '${bucket}', '${key}', 'ORGANIZATION_ASSET');
insert into organization_document_role_assignment (org_id, role_id, document_id, assigned_by_user_id)
  select '${org}', id, '${documentId}', '${admin}' from organization_document_role where role_key = '${roleKey}';
commit;
`);
  }, Promise.resolve());
  return notes;
}
