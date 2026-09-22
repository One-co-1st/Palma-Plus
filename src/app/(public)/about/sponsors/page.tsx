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
 *
 * A sponsor's mark is whatever they gave us: an https link to their own logo,
 * a file we host under /sponsors, or nothing at all, in which case the name
 * itself is the mark and slides in the belt as type. External links render
 * through a plain <img> on purpose: the image optimizer proxies nothing, and
 * a partner's own CDN can serve a partner's own mark.
 */
export default async function SponsorsPage() {
  const sponsors = await listSponsors();

  return (
    <>
      <Masthead
        eyebrow="The institution"
        title="Partners"
        standfirst="Sponsorship pays for the ceremony, the archive and the screening team. It buys no influence over judging. None is for sale."
        meta={[`${sponsors.length} partners`, 'No influence over judging']}
      />

      {sponsors.length > 0 ? (
        <Section className="py-10 sm:py-12">
          <div className="palma-belt border-stone-deep border-y py-6">
            <div className="palma-belt-track">
              {[...sponsors, ...sponsors].map((sponsor, index) => {
                const mark = sponsor.logoUrl ? (
                  sponsor.logoUrl.startsWith('/') ? (
                    <Image
                      src={sponsor.logoUrl}
                      alt={`${sponsor.name} logo`}
                      width={240}
                      height={40}
                      className="h-9 w-auto sm:h-10"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logoUrl}
                      alt={`${sponsor.name} logo`}
                      className="h-9 w-auto sm:h-10"
                      loading="lazy"
                    />
                  )
                ) : (
                  <span className="font-display text-ink text-xl whitespace-nowrap sm:text-2xl">
                    {sponsor.name}
                  </span>
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
                        {mark}
                      </a>
                    ) : (
                      mark
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
