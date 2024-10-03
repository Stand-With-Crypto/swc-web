'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

type CountdownVariant = 'default' | 'compact'

interface CountdownProps {
  targetDate: Date
  variant?: CountdownVariant
}

const UNITS_BY_VARIANT: Record<CountdownVariant, Record<keyof CountdownTime, string>> = {
  default: {
    days: 'days',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
  },
  compact: {
    days: 'd',
    hours: 'h',
    minutes: 'm',
    seconds: 's',
  },
}
const padNumber = (num: number) => num.toString().padStart(2, '0')

export function Countdown({ targetDate, variant = 'default' }: CountdownProps) {
  const [countDownTime, setCountDownTime] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const getTimeDifference = (countDownDate: number) => {
    const currentTime = new Date().getTime()
    const timeDifference = countDownDate - currentTime

    const days = Math.floor(timeDifference / (24 * 60 * 60 * 1000))
    const hours = Math.floor((timeDifference % (24 * 60 * 60 * 1000)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDifference % (60 * 60 * 1000)) / (1000 * 60))
    const seconds = Math.floor((timeDifference % (60 * 1000)) / 1000)

    if (timeDifference < 0) {
      setCountDownTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      clearInterval(intervalRef.current!)
    } else {
      setCountDownTime({ days, hours, minutes, seconds })
    }
  }

  const startCountDown = useCallback(() => {
    const countDownDate = targetDate.getTime()

    getTimeDifference(countDownDate)

    intervalRef.current = setInterval(() => {
      getTimeDifference(countDownDate)
    }, 1000)
  }, [targetDate])

  useEffect(() => {
    startCountDown()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startCountDown])

  const countDownTimeEntries = Object.entries(countDownTime) as [keyof CountdownTime, number][]
  const getUnitReadableString = (unit: keyof CountdownTime) => UNITS_BY_VARIANT[variant][unit]

  if (variant === 'default') {
    return (
      <div className="flex gap-6 overflow-hidden md:gap-8">
        {countDownTimeEntries.map(([unit, value]) => (
          <div className="flex flex-col items-center gap-3 text-center" key={unit}>
            <span className="text-2xl font-bold md:text-4xl">{value}</span>

            <span className="text-sm uppercase text-muted-foreground md:text-lg">
              {getUnitReadableString(unit)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <p>
      {countDownTimeEntries.map(([unit, value], idx) => (
        <span key={unit}>
          {padNumber(value)}
          {getUnitReadableString(unit)}
          {idx < countDownTimeEntries.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}
