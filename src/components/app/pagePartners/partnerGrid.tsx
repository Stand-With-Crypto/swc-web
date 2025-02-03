import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { SWCPartners } from '@/utils/shared/getSWCPartners'

export function PartnerGrid({ partners }: { partners: SWCPartners | null }) {
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-8">
      {partners?.map(currentPartner => {
        const { name, image, imageLink, imageAlt } = currentPartner.data

        return (
          <ExternalLink href={imageLink.Default} key={name}>
            <div className="relative flex h-40 w-40 items-center rounded-lg border-[12px] border-secondary bg-secondary transition hover:drop-shadow-lg sm:h-56 sm:w-56 sm:border-[36px]">
              <NextImage
                alt={imageAlt}
                className="object-contain"
                fill
                priority
                quality={100}
                sizes={'(max-width: 768px) 160px, 224px'}
                src={image}
                unoptimized
              />
            </div>
          </ExternalLink>
        )
      })}
    </div>
  )
}
