import { NextResponse } from 'next/server';
import { z } from 'zod';

import { RATE_LIMITS, enforceRateLimit } from '@/server/rate-limit';
import { recordError } from '@/server/errors';

const reportSchema = z.object({
  source: z.enum(['client', 'server']).default('client'),
  message: z.string().trim().min(1).max(2000),
  digest: z.string().trim().max(200).optional(),
  stack: z.string().max(10000).optional(),
  path: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
});

function safePath(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  return trimmed.slice(0, 500);
}

export async function POST(request: Request) {
  const limit = await enforceRateLimit(RATE_LIMITS.errorReport, 'error-report');
  if (!limit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await recordError({
    source: parsed.data.source,
    message: parsed.data.message,
    digest: parsed.data.digest ?? null,
    stack: parsed.data.stack ?? null,
    path: safePath(parsed.data.path),
    userAgent: parsed.data.userAgent ?? request.headers.get('user-agent'),
  });

  return NextResponse.json({ ok: true });
}
