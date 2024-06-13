'use client'

import { FormattedNumber } from '@/components/ui/formattedNumber'
import { SupportedLocale } from '@/intl/locales'

export function TotalAdvocatesPerStateTooltip({
  hoveredState,
  getTotalAdvocatesPerState,
  locale,
}: {
  hoveredState: {
    name: string
    mousePosition: {
      x: number
      y: number
    }
  } | null
  getTotalAdvocatesPerState: (stateName: string) => number | undefined
  locale: SupportedLocale
}) {
  if (!hoveredState) return null

  const totalAdvocatesPerState = getTotalAdvocatesPerState(hoveredState.name)

  return totalAdvocatesPerState ? (
    <div
      className="absolute rounded-2xl bg-black px-2 py-1 font-sans text-white"
      style={{
        top: hoveredState.mousePosition.y,
        left: hoveredState.mousePosition.x,
        transform: 'translateX(-50%)',
      }}
    >
      <FormattedNumber amount={totalAdvocatesPerState} locale={locale} /> advocates
    </div>
  ) : null
}
