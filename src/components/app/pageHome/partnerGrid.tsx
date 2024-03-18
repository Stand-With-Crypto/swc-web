'use client'
import { useMemo } from 'react'

import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { INDUSTRY_PARTNERS } from '@/utils/shared/industryPartners'

export function PartnerGrid() {
  const hasHydrated = useHasHydrated()
  const visiblePartners = useMemo(() => {
    if (!hasHydrated) {
      return INDUSTRY_PARTNERS.slice(0, 5)
    }
    const shuffled = [...INDUSTRY_PARTNERS].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 5)
  }, [hasHydrated])

  return (
    <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row sm:gap-8">
      {visiblePartners.map(({ title, imageSrc }) => {
        return (
          <div className="relative flex h-20 w-44 items-center" key={title}>
            {!hasHydrated ? (
              <Skeleton className="h-20 w-44" />
            ) : (
              <NextImage
                alt={`${title} logo`}
                className="object-contain"
                fill
                priority
                quality={100}
                sizes={'(max-width: 768px) 160px, 224px'}
                src={imageSrc}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
