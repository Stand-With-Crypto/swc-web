'use client'

import { differenceInDays, format, isPast } from 'date-fns'

export const PollLegend = ({
  endDate,
  isInactivePoll,
}: {
  endDate: string
  isInactivePoll?: boolean
}) => {
  const currentEndDate = new Date(endDate)
  const endsIn = differenceInDays(currentEndDate, new Date())
  const hasEnded = isPast(currentEndDate)
  const hasEndedToday = endsIn === 0
  const dayOrDays = endsIn === 1 ? 'day' : 'days'

  if (hasEndedToday) {
    return (
      <span className="text-sm text-gray-500">{`${isInactivePoll ? 'Ended' : 'Ends'} today`}</span>
    )
  }

  return (
    <span className="text-sm text-gray-500">
      {hasEnded
        ? `Ended on ${format(currentEndDate, 'MMM d, yyyy')}`
        : `Ends in ${endsIn} ${dayOrDays}`}
    </span>
  )
}
