'use client'

import { useMemo } from 'react'

import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { SWCPartners } from '@/utils/shared/getSWCPartners'

export function PartnerGrid({ partners }: { partners: SWCPartners | null }) {
  const hasHydrated = useHasHydrated()
  const visiblePartners = useMemo(() => {
    if (!hasHydrated) {
      return partners?.slice(0, 5)
    }
    const shuffled = [...(partners ?? [])].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 5)
  }, [hasHydrated, partners])

  return (
    <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row sm:gap-8">
      {visiblePartners?.map(currentPartner => {
        const { image, imageAlt } = currentPartner.data

        return (
          <div className="relative flex h-20 w-44 items-center" key={image}>
            {!hasHydrated ? (
              <Skeleton className="h-20 w-44" />
            ) : (
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
            )}
          </div>
        )
      })}
    </div>
  )
}
