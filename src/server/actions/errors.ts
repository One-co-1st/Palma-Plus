'use server';

import { revalidatePath } from 'next/cache';

import { authorise } from '@/lib/auth/guards';
import { sql } from '@/server/db/sql';

export async function markErrorReportResolved(formData: FormData): Promise<void> {
  await authorise('admin:manage_system');
  const id = String(formData.get('id') ?? '').trim();
  if (!id) return;

  await sql`
    update "ErrorReport"
    set "resolvedAt" = coalesce("resolvedAt", now())
    where id = ${id}
  `;

  revalidatePath('/admin/errors');
}
