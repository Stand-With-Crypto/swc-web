'use client'

import { CSSProperties, useMemo, useState } from 'react'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { MINOR_MILESTONE_CONFIG } from '@/components/ui/timeline/constants'
import { Milestone } from '@/components/ui/timeline/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

const { POINT_FIXED_SPACING, POINT_SIZE } = MINOR_MILESTONE_CONFIG

interface MinorMilestoneProps {
  countryCode: SupportedCountryCodes
  isEnabled?: boolean
  isMobile: boolean
  milestone: Milestone
}

export function MinorMilestone({
  countryCode,
  isEnabled = true,
  isMobile,
  milestone,
}: MinorMilestoneProps) {
  const styles: CSSProperties = useMemo(() => {
    const pointDynamicSpacing = `calc(${milestone.positionPercent.toFixed(2)}% - ${POINT_SIZE / 2}px)`

    return {
      height: POINT_SIZE,
      width: POINT_SIZE,
      ...(isMobile
        ? {
            left: POINT_FIXED_SPACING,
            top: pointDynamicSpacing,
          }
        : {
            left: pointDynamicSpacing,
            top: POINT_FIXED_SPACING,
          }),
    }
  }, [isMobile, milestone.positionPercent])

  const trigger = (
    <div
      className={cn(
        'absolute cursor-pointer rounded-full border-4 border-gray-100 transition-all',
        isEnabled ? 'bg-primary-cta hover:border-purple-300' : 'bg-muted-foreground',
        milestone.isHighlighted && (isEnabled ? 'scale-100' : 'scale-90'),
      )}
      style={styles}
    />
  )

  const content = (
    <div className="max-w-xs space-y-1 font-sans">
      <h3 className="text-base font-bold text-foreground">{milestone.title}</h3>
      <p className="text-xs font-medium text-muted-foreground">
        {milestone.date && (
          <span className="text-black">
            <FormattedDatetime
              date={milestone.date}
              dateStyle="medium"
              locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
            />{' '}
            -
          </span>
        )}{' '}
        {milestone.description}
      </p>
    </div>
  )

  return <MinorMilestoneWrapper content={content} isMobile={isMobile} trigger={trigger} />
}

function MinorMilestoneWrapper({
  content,
  isMobile,
  trigger,
}: {
  content: React.ReactNode
  isMobile: boolean
  trigger: React.ReactNode
}) {
  const [isTooltipOrDialogOpen, setIsTooltipOrDialogOpen] = useState(false)

  if (isMobile) {
    return (
      <Dialog
        analytics={{ Category: 'Bill Timeline' }}
        onOpenChange={setIsTooltipOrDialogOpen}
        open={isTooltipOrDialogOpen}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          a11yTitle="Bill key date details"
          className="max-h-32 w-full max-w-72 rounded-md px-4 !pt-10"
        >
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip onOpenChange={setIsTooltipOrDialogOpen} open={isTooltipOrDialogOpen}>
        <TooltipTrigger asChild onClick={event => event.preventDefault()}>
          {trigger}
        </TooltipTrigger>
        <TooltipContent
          className="bg-white p-4"
          onPointerDownOutside={event => event.preventDefault()}
          side="top"
          sideOffset={16}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
