import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { SWCFounders } from '@/utils/shared/zod/getSWCFounders'
import { cn } from '@/utils/web/cn'

export function FoundersCarousel({ founders }: { founders: SWCFounders | null }) {
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
            <ExternalLink className="mb-5 block shadow-lg" href={founder.data.companyUrl}>
              <div className="flex flex-col">
                <div className="relative h-72">
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
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
