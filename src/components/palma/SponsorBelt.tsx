import Image from 'next/image';
import type { SponsorView } from '@/server/data/types';

/**
 * The partner belt.
 *
 * One continuous slide of every active partner's mark, twice around so the
 * loop has no seam. A mark is whatever the partner gave us: an https link to
 * their own logo, a file we host under /sponsors, or nothing at all, in which
 * case the name itself is the mark and slides as type. External marks render
 * through a plain <img> on purpose: the image optimizer proxies nothing, and
 * a partner's own CDN can serve a partner's own mark.
 *
 * Renders nothing when there are no partners: a belt announcing an empty
 * partnership programme is worse than no belt.
 */
export function SponsorBelt({ sponsors }: { sponsors: SponsorView[] }) {
  if (sponsors.length === 0) return null;

  return (
    <div className="palma-belt border-stone-deep border-y py-6" aria-label="PALMA partners">
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
  );
}
