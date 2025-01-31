import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { SWCPartners } from '@/utils/shared/getSWCPartners'
import { INDUSTRY_PARTNERS } from '@/utils/shared/industryPartners'

function mapPartnerWithFallback(partners: SWCPartners | typeof INDUSTRY_PARTNERS) {
  return partners.map(partner => {
    if ('data' in partner) {
      return {
        name: partner.data.name,
        image: partner.data.image,
        imageLink: partner.data.imageLink,
        imageAlt: partner.data.imageAlt,
      }
    }

    return {
      name: partner.title,
      image: partner.imageSrc,
      imageLink: {
        Default: partner.url,
      },
      imageAlt: partner.title,
    }
  })
}

export function PartnerGrid({ partners }: { partners: SWCPartners | null }) {
  const currentPartners = mapPartnerWithFallback(partners || INDUSTRY_PARTNERS)

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-8">
      {currentPartners.map(currentParter => {
        const { name, image, imageLink, imageAlt } = currentParter

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
