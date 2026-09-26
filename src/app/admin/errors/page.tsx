import { formatDate } from '@/lib/format';
import { requirePermission } from '@/lib/auth/guards';
import { markErrorReportResolved } from '@/server/actions/errors';
import { sql } from '@/server/db/sql';

export const metadata = {
  title: 'Error tracking',
  robots: { index: false, follow: false },
};

type ErrorRow = {
  id: string;
  source: string;
  message: string;
  digest: string | null;
  stack: string | null;
  path: string | null;
  userAgent: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
};

export default async function ErrorReportsPage() {
  await requirePermission('admin:manage_system', '/admin/errors');

  const rows = await sql<ErrorRow[]>`
    select
      id,
      source,
      message,
      digest,
      stack,
      path,
      "userAgent",
      "createdAt",
      "resolvedAt"
    from "ErrorReport"
    order by "createdAt" desc
    limit 100
  `;

  const open = rows.filter((row) => !row.resolvedAt);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="palma-label text-taupe-deep">System</span>
        <h1 className="text-4xl">Error tracking</h1>
        <p className="text-taupe-deep max-w-3xl leading-relaxed">
          Unhandled render errors reported by the error boundaries. This is operational exhaust, not
          part of the record: no cookies, no auth headers, no request bodies.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border-stone-deep border p-5">
          <div className="palma-label text-taupe-deep">Open</div>
          <div className="mt-2 text-3xl">{open.length}</div>
        </div>
        <div className="border-stone-deep border p-5">
          <div className="palma-label text-taupe-deep">Shown</div>
          <div className="mt-2 text-3xl">{rows.length}</div>
        </div>
        <div className="border-stone-deep border p-5">
          <div className="palma-label text-taupe-deep">Latest</div>
          <div className="mt-2 text-lg">{rows[0] ? formatDate(rows[0].createdAt) : 'None'}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border-stone-deep text-taupe-deep border p-6">
          Nothing reported yet. A quiet inbox is the point.
        </div>
      ) : (
        <div className="border-stone-deep overflow-x-auto border">
          <table className="w-full min-w-220 text-left text-sm">
            <thead className="border-stone-deep text-taupe-deep border-b">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Error</th>
                <th className="px-4 py-3 font-medium">Path</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-stone-deep border-b align-top last:border-b-0">
                  <td className="text-taupe-deep px-4 py-3 whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">{row.source}</td>
                  <td className="max-w-130 px-4 py-3">
                    <div className="font-medium">{row.message}</div>
                    {row.digest ? (
                      <div className="text-taupe mt-1 font-mono text-xs">digest {row.digest}</div>
                    ) : null}
                    {row.stack ? (
                      <details className="text-taupe-deep mt-2">
                        <summary className="cursor-pointer">Stack</summary>
                        <pre className="mt-2 max-w-120 overflow-x-auto text-xs whitespace-pre-wrap">
                          {row.stack}
                        </pre>
                      </details>
                    ) : null}
                  </td>
                  <td className="text-taupe-deep max-w-45 px-4 py-3 break-all">
                    {row.path ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {row.resolvedAt ? (
                      <span className="text-taupe-deep">Resolved {formatDate(row.resolvedAt)}</span>
                    ) : (
                      <span>Open</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.resolvedAt ? null : (
                      <form action={markErrorReportResolved}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="border-stone-deep hover:bg-stone/40 border px-3 py-1.5 text-sm"
                        >
                          Resolve
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
