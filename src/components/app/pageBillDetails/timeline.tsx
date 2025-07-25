'use client'

import { useState } from 'react'
import { Check, ScrollTextIcon, XIcon } from 'lucide-react'

import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

export interface TimelinePlotPoint {
  date: Date | string | null
  description: string
  isHighlighted?: boolean
  isMajorMilestone?: boolean
  success: boolean
  title: string
}

interface Milestone extends TimelinePlotPoint {
  date: Date | null
  leftPositionPercent: number
}

interface TimelineProps {
  countryCode: SupportedCountryCodes
  plotPoints: TimelinePlotPoint[]
}

export function Timeline(props: TimelineProps) {
  const plotPoints = props.plotPoints.map(point => ({
    ...point,
    date: point.date ? (point.date instanceof Date ? point.date : new Date(point.date)) : null,
  }))

  const majorMilestones = plotPoints
    .filter(plotPoint => plotPoint.isMajorMilestone)
    .map((point, index, points) => {
      return {
        ...point,
        leftPositionPercent: (index * 100) / (points.length - 1),
      }
    })

  const minorMilestones = plotPoints
    .filter(plotPoint => !plotPoint.isMajorMilestone)
    .map(point => {
      const parentMilestoneIndex = majorMilestones.findLastIndex(majorMilestone =>
        majorMilestone.date && point.date
          ? majorMilestone.date.getTime() < point.date.getTime()
          : false,
      )

      return {
        ...point,
        parentMilestoneIndex,
        parentMilestone: majorMilestones[parentMilestoneIndex],
      }
    })
    .map((point, _index, points) => {
      const maxLength = 100 / (majorMilestones.length - 1)

      const siblings = points.filter(
        ({ parentMilestoneIndex }) => parentMilestoneIndex === point.parentMilestoneIndex,
      )

      const xPos = maxLength / (siblings.length + 1)

      const index = siblings.findIndex(({ date }) =>
        date && point.date ? date.getTime() === point.date.getTime() : false,
      )

      return {
        ...point,
        leftPositionPercent: point.parentMilestone.leftPositionPercent + xPos * (index + 1),
      }
    })

  const lastHighlightedMilestoneDate = plotPoints.findLast(point => point.isHighlighted)?.date
  const currentMilestone = [...majorMilestones, ...minorMilestones].find(
    point => point.date === lastHighlightedMilestoneDate,
  )

  return (
    <div className="relative mx-auto h-[160px] w-[calc(100%-240px)]">
      <div className="absolute left-0 top-[39px] h-0.5 w-full bg-[rgba(91,97,110,.5)]" />
      <div
        className="absolute left-0 top-[39px] h-0.5 bg-primary-cta"
        style={{
          width: `${currentMilestone?.leftPositionPercent.toFixed(2) || 0}%`,
        }}
      />

      {majorMilestones.map((majorMilestone, index) => {
        return (
          <MajorMilestone
            countryCode={props.countryCode}
            isFirst={index === 0}
            key={index}
            milestone={majorMilestone}
          />
        )
      })}

      {minorMilestones.map((minorMilestone, index) => {
        return (
          <MinorMilestone countryCode={props.countryCode} key={index} milestone={minorMilestone} />
        )
      })}
    </div>
  )
}

function MajorMilestone({
  countryCode,
  isFirst,
  milestone,
}: {
  countryCode: SupportedCountryCodes
  isFirst: boolean
  milestone: Milestone
}) {
  const iconProps = {
    className: 'mt-0.5',
    color: 'white',
    size: 24,
  }

  const StatusIcon = milestone.success ? Check : XIcon

  const Icon = isFirst ? ScrollTextIcon : StatusIcon

  return (
    <>
      <div
        className={cn(
          'absolute flex items-center justify-center rounded-full',
          milestone.isHighlighted
            ? 'top-[20px] h-[40px] w-[40px] bg-primary-cta'
            : 'top-[28px] h-[24px] w-[24px] border-2 border-[rgba(91,97,110,.5)] bg-[#F2F5F9]',
          { 'bg-destructive': !milestone.success },
        )}
        style={{
          left: `calc(${milestone.leftPositionPercent.toFixed(2)}% - ${milestone.isHighlighted ? 20 : 12}px)`,
        }}
      >
        {milestone.isHighlighted && <Icon {...iconProps} />}
      </div>
      <div
        className="absolute top-[80px] flex w-[200px] flex-col items-center gap-3 font-sans"
        style={{
          left: `calc(${milestone.leftPositionPercent.toFixed(2)}% - 100px)`,
        }}
      >
        <span
          className={cn('line-clamp-2 text-center text-xl font-bold leading-5', {
            'text-[#5B616E80]': !milestone.isHighlighted,
          })}
        >
          {milestone.title}
        </span>
        {milestone.date && milestone.isHighlighted && (
          <p className="text-center text-xs text-muted-foreground">
            <FormattedDatetime
              date={milestone.date}
              dateStyle="medium"
              locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
            />
          </p>
        )}
      </div>
    </>
  )
}

function MinorMilestone({
  countryCode,
  milestone,
}: {
  countryCode: SupportedCountryCodes
  milestone: Milestone
}) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={250} onOpenChange={setIsTooltipOpen} open={isTooltipOpen}>
        <TooltipTrigger asChild>
          <div
            className="absolute top-[30px] h-[20px] w-[20px] cursor-pointer rounded-full border-4 border-[#F2F5F9] bg-primary-cta hover:border-[#6100FF80]"
            style={{ left: `calc(${milestone.leftPositionPercent.toFixed(2)}% - 12px)` }}
          />
        </TooltipTrigger>
        <TooltipContent
          className="max-w-xs space-y-1 bg-white p-4 font-sans"
          side="top"
          sideOffset={16}
        >
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
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
