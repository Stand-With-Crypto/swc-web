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

import { useIsMobile } from '@/hooks/useIsMobile'

const DEFAULT_BAR_THICKNESS = 2
const DEFAULT_PROGRESS_ANIMATION_DURATION = 1.5

export interface ProgressProps {
  animation?: ProgressAnimation
  duration?: number
  spacing?: number
  thickness?: number
  value: number
}

export function Progress({
  animation,
  duration = DEFAULT_PROGRESS_ANIMATION_DURATION,
  spacing = 0,
  thickness = DEFAULT_BAR_THICKNESS,
  value,
}: ProgressProps) {
  const isMobile = useIsMobile()

  const defaultAnimation = useProgressAnimation(value, duration)
  const { size } = animation || defaultAnimation

  const { backBarStyles, frontBarStyles } = useMemo(() => {
    const barStyles: CSSProperties = isMobile
      ? { left: spacing - thickness / 2, top: 0, width: thickness }
      : {
          height: thickness,
          left: 0,
          top: spacing - thickness / 2,
        }

    const backBarStyles: CSSProperties = {
      ...barStyles,
      ...(isMobile ? { height: '100%' } : { width: '100%' }),
    }

    const frontBarStyles: MotionStyle = {
      ...barStyles,
      ...(isMobile ? { height: size } : { width: size }),
    }

    return { backBarStyles, frontBarStyles }
  }, [isMobile, size, spacing, thickness])

  return (
    <div className="relative h-full w-full">
      <div className="absolute bg-muted-foreground/50" style={backBarStyles} />
      <motion.div className="absolute bg-primary-cta" style={frontBarStyles} />
    </div>
  )
}

export function useProgressAnimation(
  targetPercent: number,
  duration = DEFAULT_PROGRESS_ANIMATION_DURATION,
) {
  const progress = useMotionValue(0)
  const [currentProgress, setCurrentProgress] = useState(0)

  useMotionValueEvent(progress, 'change', latest => {
    setCurrentProgress(Number(latest.toFixed(2)))
  })

  useEffect(() => {
    const controls = animate(progress, targetPercent, {
      duration,
      ease: 'easeOut',
    })

    return () => {
      controls.stop()
    }
  }, [duration, progress, targetPercent])

  const size = useTransform(progress, value => `${value}%`)

  return { progress: currentProgress, size }
}

export type ProgressAnimation = ReturnType<typeof useProgressAnimation>
