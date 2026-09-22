import Image from 'next/image';
import { Container, Section } from '@/components/palma/layout';
import { Masthead } from '@/components/palma/Masthead';
import { buildMetadata } from '@/lib/seo';
import { CONTACTS } from '@/lib/legal';
import { listSponsors } from '@/server/data/queries';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'Partners',
  description: 'The partners who support PALMA, and the one thing their money cannot reach.',
  path: '/about/sponsors',
});

/**
 * Partners.
 *
 * A belt, not a brochure. The logos slide; the terms fit in a sentence;
 * anything longer lives in the competition rules where it is binding.
 */
export default async function SponsorsPage() {
  const sponsors = await listSponsors();
  const withLogos = sponsors.filter((sponsor) => sponsor.logoUrl);

  return (
    <>
      <Masthead
        eyebrow="The institution"
        title="Partners"
        standfirst="Sponsorship pays for the ceremony, the archive and the screening team. It buys no influence over judging — none is for sale."
        meta={[`${sponsors.length} partners`, 'No influence over judging']}
      />

      {withLogos.length > 0 ? (
        <Section className="py-10 sm:py-12">
          <div className="palma-belt border-stone-deep border-y py-6">
            <div className="palma-belt-track">
              {[...withLogos, ...withLogos].map((sponsor, index) => {
                const logo = (
                  <Image
                    src={sponsor.logoUrl as string}
                    alt={`${sponsor.name} logo`}
                    width={240}
                    height={40}
                    className="h-9 w-auto sm:h-10"
                  />
                );
                return (
                  <span
                    key={`${sponsor.slug}-${index}`}
                    className="flex shrink-0 items-center px-8 sm:px-12"
                  >
                    {sponsor.websiteUrl ? (
                      <a
                        href={sponsor.websiteUrl}
                        rel="noopener noreferrer sponsored nofollow"
                        target="_blank"
                        aria-label={sponsor.name}
                        className="transition-opacity hover:opacity-70"
                      >
                        {logo}
                      </a>
                    ) : (
                      logo
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </Section>
      ) : null}

      <Section tone="stone" className="py-12 sm:py-14">
        <Container>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
            <p className="text-taupe-deep max-w-140 text-sm leading-relaxed">
              A partner’s name appears here and on the page of any category it supports. That is
              the whole of it: no sight of a score, no path to a judge, no early word of a result.
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
