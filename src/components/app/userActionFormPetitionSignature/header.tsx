import Link from 'next/link'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/web/cn'

import { DEFAULT_INNER_WIDTH_CLASS_NAME } from './constants'

interface PetitionHeaderProps {
  title: string
  description: string
  petitionSlug?: string
  signaturesCount: number
  goal: number
  className?: string
}

export function PetitionHeader({
  title,
  description,
  petitionSlug,
  signaturesCount,
  goal,
  className,
}: PetitionHeaderProps) {
  const progressPercentage = Math.min((signaturesCount / goal) * 100, 100)

  return (
    <div className={cn('mx-auto w-full pt-12 max-md:px-6', className)}>
      <div className={cn(DEFAULT_INNER_WIDTH_CLASS_NAME)}>
        <div className="space-y-4 py-6">
          <PageTitle size="md">{title}</PageTitle>
          <PageSubTitle size="sm">{description}</PageSubTitle>
          <div className="text-center">
            {petitionSlug ? (
              <Link className="underline" href={`/petitions/${petitionSlug}`}>
                View petition
              </Link>
            ) : (
              <span className="underline">View petition</span>
            )}
          </div>
        </div>

        <div className="space-y-2 pb-6">
          <Progress className="h-4" value={progressPercentage} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{signaturesCount.toLocaleString()} Signatures</span>
            <span>{goal.toLocaleString()} Goal</span>
          </div>
        </div>
      </div>
    </div>
  )
}
