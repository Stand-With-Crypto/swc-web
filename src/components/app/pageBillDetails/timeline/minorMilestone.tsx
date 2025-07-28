'use client'

import { CSSProperties, useMemo, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip'

import { Milestone } from '@/components/app/pageBillDetails/timeline/types'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface MinorMilestoneProps {
  countryCode: SupportedCountryCodes
  isHighlightEnabled?: boolean
  isMobile: boolean
  milestone: Milestone
}

const POINT_FIXED_SPACING = 30
const POINT_SIZE = 20

export function MinorMilestone({
  countryCode,
  isHighlightEnabled,
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
        'absolute cursor-pointer rounded-full border-4 border-[#F2F5F9] transition-colors duration-500',
        isHighlightEnabled ? 'bg-primary-cta hover:border-[#A97BFC]' : 'bg-[#5B616E]',
      )}
      style={styles}
    />
  )

  const content = (
    <div className="max-w-xs space-y-1 bg-white p-4 font-sans">
      <h3 className="text-base font-bold text-foreground">{milestone.title}</h3>
      <p className="text-xs text-muted-foreground">
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

  return <WithTooltipOrDialog content={content} isMobile={isMobile} trigger={trigger} />
}

function WithTooltipOrDialog({
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
          className="max-h-36 w-full max-w-64 px-0 !pt-8 md:px-0"
        >
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip
        delayDuration={250}
        onOpenChange={setIsTooltipOrDialogOpen}
        open={isTooltipOrDialogOpen}
      >
        <TooltipTrigger asChild onClick={() => setIsTooltipOrDialogOpen(true)}>
          {trigger}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={16}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
