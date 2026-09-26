-- First-party error tracking. Operational exhaust, not part of the record.
create table if not exists "ErrorReport" (
  id text primary key,
  source text not null default 'client',
  message text not null,
  digest text,
  stack text,
  path text,
  "userAgent" text,
  role text,
  "userId" text,
  metadata jsonb not null default '{}'::jsonb,
  "resolvedAt" timestamptz,
  "createdAt" timestamptz not null default now()
);

create index if not exists "ErrorReport_createdAt_idx"
  on "ErrorReport" ("createdAt" desc);

create index if not exists "ErrorReport_unresolved_idx"
  on "ErrorReport" ("createdAt" desc)
  where "resolvedAt" is null;
