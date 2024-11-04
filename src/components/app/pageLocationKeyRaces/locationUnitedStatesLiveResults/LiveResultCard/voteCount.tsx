import { isNil } from 'lodash-es'

import { cn } from '@/utils/web/cn'

interface VoteCountProps {
  votes: string | undefined
  percentage: number | undefined
  className?: string
}

export function VoteCount(props: VoteCountProps) {
  const { votes, percentage, className } = props

  return (
    <div className={cn('flex items-center text-xs md:text-sm', className)}>
      {!isNil(votes) ? (
        <span>
          {!!percentage && <span className="mr-2 font-bold">{percentage.toFixed(2)}%</span>}
          <span className="font-normal text-fontcolor-muted">{votes} votes</span>
        </span>
      ) : null}
    </div>
  )
}
