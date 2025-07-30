import { CSSProperties, useMemo } from 'react'
import { Check, ScrollTextIcon, XIcon } from 'lucide-react'

import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { Milestone } from '@/components/ui/timeline/types'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

interface MajorMilestoneProps {
  countryCode: SupportedCountryCodes
  isFirstMilestone: boolean
  isHighlightEnabled?: boolean
  isMobile: boolean
  milestone: Milestone
}

const ICON_PROPS = {
  className: 'mt-0.5',
  color: 'white',
  size: 24,
}

const POINT_FIXED_SPACING = 20
export const HIGHLIGHTED_POINT_SIZE = 40
const NOT_HIGHLIGHTED_POINT_SIZE = 24

const TITLE_FIXED_SPACING = 80
const TITLE_WIDTH = 200
const TITLE_HEIGHT = 28

export function MajorMilestone({
  countryCode,
  isFirstMilestone,
  isHighlightEnabled = true,
  isMobile,
  milestone,
}: MajorMilestoneProps) {
  const StatusIcon = milestone.success ? Check : XIcon

  const Icon = isFirstMilestone ? ScrollTextIcon : StatusIcon

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

  return (
    <>
      <div
        className={cn(
          'absolute flex items-center justify-center rounded-full transition-colors duration-500',
          {
            'bg-primary-cta': milestone.isHighlighted && isHighlightEnabled,
            'bg-muted-foreground': milestone.isHighlighted && !isHighlightEnabled,
            'border-2 border-muted-foreground bg-gray-100': !milestone.isHighlighted,
            'bg-destructive': milestone.isHighlighted && isHighlightEnabled && !milestone.success,
          },
        )}
        style={pointStyles}
      >
        {milestone.isHighlighted && <Icon {...ICON_PROPS} />}
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
