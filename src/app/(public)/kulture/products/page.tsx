import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Section } from '@/components/palma/layout';
import { Masthead } from '@/components/palma/Masthead';
import { RevealGroup, RevealItem } from '@/components/motion/primitives';
import { Badge } from '@/components/ui/badge';
import { buildMetadata } from '@/lib/seo';
import { PRODUCT_CATEGORIES } from '@/domain/product-library';
import { listPublishedProducts } from '@/server/data/product-library';
import { featureLive } from '@/server/features';

export const revalidate = 900;

export const metadata = buildMetadata({
  title: 'The Product Library',
  description:
    'A short, curated list of products genuinely relevant to creators, each with a PALMA verdict. No affiliate links, ever.',
  path: '/kulture/products',
});

/**
 * The Product Library, in public.
 *
 * Brief on purpose: a verdict, a one-line best-for and a sentence of context —
 * enough to decide on the run. Returns a 404 rather than an empty page when
 * the feature is off, because a page that exists and says "coming soon" is a
 * page advertising something that does not exist.
 */
export default async function ProductLibraryPage() {
  if (!(await featureLive('product_library'))) notFound();

  const entries = await listPublishedProducts();

  return (
    <>
      <Masthead
        eyebrow={
          <>
            <Link href="/kulture" className="palma-link">
              Kulture
            </Link>
            {' · '}
            The Product Library
          </>
        }
        title="The Product Library"
        titleLines={['The Product', 'Library']}
        standfirst="Things creators actually use, looked at honestly. No affiliate links, ever."
        meta={[`${entries.length} entries`, 'No affiliate links', 'Verdicts written by PALMA']}
      />

      <Section className="py-12 sm:py-14">
        <Container>
          {entries.length === 0 ? (
            <p className="text-taupe-deep max-w-160 leading-relaxed">Nothing published yet.</p>
          ) : (
            PRODUCT_CATEGORIES.map((category) => {
              const inCategory = entries.filter((entry) => entry.category === category.key);
              if (inCategory.length === 0) return null;

              return (
                <section key={category.key} className="mt-12 first:mt-0">
                  <h2 className="palma-label text-taupe-deep border-stone-deep border-b pb-3">
                    {category.label}
                  </h2>

                  <RevealGroup className="flex flex-col">
                    {inCategory.map((entry) => (
                      <RevealItem key={entry.slug}>
                        <article className="border-stone-deep grid gap-2 border-b py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6">
                          <div className="flex items-baseline gap-3 sm:col-span-4">
                            {entry.verdict !== null ? (
                              <span className="font-display text-champagne-deep w-12 shrink-0 text-xl tabular-nums">
                                {entry.verdict.toFixed(1)}
                              </span>
                            ) : null}
                            <div className="min-w-0">
                              <span className="palma-label text-taupe">{entry.brand}</span>
                              <h3 className="font-display text-lg leading-tight">{entry.name}</h3>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 sm:col-span-7">
                            {entry.bestFor ? (
                              <p className="text-ink text-sm leading-snug">
                                Best for: {entry.bestFor}
                              </p>
                            ) : null}
                            <p className="text-taupe-deep line-clamp-2 text-sm leading-relaxed">
                              {entry.review}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 sm:col-span-1 sm:justify-end">
                            {entry.disclosure ? <Badge variant="muted">PALMA partner</Badge> : null}
                            {entry.externalUrl ? (
                              <a
                                href={entry.externalUrl}
                                rel="noopener noreferrer nofollow"
                                target="_blank"
                                className="palma-link text-ink shrink-0 text-sm"
                              >
                                Find it
                              </a>
                            ) : null}
                          </div>
                        </article>
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </section>
              );
            })
          )}
        </Container>
      </Section>
    </>
  );
}
