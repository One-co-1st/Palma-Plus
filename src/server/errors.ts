import 'server-only';

import { createId } from '@/server/db/ids';
import { sql } from '@/server/db/sql';

export type ErrorReportInput = {
  source?: 'client' | 'server';
  message: string;
  digest?: string | null;
  stack?: string | null;
  path?: string | null;
  userAgent?: string | null;
  role?: string | null;
  userId?: string | null;
};

function clip(value: string | null | undefined, max: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/**
 * Write operational error reports without letting the reporting path become a
 * second failure. A failed insert is logged and swallowed: the user already
 * has an error page, and the record is never made worse by telemetry.
 */
export async function recordError(input: ErrorReportInput): Promise<string | null> {
  try {
    const id = createId();
    await sql`
      insert into "ErrorReport" (
        id,
        source,
        message,
        digest,
        stack,
        path,
        "userAgent",
        role,
        "userId",
        metadata
      ) values (
        ${id},
        ${input.source === 'server' ? 'server' : 'client'},
        ${clip(input.message, 2000) ?? 'Unknown error'},
        ${clip(input.digest, 200)},
        ${clip(input.stack, 10000)},
        ${clip(input.path, 500)},
        ${clip(input.userAgent, 500)},
        ${clip(input.role, 50)},
        ${clip(input.userId, 100)},
        ${sql.json({})}
      )
    `;
    return id;
  } catch (error) {
    console.error('[palma] failed to record error report', error);
    return null;
  }
}
