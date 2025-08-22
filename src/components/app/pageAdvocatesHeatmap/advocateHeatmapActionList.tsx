'use client'

import { ADVOCATES_ACTIONS } from '@/components/app/pageAdvocatesHeatmap/constants'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/web/cn'

export function AdvocateHeatmapActionList({ isEmbedded }: { isEmbedded?: boolean }) {
  const isMobile = useIsMobile()

  return (
    <div
      className={cn(
        'flex flex-row justify-around gap-3 md:justify-between',
        isEmbedded
          ? 'w-full text-white md:w-[auto] md:flex-col'
          : 'w-full items-center rounded-[24px] bg-purple-light px-10 py-8 text-purple-dark',
      )}
    >
      {!isEmbedded && <strong>Key</strong>}
      {Object.entries(ADVOCATES_ACTIONS).map(([key, action]) => {
        const ActionIcon = action.icon

        return (
          <div
            className={cn('flex flex-col items-center gap-3 font-sans text-base md:flex-row')}
            key={key}
          >
            <ActionIcon className="w-8 md:w-10" />
            <strong className="text-sm lg:text-base">
              {isMobile ? action.labelMobile : action.label}
            </strong>
          </div>
        )
      })}
    </div>
  )
}
