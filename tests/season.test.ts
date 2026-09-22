import { describe, expect, it } from 'vitest';
import {
  acceptsNominations,
  calendarStage,
  canAdvance,
  effectiveStage,
  finalistsArePublic,
  phaseIndex,
  phaseState,
  SEASON_STAGES,
  winnersArePublic,
} from '@/domain/season';

describe('season stages', () => {
  it('accepts nominations in exactly one stage', () => {
    expect(SEASON_STAGES.filter(acceptsNominations)).toEqual(['nominations_open']);
  });

  it('advances one stage at a time, forwards only', () => {
    expect(canAdvance('nominations_open', 'nominations_closed')).toBe(true);
    expect(canAdvance('nominations_open', 'judging')).toBe(false);
    expect(canAdvance('judging', 'nominations_open')).toBe(false);
    expect(canAdvance('archived', 'announced')).toBe(false);
  });

  it('keeps finalists private until they are announced', () => {
    expect(finalistsArePublic('judging')).toBe(false);
    expect(finalistsArePublic('finalists_announced')).toBe(true);
    expect(finalistsArePublic('winners_announced')).toBe(true);
    expect(finalistsArePublic('archived')).toBe(true);
  });

  it('keeps winners private until the ceremony', () => {
    expect(winnersArePublic('finalists_announced')).toBe(false);
    expect(winnersArePublic('winners_announced')).toBe(true);
    expect(winnersArePublic('archived')).toBe(true);
  });

  it('marks the public phase rail correctly', () => {
    expect(phaseIndex('announced')).toBe(-1);
    expect(phaseState('announced', 0)).toBe('upcoming');
    expect(phaseIndex('nominations_open')).toBe(0);
    expect(phaseState('nominations_open', 0)).toBe('current');
    expect(phaseState('nominations_open', 1)).toBe('upcoming');
    expect(phaseState('judging', 0)).toBe('complete');
    // An archived season has no current step — everything is done.
    expect(phaseState('archived', 3)).toBe('complete');
  });
});

describe('calendar-derived stage', () => {
  // The PALMA 2027 dates, as the season row carries them.
  const dates = {
    nominationsOpenAt: '2027-04-01T00:00:00.000Z',
    nominationsCloseAt: '2027-04-30T00:00:00.000Z',
    shortlistAt: '2027-05-06T00:00:00.000Z',
    finalistsAt: '2027-06-01T00:00:00.000Z',
    ceremonyAt: '2027-07-01T00:00:00.000Z',
  };
  const on = (iso: string) => new Date(iso);

  it('walks the season as its dates pass', () => {
    expect(calendarStage(dates, on('2027-03-31T23:59:59.000Z'))).toBe('announced');
    expect(calendarStage(dates, on('2027-04-01T00:00:00.000Z'))).toBe('nominations_open');
    expect(calendarStage(dates, on('2027-04-29T12:00:00.000Z'))).toBe('nominations_open');
    expect(calendarStage(dates, on('2027-04-30T00:00:00.000Z'))).toBe('shortlisting');
    expect(calendarStage(dates, on('2027-05-06T00:00:00.000Z'))).toBe('judging');
    expect(calendarStage(dates, on('2027-06-01T00:00:00.000Z'))).toBe('finalists_announced');
    expect(calendarStage(dates, on('2027-07-01T00:00:00.000Z'))).toBe('winners_announced');
  });

  it('cannot rule without an opening date', () => {
    expect(calendarStage({ nominationsOpenAt: null }, on('2027-04-15T00:00:00.000Z'))).toBeNull();
  });

  it('rules over a stage set by hand, in both directions', () => {
    // The off-season complaint: stored says open, the calendar says the
    // season has not started.
    expect(effectiveStage('nominations_open', dates, on('2026-09-22T12:00:00.000Z'))).toBe(
      'announced',
    );
    // And a stored stage left behind once the dates have moved on.
    expect(effectiveStage('nominations_open', dates, on('2027-05-10T12:00:00.000Z'))).toBe(
      'judging',
    );
  });

  it('never unseals an archived season', () => {
    // Archived is a seal, not a stage: only an administrator archives, and
    // the calendar may not undo it.
    expect(effectiveStage('archived', dates, on('2026-09-22T12:00:00.000Z'))).toBe('archived');
    expect(effectiveStage('archived', dates, on('2027-04-15T12:00:00.000Z'))).toBe('archived');
  });

  it('falls back to the stored stage when the dates cannot rule', () => {
    expect(
      effectiveStage('nominations_closed', { nominationsOpenAt: null }, on('2027-04-15T00:00:00.000Z')),
    ).toBe('nominations_closed');
  });

  it('accepts nominations exactly inside the window the dates set', () => {
    const stageAt = (iso: string) => effectiveStage('announced', dates, on(iso));
    expect(acceptsNominations(stageAt('2027-03-31T12:00:00.000Z'))).toBe(false);
    expect(acceptsNominations(stageAt('2027-04-15T12:00:00.000Z'))).toBe(true);
    expect(acceptsNominations(stageAt('2027-05-01T12:00:00.000Z'))).toBe(false);
  });
});
