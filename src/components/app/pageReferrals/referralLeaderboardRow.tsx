import { cva, type VariantProps } from 'class-variance-authority'
import { ClassValue } from 'clsx'

import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

interface ReferralLeaderboardRowProps extends VariantProps<typeof rowVariants> {
  state: string
  district: string
  count: number
  rank: number
  className?: ClassValue
}

const rowVariants = cva('flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-primary-cta/5', {
  variants: {
    variant: {
      default: '',
      highlight: 'bg-primary-cta/10 hover:bg-primary-cta/15',
    },
  },
})

function getRankIcon(rank: number) {
  if (rank === 1) {
    return <NextImage alt="1st place" height={32} src="/misc/1st-place.svg" width={32} />
  }
  if (rank === 2) {
    return <NextImage alt="2nd place" height={32} src="/misc/2nd-place.svg" width={32} />
  }
  if (rank === 3) {
    return <NextImage alt="3rd place" height={32} src="/misc/3rd-place.svg" width={32} />
  }
  return <p className="text-center font-semibold text-fontcolor-muted">{rank}</p>
}

export function ReferralLeaderboardRow(props: ReferralLeaderboardRowProps) {
  const { rank, state, district, count, className, variant } = props

  return (
    <div className={cn(rowVariants({ variant }), className)}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
        {getRankIcon(rank)}
      </div>
      <div className="font-semibold capitalize">
        <span>{state}</span> - District <span>{district}</span>
      </div>
      <p className="ml-auto">{count}</p>
    </div>
  )
}
