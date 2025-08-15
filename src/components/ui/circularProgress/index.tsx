import React, { useEffect, useMemo } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

interface CircularProgressProps {
  percentage: number
  value: string
  label?: string
  size?: number
  gapDegrees?: number
  strokeWidth?: number
  color?: string
  animationDuration?: number
  animateOnMount?: boolean
}

export function CircularProgress({
  value,
  label,
  size = 200,
  strokeWidth = 20,
  percentage = 0,
  color = '#6100FF',
  gapDegrees = 60,
  animationDuration = 1,
  animateOnMount = true,
}: CircularProgressProps) {
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth])
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius])

  const arcDegrees = 360 - gapDegrees
  const arcCircumference = useMemo(
    () => (circumference * arcDegrees) / 360,
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
          className="text-gray-200"
          cx={size / 2}
          cy={size / 2}
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
          cx={size / 2}
          cy={size / 2}
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

      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-gray-800 md:text-4xl">{value}</span>
        <span className="text-sm text-gray-500 md:text-base">{label}</span>
      </div>
    </div>
  )
}
