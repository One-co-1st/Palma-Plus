'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/form';
import { Notice } from '@/components/ui/feedback';
import { setFeature, type CommercialState } from '@/server/actions/commercial';

const initial: CommercialState = { status: 'idle' };

/**
 * One switch.
 *
 * One click flips it, immediately. The audit entry records who flipped it and
 * when — that is written by the action, not typed out by the operator.
 */
export function FeatureSwitch({
  featureKey,
  name,
  seasonAware,
  seasons,
  state,
  overrides,
}: {
  featureKey: string;
  name: string;
  seasonAware: boolean;
  seasons: { id: string; year: number; title: string }[];
  state: { enabled: boolean; launchAt: string | null; endAt: string | null };
  overrides: { awardYearId: string; title: string; enabled: boolean }[];
}) {
  const [result, action, pending] = useActionState(setFeature, initial);
  const [scope, setScope] = React.useState('');

  const scoped = overrides.find((row) => row.awardYearId === scope);
  const current = scope ? (scoped?.enabled ?? false) : state.enabled;

  return (
    <div className="flex flex-col gap-5">
      {result.status !== 'idle' && result.message ? (
        <Notice tone={result.status === 'error' ? 'error' : 'ceremonial'}>{result.message}</Notice>
      ) : null}

      {overrides.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="palma-label text-taupe-deep">Season overrides:</span>
          {overrides.map((row) => (
            <Badge key={row.awardYearId} variant={row.enabled ? 'olive' : 'muted'}>
              {row.title} {row.enabled ? 'on' : 'off'}
            </Badge>
          ))}
        </div>
      ) : null}

      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="key" value={featureKey} />
        <input type="hidden" name="enabled" value={String(!current)} />
        <input type="hidden" name="launchAt" value={state.launchAt?.slice(0, 10) ?? ''} />
        <input type="hidden" name="endAt" value={state.endAt?.slice(0, 10) ?? ''} />
        <input type="hidden" name="reason" value="" />

        <div className="flex flex-wrap items-end gap-3">
          {seasonAware ? (
            <Field htmlFor={`scope-${featureKey}`} label="Applies to">
              <Select
                id={`scope-${featureKey}`}
                name="awardYearId"
                value={scope}
                onChange={(event) => setScope(event.target.value)}
              >
                <option value="">Every season (global default)</option>
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.title}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <input type="hidden" name="awardYearId" value="" />
          )}

          <Button type="submit" variant={current ? 'outline' : 'primary'} size="sm" disabled={pending}>
            {pending
              ? 'Saving…'
              : current
                ? `Turn ${name} off${scope ? ' for this season' : ''}`
                : `Turn ${name} on${scope ? ' for this season' : ''}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
