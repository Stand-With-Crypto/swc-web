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
  TIMELINE_POINTS_ADJUSTMENT_PERCENT,
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

  const { majorMilestones, minorMilestones, targetPercent } = useTimelineMilestones(
    props.plotPoints,
  )

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
        const isEnabled = Math.floor(majorMilestone.positionPercent) <= animation.progress

        return (
          <MajorMilestone
            countryCode={props.countryCode}
            isEnabled={isEnabled}
            isMobile={isMobile}
            key={index}
            milestone={majorMilestone}
          />
        )
      })}

      {minorMilestones.map((minorMilestone, index) => {
        const isEnabled = Math.floor(minorMilestone.positionPercent) <= animation.progress

        return (
          <MinorMilestone
            countryCode={props.countryCode}
            isEnabled={isEnabled}
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

function useTimelineMilestones(initialPlotPoints: TimelinePlotPoint[]) {
  const isMobile = useIsMobile()

  const milestones = useMemo(() => {
    // STEP 1: Normalization and sorting of plot points
    // Converts date strings to Date objects and sorts chronologically
    const plotPoints = initialPlotPoints
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

    // STEP 2: Processing of major milestones
    // Filters points marked as major milestones and calculates percentage positions
    const initialMajorMilestones = plotPoints
      .filter(point => point.isMajorMilestone)
      .map((point, index, points) => {
        // On mobile, reserves space for minor milestone adjustments
        const maxPercent = isMobile ? 100 - TIMELINE_POINTS_ADJUSTMENT_PERCENT : 100
        const steps = points.length - 1

        return {
          ...point,
          // Distributes major milestones uniformly along the timeline
          positionPercent: (index * maxPercent) / steps,
        }
      })

    // STEP 3: Processing of minor milestones
    // Associates each minor milestone with the closest previous major milestone
    const initialMinorMilestones = plotPoints
      .filter(point => !point.isMajorMilestone)
      .map(point => {
        // Finds the index of the major milestone that comes before this minor milestone
        const parentMilestoneIndex =
          initialMajorMilestones.findLastIndex(majorMilestone =>
            majorMilestone.date && point.date
              ? majorMilestone.date.getTime() <= point.date.getTime()
              : false,
          ) || 0

        return {
          ...point,
          parentMilestone: initialMajorMilestones[parentMilestoneIndex],
          parentMilestoneIndex,
        }
      })

    // STEP 4: Adjustment of major milestones with weights based on minor milestones
    // Calculates the weight of each major milestone based on the number of child minor milestones
    const majorMilestones = initialMajorMilestones
      .map(point => {
        // Counts how many minor milestones belong to this major milestone
        const children = initialMinorMilestones.filter(
          ({ parentMilestone }) => parentMilestone.id === point.id,
        )
        // On mobile, calculates weight based on the proportion of minor milestones
        // On desktop, weight is always 0 (no adjustment)
        const weight = isMobile
          ? (children.length / initialMinorMilestones.length) * TIMELINE_POINTS_ADJUSTMENT_PERCENT
          : 0

        return {
          ...point,
          weight,
        }
      })
      .map((point, index, points) => ({
        ...point,
        // Adjusts the percentage position by adding the weights of previous milestones
        // This creates additional spacing to accommodate minor milestones
        positionPercent:
          point.positionPercent +
          points.slice(0, index).reduce((sum, { weight }) => sum + weight, 0),
      }))

    // STEP 5: Positioning of minor milestones between major milestones
    // Distributes minor milestones uniformly in the space between major milestones
    const minorMilestones = initialMinorMilestones.map((point, _index, points) => {
      // Finds the parent major milestone and the next major milestone
      const parentMilestone = majorMilestones.find(
        majorMilestone => majorMilestone.id === point.parentMilestone.id,
      )!
      const nextMilestone =
        majorMilestones[point.parentMilestoneIndex + 1] || majorMilestones.at(-1)

      // Calculates the available space between the parent milestone and the next one
      const maxLength = nextMilestone.positionPercent - parentMilestone.positionPercent

      // Finds all minor milestones that share the same parent milestone
      const siblings = points.filter(
        targetPoint => parentMilestone.id === targetPoint.parentMilestone.id,
      )

      // Calculates the spacing between minor milestones
      const xPos = maxLength / (siblings.length + 1)

      // Finds the position of this minor milestone among its siblings
      const index = siblings.findIndex(({ id }) => id === point.id)

      return {
        ...point,
        // Positions the minor milestone in the calculated space after the parent milestone
        positionPercent: parentMilestone.positionPercent + xPos * (index + 1),
      }
    })

    // STEP 6: Calculation of target percentage for animation
    // Finds the last highlighted milestone to determine where the animation should stop
    const lastHighlightedMilestone = plotPoints.findLast(point => point.isHighlighted)
    const milestones = [...majorMilestones, ...minorMilestones]
    const currentMilestone = lastHighlightedMilestone
      ? milestones.find(point => point.id === lastHighlightedMilestone.id) || majorMilestones[0]
      : majorMilestones[0]
    const targetPercent = currentMilestone.positionPercent

    return {
      majorMilestones,
      minorMilestones,
      targetPercent,
    }
  }, [initialPlotPoints, isMobile])

  return milestones
}
