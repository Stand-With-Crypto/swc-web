'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

type CountdownTime = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownProps {
  targetDate: Date
}

export const Countdown = ({ targetDate }: CountdownProps) => {
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

  return (
    <div className="flex gap-6 overflow-hidden md:gap-8">
      {(['days', 'hours', 'minutes', 'seconds'] as const).map(unit => (
        <div className="flex flex-col items-center gap-3 text-center" key={unit}>
          <span className="text-2xl font-bold md:text-4xl">{countDownTime[unit]}</span>

          <span className="text-sm uppercase text-muted-foreground md:text-lg">{unit}</span>
        </div>
      ))}
    </div>
  )
}
