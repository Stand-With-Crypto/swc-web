import { useMemo } from 'react'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { cn } from '@/utils/web/cn'

interface CampaignsCheckmarksProps {
  campaignsLength: number
  completedCampaigns: number
}

const MAX_CHECKS_TO_SHOW = 12
const ICONS_PER_ROW = Math.ceil(MAX_CHECKS_TO_SHOW / 2)

export function CampaignsCheckmarks({
  campaignsLength,
  completedCampaigns,
}: CampaignsCheckmarksProps) {
  const iconsToDisplay = Math.min(campaignsLength, MAX_CHECKS_TO_SHOW)
  const hasMoreThanMaxChecks = campaignsLength > MAX_CHECKS_TO_SHOW
  const hasPendingChecks = completedCampaigns < campaignsLength

  const checkIcons = useMemo(() => {
    return Array.from({ length: iconsToDisplay }, (_, index) => {
      let isCompleted = index < completedCampaigns && completedCampaigns > 0

      if (hasMoreThanMaxChecks && hasPendingChecks && index === iconsToDisplay - 1) {
        isCompleted = false
      }

      return (
        <CheckIcon
          completed={isCompleted}
          key={index}
          svgClassname={cn(
            'h-6 w-6 border-background box-content bg-muted lg:h-8 lg:w-8',
            index % ICONS_PER_ROW !== 0 && '-ml-4',
            { 'border-none': isCompleted && campaignsLength === 1 },
            { 'border-2 -mt-1': campaignsLength > 1 },
          )}
        />
      )
    })
  }, [iconsToDisplay, completedCampaigns, hasMoreThanMaxChecks, hasPendingChecks, campaignsLength])

  return (
    <div className="flex items-end">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${ICONS_PER_ROW}, min-content)`,
        }}
      >
        {checkIcons}
      </div>
      {hasMoreThanMaxChecks && <p className="ml-1 font-bold text-muted-foreground">...</p>}
    </div>
  )
}
