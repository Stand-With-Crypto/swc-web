'use client'

import { useEffect, useState } from 'react'
import { differenceInDays, format, isPast } from 'date-fns'

export const PollLegend = ({
  endDate,
  isInactivePoll,
}: {
  endDate: string
  isInactivePoll?: boolean
}) => {
  const [legendText, setLegendText] = useState<string>('')

  useEffect(() => {
    const currentEndDate = new Date(endDate)
    const endsIn = differenceInDays(currentEndDate, new Date())
    const hasEnded = isPast(currentEndDate)
    const hasEndedToday = endsIn === 0
    const dayOrDays = endsIn === 1 ? 'day' : 'days'

    if (hasEndedToday) {
      setLegendText(`${isInactivePoll ? 'Ended' : 'Ends'} today`)
    } else if (hasEnded) {
      setLegendText(`Ended on ${format(currentEndDate, 'MMM d, yyyy')}`)
    } else {
      setLegendText(`Ends in ${endsIn} ${dayOrDays}`)
    }
  }, [endDate, isInactivePoll])

  return <span className="text-sm text-gray-500">{legendText}</span>
}
