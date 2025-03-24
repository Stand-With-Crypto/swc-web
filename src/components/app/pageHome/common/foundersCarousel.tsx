import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { SWCFounders } from '@/utils/shared/zod/getSWCFounders'

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
        {founders?.map(founder => (
          <CarouselItem
            className="basis-2/5 pl-3 sm:pl-5 md:basis-[31%] lg:basis-1/4 xl:basis-[21.55%]"
            key={founder.data.name}
          >
            <ExternalLink className="mb-5 block shadow-lg" href={founder.data.founderLink}>
              <div className="flex flex-col">
                <div className="relative h-64 md:h-80">
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
