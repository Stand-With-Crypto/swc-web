'use client'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SWCFounder } from '@/utils/shared/zod/getSWCFounders'
import { cn } from '@/utils/web/cn'

export function FoundersCarousel({ founders }: { founders: SWCFounder[] | null }) {
  const isMobile = useIsMobile()

  if (!founders) return null

  if (isMobile) {
    return (
      <Carousel
        autoplay
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {founders?.map((founder, index) => (
            <CarouselItem
              className={cn('max-w-72 pl-3', {
                'ml-auto': index === 0,
                'mr-auto': index === founders.length - 1,
              })}
              key={founder.data.name}
            >
              <FounderCard founder={founder} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    )
  }

  return (
    <div className="container flex flex-row flex-wrap justify-center gap-6">
      {founders.map(founder => (
        <FounderCard className="w-[28%]" founder={founder} key={founder.data.name} />
      ))}
      {founders.length % 3 !== 0 && (
        <div className={`col-span-${3 - (founders.length % 3)} flex justify-center`} />
      )}
    </div>
  )
}

function FounderCard({ founder, className }: { founder: SWCFounder; className?: string }) {
  const isMobile = useIsMobile()

  return (
    <ExternalLink
      className={cn('block shadow-lg', className, {
        'mb-5': isMobile,
      })}
      href={founder.data.companyUrl}
    >
      <div className={'flex flex-col'}>
        <div className="relative h-72 sm:h-72 md:h-60 lg:h-72">
          <NextImage
            alt={`Profile picture of ${founder.data.name}`}
            className="object-cover"
            fill
            src={founder.data.image}
            unoptimized
          />
        </div>
        <div className="p-2 text-left sm:p-4">
          <p className="text-md text-primary sm:text-lg">{founder.data.name}</p>
          <p className="mt-2 text-xs text-gray-600 text-secondary-foreground sm:text-sm">
            {founder.data.companyName}
          </p>
        </div>
      </div>
    </ExternalLink>
  )
}
