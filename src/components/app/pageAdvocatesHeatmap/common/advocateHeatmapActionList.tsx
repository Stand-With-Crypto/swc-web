'use client'

import { ReactNode } from 'react'
import { UserActionType } from '@prisma/client'

import { IconProps } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapIcons'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/web/cn'

export type ActionListItem = Partial<
  Record<
    UserActionType,
    {
      icon: (args: IconProps) => ReactNode
      label: string
      labelMobile: string
      labelActionTooltip: (extraText?: string) => string
    }
  >
>

export function AdvocateHeatmapActionList({
  actionList,
  isEmbedded,
}: {
  actionList: ActionListItem
  isEmbedded?: boolean
}) {
  const isMobile = useIsMobile()

  return (
    <div
      className={cn(
        'flex  flex-row justify-around gap-3  md:justify-between',
        isEmbedded
          ? 'w-full md:w-[auto] md:flex-col'
          : 'w-full items-center rounded-[24px] bg-[#FBF8FF] px-10 py-8',
      )}
    >
      {!isEmbedded && (
        <div className="flex-0">
          <strong>Key</strong>
        </div>
      )}
      <div className="flex flex-1 flex-row justify-around gap-3">
        {Object.entries(actionList).map(([key, action]) => {
          const ActionIcon = action.icon

          return (
            <div
              className={cn(
                'flex flex-col items-center gap-3 font-sans text-base md:flex-row',
                isEmbedded ? 'text-white' : 'text-black',
              )}
              key={key}
            >
              <ActionIcon className="w-8 md:w-10" />
              <span className="text-xs">{isMobile ? action.labelMobile : action.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
