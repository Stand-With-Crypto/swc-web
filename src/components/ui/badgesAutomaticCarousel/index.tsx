'use client'

import * as React from 'react'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react'

import { type BadgeProps, badgeVariants } from '@/components/ui/badge'
import { cn } from '@/utils/web/cn'

type CarouselApi = UseEmblaCarouselType[1]

interface CarouselProps {
  autoplayDelay?: number
}

interface CarouselContextProps {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useBadgesAutomaticCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useBadgesAutomaticCarousel must be used within a <BadgesAutomaticCarousel />')
  }

  return context
}

const BadgesAutomaticCarousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ autoplayDelay = 2000, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      axis: 'x',
      loop: true,
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: false,
      slidesToScroll: 1,
    },
    [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  )

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
      }}
    >
      <div
        aria-roledescription="carousel"
        className={cn('relative', className)}
        ref={ref}
        role="region"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
})
BadgesAutomaticCarousel.displayName = 'BadgesAutomaticCarousel'

const BadgesAutomaticCarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef } = useBadgesAutomaticCarousel()

  return (
    <div className="overflow-hidden" ref={carouselRef}>
      <div className={cn('flex', className)} ref={ref} {...props} />
    </div>
  )
})
BadgesAutomaticCarouselContent.displayName = 'BadgesAutomaticCarouselContent'

const BadgesAutomaticCarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & BadgeProps
>(({ className, variant, ...props }, ref) => {
  return (
    <div
      aria-roledescription="slide"
      className={cn(
        'mr-2 min-w-0 shrink-0 grow-0 basis-auto select-none',
        badgeVariants({ variant }),
        'px-4 py-2',
        className,
      )}
      ref={ref}
      role="group"
      {...props}
    />
  )
})
BadgesAutomaticCarouselItem.displayName = 'BadgesAutomaticCarouselItem'

const BadgesAutomaticCarouselFade = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    width?: 'w-8' | 'w-12' | 'w-16' | 'w-20' | 'w-24'
    color?: string
  }
>(({ className, width = 'w-16', color = 'from-white', ...props }, ref) => {
  return (
    <div
      className={cn(
        'pointer-events-none absolute right-0 top-0 h-full bg-gradient-to-l to-transparent',
        width,
        color,
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
BadgesAutomaticCarouselFade.displayName = 'BadgesAutomaticCarouselFade'

export {
  type CarouselApi,
  BadgesAutomaticCarouselContent as Content,
  BadgesAutomaticCarouselFade as Fade,
  BadgesAutomaticCarouselItem as Item,
  BadgesAutomaticCarousel as Root,
  useBadgesAutomaticCarousel,
}

// Default export for namespace import
const BadgesAutomaticCarouselNamespace = {
  Root: BadgesAutomaticCarousel,
  Content: BadgesAutomaticCarouselContent,
  Fade: BadgesAutomaticCarouselFade,
  Item: BadgesAutomaticCarouselItem,
}

export default BadgesAutomaticCarouselNamespace
