import { PALMA_YEAR } from '@/domain/calendar';
import { STAGE_LABEL } from '@/domain/season';
import { siteUrl } from '@/lib/env';
import { formatDate } from '@/lib/format';
import { getCurrentSeason, listSeasons } from '@/server/data/queries';

export const revalidate = 900;

function field(label: string, value: string | null | undefined): string {
  return `${label}: ${value && value.trim() ? value : 'not set'}`;
}

export async function GET() {
  const [season, seasons] = await Promise.all([getCurrentSeason(), listSeasons()]);

  const lines = [
    '# PALMA season calendar',
    '# Generated from the live season row. It follows the dates PALMA has actually set.',
    field('Name', 'PALMA, The Creator Honours'),
    field('Canonical', `${siteUrl}/.well-known/palma-calendar.txt`),
    field('Machine-readable-summary', `${siteUrl}/llms.txt`),
    '',
    '# Current season',
    field('Season', season.title),
    field('Year', String(season.year)),
    field('Stage', STAGE_LABEL[season.stage]),
    field(
      'Nominations open',
      season.nominationsOpenAt ? formatDate(season.nominationsOpenAt) : null,
    ),
    field(
      'Nominations close',
      season.nominationsCloseAt ? formatDate(season.nominationsCloseAt) : null,
    ),
    field('Shortlist', season.shortlistAt ? formatDate(season.shortlistAt) : null),
    field('Finalists', season.finalistsAt ? formatDate(season.finalistsAt) : null),
    field('Ceremony', season.ceremonyAt ? formatDate(season.ceremonyAt) : null),
    field('Categories contested', String(season.categoryCount)),
    '',
    '# The PALMA year',
    ...PALMA_YEAR.map(
      (chapter) =>
        `${chapter.months}: ${chapter.label}. ${chapter.line} ${chapter.inSeason ? 'In season.' : 'Institution.'}`,
    ),
    '',
    '# Seasons on record',
    ...seasons.map(
      (entry) =>
        `${entry.year}: ${entry.title}. ${STAGE_LABEL[entry.stage]}. Ceremony ${entry.ceremonyAt ? formatDate(entry.ceremonyAt) : 'not set'}.`,
    ),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  });
}
