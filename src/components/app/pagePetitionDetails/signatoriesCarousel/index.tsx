'use client'

import React from 'react'
import { Edit3 } from 'lucide-react'

import * as BadgesAutomaticCarousel from '@/components/ui/badgesAutomaticCarousel'
import { FormattedRelativeDatetime } from '@/components/ui/formattedRelativeDatetime'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface LastSignature {
  locale: string
  datetimeSigned: string
}

interface SignatoriesCarouselProps {
  autoplayDelay?: number
  className?: string
  lastSignatures: LastSignature[]
  countryCode: SupportedCountryCodes
}

const MIN_SIGNATURES_TO_RENDER_LIST = 3

export function SignatoriesCarousel({
  autoplayDelay = 3000,
  className,
  lastSignatures,
  countryCode,
}: SignatoriesCarouselProps) {
  const shouldRenderList = lastSignatures.length > MIN_SIGNATURES_TO_RENDER_LIST

  return (
    <div className={cn('w-full', className)}>
      <BadgesAutomaticCarousel.Root autoplayDelay={autoplayDelay}>
        <BadgesAutomaticCarousel.Content>
          {shouldRenderList ? (
            lastSignatures.map((item, index) => {
              const signature = item
              return (
                <BadgesAutomaticCarousel.Item
                  className="flex items-center gap-2"
                  key={`${signature.locale}-${signature.datetimeSigned}-${index}`}
                  variant="muted"
                >
                  <span className="flex items-center gap-2 text-xs text-primary-cta">
                    <Edit3 className="h-4 w-4" />
                    Member from {signature.locale} signed
                  </span>
                  <span className="text-xs text-muted-foreground">
                    <FormattedRelativeDatetime
                      countryCode={countryCode}
                      date={new Date(signature.datetimeSigned)}
                      timeFormatStyle="narrow"
                    />
                  </span>
                </BadgesAutomaticCarousel.Item>
              )
            })
          ) : (
            <BadgesAutomaticCarousel.Item variant="muted">
              <span className="flex items-center gap-2 text-xs text-primary-cta">
                <Edit3 className="h-4 w-4" />
                Be the first to sign
              </span>
            </BadgesAutomaticCarousel.Item>
          )}
        </BadgesAutomaticCarousel.Content>
        {shouldRenderList && <BadgesAutomaticCarousel.Fade />}
      </BadgesAutomaticCarousel.Root>
    </div>
  )
}
