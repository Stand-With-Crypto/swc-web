import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { INDUSTRY_PARTNERS } from '@/utils/shared/industryPartners'

export function PartnerGrid() {
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-8">
      {INDUSTRY_PARTNERS.map(({ title, url, imageSrc }) => {
        return (
          <ExternalLink href={url} key={title}>
            <div className="relative flex h-40 w-40 items-center rounded-lg border-[12px] border-secondary bg-secondary transition hover:drop-shadow-lg sm:h-56 sm:w-56 sm:border-[36px]">
              <NextImage
                alt={`${title} logo`}
                className="object-contain"
                fill
                priority
                quality={100}
                sizes={'(max-width: 768px) 160px, 224px'}
                src={imageSrc}
              />
            </div>
          </ExternalLink>
        )
      })}
    </div>
  )
}
