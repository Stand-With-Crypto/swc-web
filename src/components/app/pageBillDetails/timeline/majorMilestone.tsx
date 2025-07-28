import { Milestone } from '@/components/app/pageBillDetails/timeline/types'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { Check, ScrollTextIcon, XIcon } from 'lucide-react'
import { CSSProperties, useMemo } from 'react'

type MajorMilestoneProps = {
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

  const { pointStyles, titleTextStyle, titleWrapperStyle } = useMemo(() => {
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

    const titleDynamicSpacing = `calc(${milestone.positionPercent.toFixed(2)}% - ${isMobile ? TITLE_HEIGHT : TITLE_WIDTH / 2}px)`

    const titleWrapperStyle: CSSProperties = {
      gap: isMobile ? 4 : 12,
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

    const titleTextStyle: CSSProperties = isMobile
      ? {}
      : {
          textAlign: 'center',
        }

    return { pointStyles, titleTextStyle, titleWrapperStyle }
  }, [isMobile, milestone.isHighlighted, milestone.positionPercent])

  return (
    <>
      <div
        className={cn(
          'absolute flex items-center justify-center rounded-full transition-colors duration-300',

          {
            'bg-primary-cta': milestone.isHighlighted && isHighlightEnabled,
            'bg-[#5B616E]': milestone.isHighlighted && !isHighlightEnabled,
            'border-2 border-[rgba(91,97,110,.5)] bg-[#F2F5F9]': !milestone.isHighlighted,
            'bg-destructive': milestone.isHighlighted && isHighlightEnabled && !milestone.success,
          },
        )}
        style={pointStyles}
      >
        {milestone.isHighlighted && <Icon {...ICON_PROPS} />}
      </div>
      <div className="absolute flex flex-col font-sans" style={titleWrapperStyle}>
        <span
          className={cn('line-clamp-2 text-xl font-bold leading-7', {
            'text-[#5B616E80]': !milestone.isHighlighted,
          })}
          style={titleTextStyle}
        >
          {milestone.title}
        </span>
        {milestone.date && milestone.isHighlighted && (
          <p className="text-xs text-muted-foreground" style={titleTextStyle}>
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
