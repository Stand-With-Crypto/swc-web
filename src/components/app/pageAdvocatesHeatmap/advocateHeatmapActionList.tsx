'use client'

import { ADVOCATES_ACTIONS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { useIsMobile } from '@/hooks/useIsMobile'

export function AdvocateHeatmapActionList({ isEmbedded }: { isEmbedded?: boolean }) {
  const isMobile = useIsMobile()

  return (
    <div
      className={`flex  flex-row justify-around gap-3  md:justify-between ${isEmbedded ? 'w-full md:w-[auto] md:flex-col' : 'w-full items-center rounded-[40px] bg-[#FBF8FF] px-10 py-8'}`}
    >
      {!isEmbedded && <strong>Key</strong>}
      {Object.entries(ADVOCATES_ACTIONS).map(([key, action]) => {
        const ActionIcon = action.icon

        return (
          <div
            className={`flex flex-col items-center gap-3 font-sans text-base md:flex-row ${isEmbedded ? 'text-white' : 'text-black'}`}
            key={key}
          >
            <ActionIcon className="w-8 md:w-10" />
            <span className="text-xs">
              {isEmbedded ? '' : 'Someone '}
              {isMobile ? action.labelMobile : action.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
