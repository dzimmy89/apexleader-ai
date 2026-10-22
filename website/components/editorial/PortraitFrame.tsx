import Image from "next/image";
import { cn } from "@/lib/utils";

export const FOUNDER_PORTRAIT = {
  src: "/images/david-zimmerman-portrait.jpg",
  width: 636,
  height: 794,
  alt: "David Zimmerman, founder of ApexLeader.ai",
} as const;

/** Parchment-framed portrait. The curtain reveal animates an overlay, not the image, so LCP is not delayed. */
export function PortraitFrame({
  caption,
  eager = false,
  sizes = "(min-width: 1024px) 380px, (min-width: 768px) 40vw, 90vw",
  reveal = false,
  className,
}: {
  caption?: React.ReactNode;
  /** Load without a preload: the hero frame is hidden on phones, where a preload would compete with the LCP text. */
  eager?: boolean;
  sizes?: string;
  reveal?: boolean;
  className?: string;
}) {
  return (
    <figure className={cn("parchment-card p-3 md:p-4", className)}>
      <div className={cn("relative aspect-[4/5] overflow-hidden", reveal && "portrait-curtain")}>
        <Image
          src={FOUNDER_PORTRAIT.src}
          alt={FOUNDER_PORTRAIT.alt}
          width={FOUNDER_PORTRAIT.width}
          height={FOUNDER_PORTRAIT.height}
          loading={eager ? "eager" : "lazy"}
          sizes={sizes}
          className="h-full w-full object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] font-medium text-muted-on-parchment">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
