import { Container, Section } from '@/components/palma/layout';
import { Masthead } from '@/components/palma/Masthead';
import { SponsorBelt } from '@/components/palma/SponsorBelt';
import { buildMetadata } from '@/lib/seo';
import { CONTACTS } from '@/lib/legal';
import { listSponsors } from '@/server/data/queries';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Partners',
  description:
    'The partners who support PALMA, and what a season puts beside their name.',
  path: '/about/sponsors',
});

/**
 * Partners.
 *
 * A belt, not a brochure. The logos slide; the pitch fits in a breath;
 * anything longer lives in the competition rules where it is binding.
 */
export default async function SponsorsPage() {
  const sponsors = await listSponsors();

  return (
    <>
      <Masthead
        eyebrow="The institution"
        title="Partners"
        standfirst="The honours are watched by the whole industry. Our partners' names travel with them."
        meta={[`${sponsors.length} partners`, 'Seen all season']}
      />

      <Section className="py-10 sm:py-12">
        <SponsorBelt sponsors={sponsors} />
      </Section>

      <Section tone="stone" className="py-12 sm:py-14">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
            <p className="text-taupe-deep max-w-140 text-sm leading-relaxed">
              A partner is seen everywhere the season is: on these pages, at the ceremony, and in
              the record that outlives both. The audience is the industry itself, the creators,
              studios and buyers a partner most wants to reach.
            </p>
            <a
              href={`mailto:${CONTACTS.partnerships}`}
              className="palma-link text-ink shrink-0 text-sm"
            >
              Partner with PALMA
            </a>
          </div>
        </Container>
      </Section>
    </>
  );
}
