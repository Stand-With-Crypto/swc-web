'use client'

import React, { useEffect } from 'react'

import { FormattedNumber } from '@/components/ui/formattedNumber'
import { pluralize } from '@/utils/shared/pluralize'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

export function TotalAdvocatesPerStateTooltip({
  hoveredStateName,
  mousePosition,
  getTotalAdvocatesPerState,
  countryCode,
  handleClearPressedState,
}: {
  hoveredStateName: string | null
  mousePosition: { x: number; y: number } | null
  getTotalAdvocatesPerState: (stateName: string) => number | undefined
  countryCode: SupportedCountryCodes
  handleClearPressedState: () => void
}) {
  useEffect(() => {
    const handleInteraction = () => {
      handleClearPressedState()
    }

    window.addEventListener('scroll', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)
    window.addEventListener('touchmove', handleInteraction)

    return () => {
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('touchmove', handleInteraction)
    }
  }, [handleClearPressedState])

  if (!mousePosition || !hoveredStateName) return null

  const totalAdvocatesPerState = getTotalAdvocatesPerState(hoveredStateName) ?? 0

  const formattedNumber = FormattedNumber({
    amount: totalAdvocatesPerState,
    locale: COUNTRY_CODE_TO_LOCALE[countryCode],
  })
  const pluralizedAdvocate = pluralize({ count: totalAdvocatesPerState, singular: 'advocate' })
  const tooltipContent = `${formattedNumber} ${pluralizedAdvocate} in ${hoveredStateName}`

  const tooltipWidth = tooltipContent.length * 10
  const offsetX = tooltipWidth / 2

  // Calculate the adjusted position so it does not overflow the window
  const centeredX = mousePosition.x - offsetX
  const adjustedX = Math.min(Math.max(centeredX, 0), window.innerWidth - tooltipWidth)

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 flex h-[46px] items-center justify-center rounded-2xl bg-black px-4 font-sans text-base text-white',
        `w-[${tooltipWidth}px]`,
      )}
      style={{
        top: mousePosition.y,
        left: adjustedX,
        transform: 'translate(0, -125%)',
        pointerEvents: 'none',
      }}
    >
      {tooltipContent}
    </div>
  )
}
