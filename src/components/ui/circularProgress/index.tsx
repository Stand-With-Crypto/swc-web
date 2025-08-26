import React, { useEffect, useMemo } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

interface CircularProgressProps {
  percentage: number
  title?: string
  label?: string
  size?: number
  gapDegrees?: number
  strokeWidth?: number
  color?: string
  animationDuration?: number
  animateOnMount?: boolean
}

const FULL_CIRCLE_DEGREES = 360

export function CircularProgress({
  title,
  label,
  size = 200,
  strokeWidth = 20,
  percentage = 0,
  color = '#6100FF',
  gapDegrees = 60,
  animationDuration = 1,
  animateOnMount = true,
}: CircularProgressProps) {
  const center = useMemo(() => size / 2, [size])
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth])
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius])

  const arcDegrees = FULL_CIRCLE_DEGREES - gapDegrees
  const arcCircumference = useMemo(
    () => (circumference * arcDegrees) / FULL_CIRCLE_DEGREES,
    [circumference, arcDegrees],
  )

  const motionPercentage = useMotionValue(animateOnMount ? 0 : percentage)
  const animatedOffset = useTransform(motionPercentage, val => {
    if (arcCircumference === 0) return 0
    return arcCircumference - (val / 100) * arcCircumference
  })

  useEffect(() => {
    if (animateOnMount) {
      animate(motionPercentage, percentage, {
        duration: animationDuration,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.3,
      })
    } else {
      motionPercentage.set(percentage)
    }
  }, [percentage, animationDuration, animateOnMount, motionPercentage])

  const rotation = useMemo(() => gapDegrees / 2 - 270, [gapDegrees])

  const shouldHideLabel = useMemo(() => {
    if (title === undefined && label === undefined) return true
    return false
  }, [title, label])

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        className="transform"
        height={size}
        style={{ transform: `rotate(${rotation}deg)` }}
        width={size}
      >
        <circle
          className="text-background"
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          style={{
            strokeDasharray: `${arcCircumference} ${circumference}`,
          }}
        />

        <motion.circle
          cx={center}
          cy={center}
          fill="transparent"
          r={radius}
          stroke={color}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          style={{
            strokeDasharray: `${arcCircumference} ${circumference}`,
            strokeDashoffset: animatedOffset,
          }}
        />
      </svg>

      {!shouldHideLabel && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-foreground md:text-4xl">{title}</span>
          <span className="text-sm font-medium text-muted-foreground md:text-base">{label}</span>
        </div>
      )}
    </div>
  )
}
