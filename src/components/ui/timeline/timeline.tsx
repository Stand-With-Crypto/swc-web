'use client'

import { useMemo } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { MAJOR_MILESTONE_CONFIG, TIMELINE_CONFIG } from '@/components/ui/timeline/constants'
import { MajorMilestone } from '@/components/ui/timeline/majorMilestone'
import { MinorMilestone } from '@/components/ui/timeline/minorMilestone'
import { Progress, useProgressAnimation } from '@/components/ui/timeline/progress'
import { TimelinePlotPoint } from '@/components/ui/timeline/types'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const {
  TIMELINE_HEIGHT_DESKTOP,
  TIMELINE_HEIGHT_MOBILE,
  TIMELINE_SPACING_DESKTOP,
  TIMELINE_SPACING_MOBILE,
} = TIMELINE_CONFIG
const { HIGHLIGHTED_POINT_SIZE } = MAJOR_MILESTONE_CONFIG

interface TimelineProps {
  countryCode: SupportedCountryCodes
  plotPoints: TimelinePlotPoint[]
}

export function Timeline(props: TimelineProps) {
  const isMobile = useIsMobile()
  const hasHydrated = useHasHydrated()

  const { majorMilestones, minorMilestones, targetPercent } = useMemo(() => {
    const plotPoints = props.plotPoints
      .map(point => ({
        ...point,
        date: point.date ? (point.date instanceof Date ? point.date : new Date(point.date)) : null,
      }))
      .sort((a, b) => {
        if (!a.date || !b.date) {
          return 0
        }
        return a.date.getTime() - b.date.getTime()
      })

    const majorMilestones = plotPoints
      .filter(plotPoint => plotPoint.isMajorMilestone)
      .map((point, index, points) => {
        return {
          ...point,
          positionPercent: (index * 100) / (points.length - 1),
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

        const index = siblings.findIndex(({ id }) => id === point.id)

        return {
          ...point,
          positionPercent: point.parentMilestone.positionPercent + xPos * (index + 1),
        }
      })

    const lastHighlightedMilestone = plotPoints.findLast(point => point.isHighlighted)
    const milestones = [...majorMilestones, ...minorMilestones]
    const currentMilestone = lastHighlightedMilestone
      ? milestones.find(point => point.id === lastHighlightedMilestone.id) || majorMilestones[0]
      : majorMilestones[0]
    const targetPercent = currentMilestone.positionPercent

    return { majorMilestones, minorMilestones, targetPercent }
  }, [props.plotPoints])

  const animation = useProgressAnimation(targetPercent)

  const wrapperStyles = useMemo(
    () =>
      isMobile
        ? {
            height: TIMELINE_HEIGHT_MOBILE,
            margin: `${TIMELINE_SPACING_MOBILE}px 0`,
            width: '100%',
          }
        : {
            height: TIMELINE_HEIGHT_DESKTOP,
            margin: '0 auto',
            width: `calc(100% - ${TIMELINE_SPACING_DESKTOP * 2}px)`,
          },
    [isMobile],
  )

  return hasHydrated ? (
    <div className="relative" style={wrapperStyles}>
      <Progress animation={animation} spacing={HIGHLIGHTED_POINT_SIZE} value={targetPercent} />

      {majorMilestones.map((majorMilestone, index) => {
        return (
          <MajorMilestone
            countryCode={props.countryCode}
            isFirstMilestone={index === 0}
            isHighlightEnabled={majorMilestone.positionPercent <= animation.progress}
            isMobile={isMobile}
            key={index}
            milestone={majorMilestone}
          />
        )
      })}

      {minorMilestones.map((minorMilestone, index) => {
        return (
          <MinorMilestone
            countryCode={props.countryCode}
            isHighlightEnabled={minorMilestone.positionPercent <= animation.progress}
            isMobile={isMobile}
            key={index}
            milestone={minorMilestone}
          />
        )
      })}
    </div>
  ) : (
    <Skeleton className="h-[160px] w-full bg-slate-200" />
  )
}
