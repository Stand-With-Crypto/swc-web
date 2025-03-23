import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { SWCFounders } from '@/utils/shared/zod/getSWCFounders'

export function FoundersCarousel({ founders }: { founders: SWCFounders | null }) {
  return (
    <Carousel
      opts={{
        loop: true,
      }}
      className="w-full"
      autoplay
    >
      <CarouselContent className="mb-4">
        {founders?.map(founder => (
          <CarouselItem
            key={founder.data.name}
            className="basis-2/5 pl-3 sm:pl-5 md:basis-[31%] lg:basis-1/4 xl:basis-[21.55%]"
          >
            <ExternalLink href={founder.data.founderLink} className="mb-5 block shadow-lg">
              <div className="flex flex-col">
                <div className="relative h-64 md:h-80">
                  <NextImage
                    src={founder.data.image}
                    alt={`Profile picture of ${founder.data.name}`}
                    className="object-cover"
                    fill
                    unoptimized
                  />
                </div>
                <div className="p-2 text-left sm:p-4">
                  <p className="text-md text-primary sm:text-lg">{founder.data.name}</p>
                  <p className="mt-2 text-xs text-gray-600 text-secondary-foreground sm:text-sm">
                    {founder.data.at}
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
