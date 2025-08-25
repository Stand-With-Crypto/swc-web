'use client'

import { useEffect, useMemo, useRef } from 'react'

import { cn } from '@/utils/web/cn'

import styles from './odometer.module.css'
import { useNumeralArray } from './useNumericalArray'

export interface AnimatedNumericOdometerProps {
  value: string
  size: number
  maxHeight?: number
  className?: string
  numberSpanClassName?: string
}

export function AnimatedNumericOdometer({
  value,
  size,
  className,
  maxHeight,
  numberSpanClassName,
}: AnimatedNumericOdometerProps) {
  const spanArray = useRef<(HTMLSpanElement | null)[]>([])

  const valueNumericalLength = useMemo(() => {
    return String(value).length
  }, [value])

  const numeralArray = useNumeralArray(value)

  useEffect(() => {
    for (const spanElement of spanArray.current) {
      if (spanElement) {
        const dist = Number(spanElement.getAttribute('data-value')) + 1
        spanElement.style.transform = `translateY(-${dist * 100}%)`
      }
    }
  }, [numeralArray])

  const odometerStyles = useMemo(
    () => ({
      fontFeatureSettings: `'tnum', 'lnum'`,
      height: maxHeight ?? size,
      fontSize: size * 0.8,
    }),
    [maxHeight, size],
  )

  return (
    <h1 className={cn(styles.odometer, className)} style={odometerStyles}>
      {numeralArray.map((numeralGroup, numeralGroupIndex) => {
        /**
         * numeralGroup can be a single string characther like "$" or "," OR a number like "2" or "395" or "081".
         */
        if (Number.isNaN(Number(numeralGroup))) {
          return <span key={numeralGroupIndex}>{numeralGroup}</span>
        }

        /**
         * digit is a single digit number like "8".
         */
        return Array.from(numeralGroup).map((digit, digitIndex) => {
          return (
            <span
              data-value={digit}
              key={digitIndex}
              ref={el => {
                if (el && spanArray.current.length < valueNumericalLength) {
                  spanArray.current.push(el)
                }
              }}
              style={{
                transform: `translateY(-${(Number(digit) + 1) * 100}%)`,
              }}
            >
              <span></span>

              {/**
               * here we create a an array up until the digit number, eg. [0, 1, 2, 3, 4, 5, 6, 7, 8].
               * then we create a span for each number in the array. They will be stacked on top of each other (flex-direction: column).
               */}
              {Array.from({ length: Number(digit) + 1 }, (_, number) => (
                <span className={numberSpanClassName} key={number}>
                  {number}
                </span>
              ))}
            </span>
          )
        })
      })}
    </h1>
  )
}
