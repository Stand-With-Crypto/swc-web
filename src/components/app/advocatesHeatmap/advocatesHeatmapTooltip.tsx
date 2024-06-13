'use client'

import React, { useEffect, useState } from 'react'

import { FormattedNumber } from '@/components/ui/formattedNumber'
import { SupportedLocale } from '@/intl/locales'

export function TotalAdvocatesPerStateTooltip({
  currentState,
  getTotalAdvocatesPerState,
  locale,
}: {
  currentState: string | null
  getTotalAdvocatesPerState: (stateName: string) => number | undefined
  locale: SupportedLocale
}) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  if (!mousePosition || !currentState) return null

  const totalAdvocatesPerState = getTotalAdvocatesPerState(currentState)

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
