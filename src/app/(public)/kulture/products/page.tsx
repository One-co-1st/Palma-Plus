import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { AppWindow, Armchair, Camera, HeartHandshake, Shirt, Vibrate } from 'lucide-react';
import { Container, Section } from '@/components/palma/layout';
import { Masthead } from '@/components/palma/Masthead';
import { RevealGroup, RevealItem } from '@/components/motion/primitives';
import { Badge } from '@/components/ui/badge';
import { buildMetadata } from '@/lib/seo';
import { PRODUCT_CATEGORIES, MAX_VERDICT, type ProductCategoryKey } from '@/domain/product-library';
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
 * Every category gets one line mark, drawn the way the rest of PALMA's
 * iconography is drawn: monochrome, one stroke weight, no colour at all.
 * The mark is how a reader learns to scan the Library at speed.
 */
const CATEGORY_ICON = {
  production: Camera,
  studio: Armchair,
  wardrobe: Shirt,
  toys: Vibrate,
  software: AppWindow,
  business: HeartHandshake,
} satisfies Record<ProductCategoryKey, typeof Camera>;

/**
 * The Product Library, in public.
 *
 * Brief on purpose: a mark, a verdict, a one-line best-for and a sentence of
 * context, enough to decide on the run. Returns a 404 rather than an empty
 * page when the feature is off, because a page that exists and says "coming
 * soon" is a page advertising something that does not exist.
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
              const Icon = CATEGORY_ICON[category.key];

              return (
                <section key={category.key} className="mt-14 first:mt-0">
                  <div className="border-stone-deep flex items-center gap-3 border-b pb-3">
                    <span className="border-stone-deep bg-stone/30 text-taupe-deep flex size-8 items-center justify-center border">
                      <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <h2 className="palma-label text-taupe-deep">{category.label}</h2>
                    <span className="text-taupe ml-auto hidden text-xs sm:block">
                      {category.note}
                    </span>
                  </div>

                  <RevealGroup className="flex flex-col">
                    {inCategory.map((entry) => (
                      <RevealItem key={entry.slug}>
                        <article className="group border-stone-deep hover:bg-stone/25 -mx-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-b px-3 py-5 transition-colors duration-300 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-x-6">
                          <span className="border-stone-deep bg-ivory text-taupe-deep group-hover:border-champagne-deep group-hover:text-champagne-deep flex size-11 items-center justify-center border transition-colors duration-300">
                            <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                          </span>

                          <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex flex-wrap items-baseline gap-x-3">
                              <span className="palma-label text-taupe">{entry.brand}</span>
                              {entry.disclosure ? (
                                <Badge variant="muted">PALMA partner</Badge>
                              ) : null}
                            </div>
                            <h3 className="font-display text-lg leading-tight">{entry.name}</h3>
                            {entry.bestFor ? (
                              <p className="text-ink text-sm leading-snug">
                                Best for: {entry.bestFor}
                              </p>
                            ) : null}
                            <p className="text-taupe-deep line-clamp-2 text-sm leading-relaxed">
                              {entry.review}
                            </p>
                            {entry.externalUrl ? (
                              <a
                                href={entry.externalUrl}
                                rel="noopener noreferrer nofollow"
                                target="_blank"
                                className="palma-link text-ink mt-1 w-fit text-sm"
                              >
                                Where to find it
                              </a>
                            ) : null}
                          </div>

                          {entry.verdict !== null ? (
                            <div className="col-span-2 flex items-center gap-3 sm:col-span-1 sm:w-24 sm:flex-col sm:items-end sm:gap-1.5">
                              <span className="font-display text-champagne-deep text-2xl leading-none tabular-nums">
                                {entry.verdict.toFixed(1)}
                              </span>
                              <span
                                className="bg-stone-deep/50 h-0.5 w-24 overflow-hidden"
                                role="img"
                                aria-label={`PALMA verdict ${entry.verdict.toFixed(1)} out of ${MAX_VERDICT}`}
                              >
                                <span
                                  className="palma-meter bg-champagne-deep block h-full w-full"
                                  style={{ '--meter': entry.verdict / MAX_VERDICT } as CSSProperties}
                                />
                              </span>
                              <span className="palma-label text-taupe">Verdict</span>
                            </div>
                          ) : null}
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
