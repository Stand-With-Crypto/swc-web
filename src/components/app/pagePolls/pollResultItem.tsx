import { motion } from 'motion/react'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'

function VoteItemLoading() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      className="absolute bottom-0 left-0 h-full w-full rounded-lg bg-secondary"
      transition={{ duration: 1.2, repeat: Infinity }}
    />
  )
}

function BlankVoteInfo() {
  return (
    <motion.span
      animate={{ opacity: [0.8, 0.6, 0.4, 0.2, 0.4, 0.6, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      --
    </motion.span>
  )
}

function PercentageBar({ percentage }: { percentage: number }) {
  return (
    <motion.div
      animate={{ width: `${percentage}%` }}
      className="absolute bottom-0 left-0 h-full rounded-lg bg-purple-200"
      initial={{ width: '0%' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    />
  )
}

interface PollResultItemProps {
  value: string
  displayName: string
  votesInfo: string
  isUserVote: boolean
  percentage: number
  isLoading: boolean
}

export function PollResultItem({
  value,
  displayName,
  votesInfo,
  isUserVote,
  percentage,
  isLoading,
}: PollResultItemProps) {
  return (
    <div
      className="relative flex h-14 items-center justify-between px-4 py-2 font-medium"
      key={value}
    >
      <span className="z-10">{displayName}</span>
      <div className="z-10 flex items-center gap-2">
        <span className="text-sm text-gray-600">{isLoading ? <BlankVoteInfo /> : votesInfo}</span>
        {!isLoading && isUserVote && (
          <div className="relative h-4 w-4">
            <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
          </div>
        )}
      </div>

      {isLoading ? <VoteItemLoading /> : <PercentageBar percentage={percentage} />}
    </div>
  )
}

interface PollResultItemOtherProps {
  value: string
  displayName: string
  votesInfo: string
  isUserVote: boolean
  percentage: number
  isLoading: boolean
}

export function PollResultItemOther({
  value,
  displayName,
  votesInfo,
  isUserVote,
  percentage,
  isLoading,
}: PollResultItemOtherProps) {
  return (
    <div
      className="relative flex h-14 items-center justify-between px-4 py-2 font-medium"
      key={`other-${value}`}
    >
      <span className="z-10 py-2">{displayName}</span>
      <div className="z-10 flex items-center gap-2">
        <span className="text-sm text-gray-600">{isLoading ? <BlankVoteInfo /> : votesInfo}</span>
        {!isLoading && isUserVote && (
          <div className="relative h-4 w-4">
            <CheckIcon completed={true} index={0} svgClassname="bg-muted h-4 w-4" />
          </div>
        )}
      </div>

      {isLoading ? <VoteItemLoading /> : <PercentageBar percentage={percentage} />}
    </div>
  )
}
