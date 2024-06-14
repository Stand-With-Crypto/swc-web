'use client'

import React from 'react'

import { FormattedNumber } from '@/components/ui/formattedNumber'
import { SupportedLocale } from '@/intl/locales'

export function TotalAdvocatesPerStateTooltip({
  hoveredStateName,
  mousePosition,
  getTotalAdvocatesPerState,
  locale,
}: {
  hoveredStateName: string | null
  mousePosition: { x: number; y: number } | null
  getTotalAdvocatesPerState: (stateName: string) => number | undefined
  locale: SupportedLocale
}) {
  if (!mousePosition || !hoveredStateName) return null

  const totalAdvocatesPerState = getTotalAdvocatesPerState(hoveredStateName)

  return totalAdvocatesPerState ? (
    <div
      className="pointer-events-none fixed z-50 flex h-[46px] w-[193px] items-center justify-center rounded-2xl bg-black px-1 font-sans text-base text-white"
      style={{
        top: mousePosition.y,
        left: mousePosition.x,
        transform: 'translate(-50%, -200%)',
        pointerEvents: 'none',
      }}
    >
      <FormattedNumber amount={totalAdvocatesPerState} locale={locale} /> advocates
    </div>
  ) : null
}
