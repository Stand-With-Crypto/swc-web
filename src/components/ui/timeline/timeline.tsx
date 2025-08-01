'use client'

import { CSSProperties, useEffect, useMemo, useState } from 'react'
import {
  animate,
  motion,
  MotionStyle,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react'

import { Skeleton } from '@/components/ui/skeleton'
import { MAJOR_MILESTONE_CONFIG, TIMELINE_CONFIG } from '@/components/ui/timeline/constants'
import { MajorMilestone } from '@/components/ui/timeline/majorMilestone'
import { MinorMilestone } from '@/components/ui/timeline/minorMilestone'
import { TimelinePlotPoint } from '@/components/ui/timeline/types'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const {
  BAR_THICKNESS,
  DEFAULT_ANIMATION_DURATION,
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
      .map((point, index) => ({
        ...point,
        id: index,
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

  const { progress, size } = useTimelineAnimation(targetPercent)

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

    const frontBarStyles: MotionStyle = {
      ...barStyles,
      ...(isMobile ? { height: size } : { width: size }),
    }

    return { backBarStyles, frontBarStyles, wrapperStyles }
  }, [isMobile, size])

  return hasHydrated ? (
    <div className="relative" style={wrapperStyles}>
      <div className="absolute bg-muted-foreground/50" style={backBarStyles} />
      <motion.div className="absolute bg-primary-cta" style={frontBarStyles} />

      {majorMilestones.map((majorMilestone, index) => {
        return (
          <MajorMilestone
            countryCode={props.countryCode}
            isFirstMilestone={index === 0}
            isHighlightEnabled={majorMilestone.positionPercent <= progress}
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
            isHighlightEnabled={minorMilestone.positionPercent <= progress}
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

function useTimelineAnimation(targetPercent: number) {
  const progress = useMotionValue(0)
  const [currentProgress, setCurrentProgress] = useState(0)

  useMotionValueEvent(progress, 'change', latest => {
    setCurrentProgress(Number(latest.toFixed(2)))
  })

  useEffect(() => {
    const controls = animate(progress, targetPercent, {
      duration: DEFAULT_ANIMATION_DURATION,
      ease: 'easeOut',
    })

    return () => {
      controls.stop()
    }
  }, [progress, targetPercent])

  const size = useTransform(progress, value => `${value}%`)

  return { progress: currentProgress, size }
}
