export const SEASON_STAGES = [
  'announced',
  'nominations_open',
  'nominations_closed',
  'shortlisting',
  'shortlist_announced',
  'judging',
  'finalists_announced',
  'winners_announced',
  'archived',
] as const;

export type SeasonStage = (typeof SEASON_STAGES)[number];

export const STAGE_LABEL: Record<SeasonStage, string> = {
  announced: 'Announced',
  nominations_open: 'Nominations open',
  nominations_closed: 'Nominations closed',
  shortlisting: 'Shortlisting',
  shortlist_announced: 'Shortlist announced',
  judging: 'Judging',
  finalists_announced: 'Finalists announced',
  winners_announced: 'Winners announced',
  archived: 'Archived',
};

/** The four public beats of a PALMA season, as shown on the season progress rail. */
export const PUBLIC_PHASES = [
  { key: 'nominate', label: 'Nominate' },
  { key: 'shortlist', label: 'Shortlist' },
  { key: 'finalists', label: 'Finalists' },
  { key: 'winners', label: 'Winners' },
] as const;

export type PublicPhase = (typeof PUBLIC_PHASES)[number]['key'];

const STAGE_TO_PHASE_INDEX: Record<SeasonStage, number> = {
  // Announced is before the first public beat: nothing is in progress yet.
  announced: -1,
  nominations_open: 0,
  nominations_closed: 1,
  shortlisting: 1,
  shortlist_announced: 1,
  judging: 2,
  finalists_announced: 2,
  winners_announced: 3,
  archived: 3,
};

export function phaseIndex(stage: SeasonStage): number {
  return STAGE_TO_PHASE_INDEX[stage];
}

export function phaseState(stage: SeasonStage, index: number): 'complete' | 'current' | 'upcoming' {
  const active = phaseIndex(stage);
  if (stage === 'archived' || stage === 'winners_announced') {
    return index <= active ? 'complete' : 'upcoming';
  }
  if (index < active) return 'complete';
  if (index === active) return 'current';
  return 'upcoming';
}

const ORDER = new Map(SEASON_STAGES.map((stage, index) => [stage, index] as const));

/** Seasons move forward. Going backwards is a controlled administrative act. */
export function canAdvance(from: SeasonStage, to: SeasonStage): boolean {
  const a = ORDER.get(from);
  const b = ORDER.get(to);
  if (a === undefined || b === undefined) return false;
  return b === a + 1;
}

/**
 * The season's own dates, as stored on its row. Any of them may be missing;
 * the resolver below only rules on what it can see.
 */
export type SeasonCalendar = {
  nominationsOpenAt: Date | string | null;
  nominationsCloseAt?: Date | string | null;
  shortlistAt?: Date | string | null;
  finalistsAt?: Date | string | null;
  ceremonyAt?: Date | string | null;
};

function time(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

/**
 * The stage the PALMA calendar says the season is in, right now.
 *
 * The season's dates are the law the public site answers to: April opens
 * nominations, the close date ends them, each announcement date turns its
 * page. A stored stage that drifts from those dates — set by hand, then left
 * behind — is how the site ends up saying "Open for nominations" in the
 * off-season. This derives the stage from the calendar instead, and returns
 * null when the row does not carry enough dates to rule, so the caller can
 * fall back to what is stored.
 */
export function calendarStage(calendar: SeasonCalendar, now: Date = new Date()): SeasonStage | null {
  const open = time(calendar.nominationsOpenAt);
  if (open === null) return null;
  const close = time(calendar.nominationsCloseAt);
  const shortlist = time(calendar.shortlistAt);
  const finalists = time(calendar.finalistsAt);
  const ceremony = time(calendar.ceremonyAt);
  const t = now.getTime();

  if (t < open) return 'announced';
  if (close === null) return null;
  if (t < close) return 'nominations_open';
  if (shortlist === null) return 'shortlisting';
  if (t < shortlist) return 'shortlisting';
  if (finalists === null) return 'judging';
  if (t < finalists) return 'judging';
  if (ceremony === null) return 'finalists_announced';
  if (t < ceremony) return 'finalists_announced';
  return 'winners_announced';
}

/**
 * The stage the public record shows. The calendar rules.
 *
 * A season's own dates decide what stage it is in: April opens nominations,
 * the close date ends them, each announcement date turns its page. The stored
 * stage is the fallback for a season whose row does not carry enough dates to
 * rule — nothing more. This is what stops the site saying "Open for
 * nominations" in the off-season because somebody set a stage by hand and
 * never came back to it. If the institution moves a season, it moves the
 * dates, and every surface follows: the rail, the category cards, the
 * nomination form and the acceptance path all read through this one
 * resolver, so they cannot disagree with each other.
 *
 * One exception: `archived` is a seal, not a stage. Only an administrator
 * archives a season, and the calendar may not unseal it — a sealed season
 * reads as archived whatever its dates say.
 */
export function effectiveStage(
  stored: SeasonStage,
  calendar: SeasonCalendar,
  now: Date = new Date(),
): SeasonStage {
  if (stored === 'archived') return stored;
  return calendarStage(calendar, now) ?? stored;
}

export function acceptsNominations(stage: SeasonStage): boolean {
  return stage === 'nominations_open';
}

export function shortlistIsPublic(stage: SeasonStage): boolean {
  return phaseIndex(stage) >= 1 && stage !== 'nominations_closed' && stage !== 'shortlisting';
}

export function finalistsArePublic(stage: SeasonStage): boolean {
  return stage === 'finalists_announced' || stage === 'winners_announced' || stage === 'archived';
}

export function winnersArePublic(stage: SeasonStage): boolean {
  return stage === 'winners_announced' || stage === 'archived';
}
