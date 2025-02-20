import { differenceInDays, format, isPast } from 'date-fns'

export const PollLegend = ({
  endDate,
  isInactivePoll,
}: {
  endDate: string
  isInactivePoll?: boolean
}) => {
  const endsIn = differenceInDays(new Date(endDate), new Date())
  const hasEnded = isPast(new Date(endDate))
  const hasEndedToday = endsIn === 0

  if (hasEndedToday) {
    return (
      <span className="text-sm text-gray-500">{`${isInactivePoll ? 'Ended' : 'Ends'} today`}</span>
    )
  }

  return (
    <span className="text-sm text-gray-500">
      {hasEnded ? `Ended on ${format(new Date(endDate), 'MMM d, yyyy')}` : `Ends in ${endsIn} days`}
    </span>
  )
}
