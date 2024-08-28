import { ClassValue } from 'clsx'

import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

const CHECKMARK_SIZE = 32

interface VoterJourneyStepCardProps {
  step: number
  title: string
  description: string
  status: 'unknown' | 'complete' | 'incomplete'
  className?: ClassValue
}

export function VoterJourneyStepCard(props: VoterJourneyStepCardProps) {
  const { step, title, description, status = 'unknown', className } = props

  const renderStatus = () => {
    switch (status) {
      case 'complete':
        return (
          <NextImage
            alt={'Action complete'}
            height={CHECKMARK_SIZE}
            src={'/misc/checkedCircle-purple.svg'}
            width={CHECKMARK_SIZE}
          />
        )
      case 'incomplete':
        return (
          <NextImage
            alt={'Action not complete'}
            height={CHECKMARK_SIZE}
            src={'/misc/uncheckedCircle.svg'}
            width={CHECKMARK_SIZE}
          />
        )
      case 'unknown':
      default:
        return null
    }
  }

  return (
    <button
      className={cn(
        'flex w-full items-center justify-between gap-x-6 gap-y-4 rounded-3xl bg-secondary p-6  hover:drop-shadow lg:gap-x-8 lg:p-8',
        className,
      )}
    >
      <span className="text-3xl font-bold">{step}</span>

      <div className="flex-1 text-start">
        <p className={cn('line-clamp-3 text-lg font-semibold')}>{title}</p>
        <p className="mt-2 text-fontcolor-muted">{description}</p>
      </div>

      <div
        className="flex-shrink-0"
        style={{
          height: CHECKMARK_SIZE,
          width: CHECKMARK_SIZE,
        }}
      >
        {renderStatus()}
      </div>
    </button>
  )
}
