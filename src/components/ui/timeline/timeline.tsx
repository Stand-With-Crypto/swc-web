'use client'

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { HIGHLIGHTED_POINT_SIZE, MajorMilestone } from '@/components/ui/timeline/majorMilestone'
import { MinorMilestone } from '@/components/ui/timeline/minorMilestone'
import { Milestone, TimelinePlotPoint } from '@/components/ui/timeline/types'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface TimelineProps {
  countryCode: SupportedCountryCodes
  plotPoints: TimelinePlotPoint[]
}

const TIMELINE_HEIGHT_DESKTOP = 160
const TIMELINE_SPACING_DESKTOP = 120

const TIMELINE_HEIGHT_MOBILE = 400
const TIMELINE_SPACING_MOBILE = 24

const BAR_THICKNESS = 2

const DEFAULT_ANIMATION_DURATION = 2_000

export function Timeline(props: TimelineProps) {
  const isMobile = useIsMobile()
  const hasHydrated = useHasHydrated()

  const { currentMilestone, majorMilestones, minorMilestones } = useMemo(() => {
    const plotPoints = props.plotPoints.map(point => ({
      ...point,
      date: point.date ? (point.date instanceof Date ? point.date : new Date(point.date)) : null,
    }))

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

        const index = siblings.findIndex(({ date }) =>
          date && point.date ? date.getTime() === point.date.getTime() : false,
        )

        return {
          ...point,
          positionPercent: point.parentMilestone.positionPercent + xPos * (index + 1),
        }
      })

    const lastHighlightedMilestoneDate = plotPoints.findLast(point => point.isHighlighted)?.date
    const currentMilestone =
      [...majorMilestones, ...minorMilestones].find(
        point => point.date === lastHighlightedMilestoneDate,
      ) || majorMilestones[0]

    return { currentMilestone, majorMilestones, minorMilestones }
  }, [props.plotPoints])

  const { currentPercent, majorMilestonesCount, minorMilestonesCount } = useTimelineAnimation({
    majorMilestones,
    minorMilestones,
    targetPercent: currentMilestone.positionPercent,
  })

  const { backBarStyles, frontBarStyles, wrapperStyles } = useMemo(() => {
    const wrapperStyles: CSSProperties = isMobile
      ? { height: TIMELINE_HEIGHT_MOBILE, margin: `${TIMELINE_SPACING_MOBILE}px 0`, width: '100%' }
      : {
          height: TIMELINE_HEIGHT_DESKTOP,
          margin: '0 auto',
          width: `calc(100% - ${TIMELINE_SPACING_DESKTOP * 2}px)`,
        }

    const barStyles: CSSProperties = isMobile
      ? { left: HIGHLIGHTED_POINT_SIZE - 1, top: 0, width: BAR_THICKNESS }
      : {
          left: 0,
          top: HIGHLIGHTED_POINT_SIZE - 1,
          height: BAR_THICKNESS,
        }

    const backBarStyles: CSSProperties = {
      ...barStyles,
      ...(isMobile ? { height: '100%' } : { width: '100%' }),
    }

    const frontBarSize = `${currentPercent.toFixed(2)}%`

    const frontBarStyles: CSSProperties = {
      ...barStyles,
      ...(isMobile ? { height: frontBarSize } : { width: frontBarSize }),
    }

    return { backBarStyles, frontBarStyles, wrapperStyles }
  }, [currentPercent, isMobile])

  return hasHydrated ? (
    <div className="relative" style={wrapperStyles}>
      <div className="absolute bg-[rgba(91,97,110,0.5)]" style={backBarStyles} />
      <div className="absolute bg-primary-cta" style={frontBarStyles} />

      {majorMilestones.map((majorMilestone, index) => {
        return (
          <MajorMilestone
            countryCode={props.countryCode}
            isFirstMilestone={index === 0}
            isHighlightEnabled={index < majorMilestonesCount}
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
            isHighlightEnabled={index < minorMilestonesCount}
            isMobile={isMobile}
            key={index}
            milestone={minorMilestone}
          />
        )
      })}
    </div>
  ) : (
    <div className="h-[160px] w-full animate-pulse rounded-lg bg-slate-200" />
  )
}

function useTimelineAnimation({
  duration = DEFAULT_ANIMATION_DURATION,
  majorMilestones,
  minorMilestones,
  targetPercent,
}: {
  duration?: number
  majorMilestones: Milestone[]
  minorMilestones: Milestone[]
  targetPercent: number
}) {
  const [currentPercent, setCurrentPercent] = useState(0)

  const animationFrameRef = useRef<number | null>(null)

  const startTimeRef = useRef(0)

  const majorMilestonesCount = useMemo(
    () => majorMilestones.filter(milestone => milestone.positionPercent <= currentPercent).length,
    [currentPercent, majorMilestones],
  )
  const minorMilestonesCount = useMemo(
    () => minorMilestones.filter(milestone => milestone.positionPercent <= currentPercent).length,
    [currentPercent, minorMilestones],
  )

  useEffect(() => {
    setCurrentPercent(0)

    startTimeRef.current = performance.now()

    const runAnimationFrame = (currentTime: number) => {
      const elapsedTime = currentTime - startTimeRef.current
      const progress = Math.min(elapsedTime / duration, 1)
      const newPercent = progress * targetPercent

      setCurrentPercent(Math.min(newPercent, targetPercent))

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(runAnimationFrame)
      }
    }

    animationFrameRef.current = requestAnimationFrame(runAnimationFrame)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [targetPercent, duration])

  return { currentPercent, majorMilestonesCount, minorMilestonesCount }
}
