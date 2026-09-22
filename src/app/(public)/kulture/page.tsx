import Link from 'next/link';
import { Container, Section } from '@/components/palma/layout';
import { Masthead } from '@/components/palma/Masthead';
import { RevealGroup, RevealItem } from '@/components/motion/primitives';
import { buildMetadata } from '@/lib/seo';
import { featureLive } from '@/server/features';
import { listArticles } from '@/server/data/queries';

export const revalidate = 900;

export const metadata = buildMetadata({
  title: 'Kulture',
  description:
    'PALMA Kulture: the people, aesthetics, ideas, products and moments shaping UK adult creator culture.',
  path: '/kulture',
});

/**
 * Kulture.
 *
 * The editorial pillar, with the Journal inside it rather than beside it.
 * Deliberately narrow: writing, creator features, and a short Product Library.
 * No news feed, no press releases, no wire. PALMA is not an industry news site
 * and the surest way to become one is to build the room for it.
 */
export default async function KulturePage() {
  const [productsLive, articles] = await Promise.all([
    featureLive('product_library'),
    listArticles({ limit: 6 }),
  ]);

  return (
    <>
      <Masthead
        eyebrow="The editorial pillar"
        title="Kulture"
        titleLines={['Kulture']}
        standfirst="PALMA recognises work. Kulture is where it writes about it."
        meta={['Writing', 'Creator features', 'The Product Library']}
      />

      <Section className="py-14 sm:py-16">
        <Container>
          <RevealGroup className="border-stone-deep flex flex-col border-t">
            <Row
              href="/journal"
              label="The Journal"
              body="Stories, interviews and argument about the industry PALMA recognises."
            />
            <Row
              href="/creators"
              label="Creator records"
              body="The people, their honours, and where the work lives."
            />
            {productsLive ? (
              <Row
                href="/kulture/products"
                label="The Product Library"
                body="Things creators actually use, each with a short PALMA verdict."
              />
            ) : null}
          </RevealGroup>
        </Container>
      </Section>

      {articles.length > 0 ? (
        <Section tone="stone" className="py-16 sm:py-20">
          <Container>
            <h2 className="palma-label text-taupe-deep border-stone-deep border-b pb-4">
              Latest writing
            </h2>
            <RevealGroup className="flex flex-col">
              {articles.map((article) => (
                <RevealItem key={article.slug}>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="palma-row group/card border-stone-deep grid gap-3 border-b py-7 sm:grid-cols-12 sm:items-baseline sm:gap-8"
                  >
                    <span className="sm:col-span-5">
                      <span className="palma-row-lead font-display block text-2xl leading-tight">
                        {article.title}
                      </span>
                    </span>
                    <span className="text-taupe-deep text-sm leading-relaxed sm:col-span-7">
                      {article.standfirst}
                    </span>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

function Row({ href, label, body }: { href: string; label: string; body: string }) {
  return (
    <RevealItem>
      <Link
        href={href}
        className="palma-row group/card border-stone-deep grid gap-1 border-b py-5 sm:grid-cols-12 sm:items-baseline sm:gap-8"
      >
        <span className="font-display text-xl leading-tight sm:col-span-4">{label}</span>
        <span className="text-taupe-deep text-sm leading-relaxed sm:col-span-8">{body}</span>
      </Link>
    </RevealItem>
  );
}
