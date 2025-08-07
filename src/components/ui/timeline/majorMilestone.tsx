import { CSSProperties, Fragment, useMemo } from 'react'
import { Check, LucideProps as IconProps, ScrollTextIcon, XIcon } from 'lucide-react'

import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { MAJOR_MILESTONE_CONFIG, TimelinePlotPointStatus } from '@/components/ui/timeline/constants'
import { Milestone } from '@/components/ui/timeline/types'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

const {
  HIGHLIGHTED_POINT_SIZE,
  NOT_HIGHLIGHTED_POINT_SIZE,
  POINT_FIXED_SPACING,
  TITLE_FIXED_SPACING,
  TITLE_HEIGHT,
  TITLE_WIDTH,
} = MAJOR_MILESTONE_CONFIG

interface MajorMilestoneProps {
  countryCode: SupportedCountryCodes
  isEnabled?: boolean
  isMobile: boolean
  milestone: Milestone
}

enum MajorMilestoneStatus {
  NOT_ENABLED_OR_FAILED = 'NOT_ENABLED_OR_FAILED',
  NOT_HIGHLIGHTED = 'NOT_HIGHLIGHTED',
  SUCCESSFUL = 'SUCCESSFUL',
}

const ICON_PROPS: IconProps = {
  color: 'white',
  size: 24,
}

const milestoneIconMap: Record<
  TimelinePlotPointStatus,
  { className?: string; Icon: React.FC<IconProps> }
> = {
  [TimelinePlotPointStatus.FAILED]: { Icon: XIcon, className: 'mt-0' },
  [TimelinePlotPointStatus.INTRODUCED]: { Icon: ScrollTextIcon, className: 'mt-px' },
  [TimelinePlotPointStatus.PASSED]: { Icon: Check, className: 'mt-0.5' },
  [TimelinePlotPointStatus.PENDING]: { Icon: Fragment },
}

export function MajorMilestone({
  countryCode,
  isEnabled = true,
  isMobile,
  milestone,
}: MajorMilestoneProps) {
  const { Icon, className: iconClassName } = milestoneIconMap[milestone.status]

  const { pointStyles, titleWrapperStyle } = useMemo(() => {
    const notHighlightedPointSpacing =
      POINT_FIXED_SPACING + (HIGHLIGHTED_POINT_SIZE - NOT_HIGHLIGHTED_POINT_SIZE) / 2
    const pointSize = milestone.isHighlighted ? HIGHLIGHTED_POINT_SIZE : NOT_HIGHLIGHTED_POINT_SIZE
    const pointDynamicSpacing = `calc(${milestone.positionPercent.toFixed(2)}% - ${milestone.isHighlighted ? HIGHLIGHTED_POINT_SIZE / 2 : NOT_HIGHLIGHTED_POINT_SIZE / 2}px)`

    const pointStyles: CSSProperties = {
      height: pointSize,
      width: pointSize,
      ...(isMobile
        ? {
            left: milestone.isHighlighted ? POINT_FIXED_SPACING : notHighlightedPointSpacing,
            top: pointDynamicSpacing,
          }
        : {
            left: pointDynamicSpacing,
            top: milestone.isHighlighted ? POINT_FIXED_SPACING : notHighlightedPointSpacing,
          }),
    }

    const titleDynamicSpacing = `calc(${milestone.positionPercent.toFixed(2)}% - ${(isMobile ? TITLE_HEIGHT : TITLE_WIDTH) / 2}px)`

    const titleWrapperStyle: CSSProperties = {
      width: TITLE_WIDTH,
      ...(isMobile
        ? {
            left: TITLE_FIXED_SPACING,
            top: titleDynamicSpacing,
          }
        : {
            alignItems: 'center',
            left: titleDynamicSpacing,
            top: TITLE_FIXED_SPACING,
          }),
    }

    return { pointStyles, titleWrapperStyle }
  }, [isMobile, milestone.isHighlighted, milestone.positionPercent])

  const status = useMemo(() => {
    const { isHighlighted, status } = milestone

    if (!isHighlighted) {
      return MajorMilestoneStatus.NOT_HIGHLIGHTED
    }
    if (isEnabled && status !== TimelinePlotPointStatus.FAILED) {
      return MajorMilestoneStatus.SUCCESSFUL
    }
    return MajorMilestoneStatus.NOT_ENABLED_OR_FAILED
  }, [isEnabled, milestone])

  return (
    <>
      <div
        className={cn(
          'absolute flex items-center justify-center rounded-full transition-all',
          milestone.isHighlighted && (isEnabled ? 'scale-100' : 'scale-75'),
          {
            'bg-primary-cta': status === MajorMilestoneStatus.SUCCESSFUL,
            'bg-muted-foreground': status === MajorMilestoneStatus.NOT_ENABLED_OR_FAILED,
            'border-2 border-muted-foreground/50 bg-gray-100':
              status === MajorMilestoneStatus.NOT_HIGHLIGHTED,
          },
        )}
        style={pointStyles}
      >
        {milestone.isHighlighted && (
          <Icon {...ICON_PROPS} className={cn(ICON_PROPS.className, iconClassName)} />
        )}
      </div>
      <div className="absolute flex flex-col gap-1 font-sans md:gap-2" style={titleWrapperStyle}>
        <span
          className={cn('line-clamp-2 text-left text-xl font-bold leading-7 md:text-center', {
            'text-muted-foreground': !milestone.isHighlighted,
          })}
        >
          {milestone.title}
        </span>
        {milestone.date && milestone.isHighlighted && (
          <p className="text-left text-xs text-muted-foreground md:text-center">
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
