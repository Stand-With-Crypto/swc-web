'use client'

import React, { useEffect } from 'react'

export function ActionInfoTooltip({
  mousePosition,
  actionInfo,
  handleClearPressedState,
}: {
  mousePosition: { x: number; y: number } | null
  actionInfo: string | null
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

  if (!mousePosition || !actionInfo) return null

  const tooltipWidth = 193
  const offsetX = tooltipWidth / 2

  // Calculate the adjusted position so it does not overflow the window
  const centeredX = mousePosition.x - offsetX
  const adjustedX = Math.min(Math.max(centeredX, 0), window.innerWidth - tooltipWidth)

  return (
    <div
      className="pointer-events-none fixed z-50 flex h-[46px] w-[193px] items-center justify-center rounded-2xl bg-black px-1 font-sans text-base text-white"
      style={{
        top: mousePosition.y,
        left: adjustedX,
        transform: 'translate(0, -125%)',
        pointerEvents: 'none',
      }}
    >
      {actionInfo}
    </div>
  )
}
