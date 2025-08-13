import { ThumbsUp } from 'lucide-react'

import { BillDetails } from '@/data/bills/types'
import { DTSI_Person } from '@/data/dtsi/generated'
import { useLimitItems } from '@/hooks/useLimitItems'
import {
  convertDTSIStanceScoreToBgColorClass,
  convertDTSIStanceScoreToTextColorClass,
} from '@/utils/dtsi/dtsiStanceScoreUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

import { AvatarGrid } from './avatarGrid'
import { DTSIAvatarBox } from './dtsiAvatarBox'
import { ShowAllButton } from './showAllButton'

interface VotedForProps {
  countryCode: SupportedCountryCodes
  stanceScore: number | null | undefined
  votedFor: BillDetails['relationships']['votedFor']
}

export function VotedFor({ countryCode, stanceScore, votedFor }: VotedForProps) {
  const { list, toggleShouldLimit, hasMore, isShowingAll, totalItems } = useLimitItems<DTSI_Person>(
    {
      items: votedFor,
      initialLimit: 6,
    },
  )

  return (
    <div className="mx-4 mt-7 flex flex-col gap-2 md:mx-6">
      <strong
        className={cn(
          'mb-2 flex items-center justify-center gap-2 text-xl font-semibold sm:justify-normal',
          convertDTSIStanceScoreToTextColorClass(stanceScore),
        )}
      >
        <div className={cn('rounded-full p-2', convertDTSIStanceScoreToBgColorClass(stanceScore))}>
          <ThumbsUp />
        </div>
        Voted For <span className="font-medium">({totalItems})</span>
      </strong>

      {list.length ? (
        <AvatarGrid>
          {list.map(person => (
            <DTSIAvatarBox countryCode={countryCode} key={person.slug} person={person} />
          ))}
        </AvatarGrid>
      ) : (
        <span className="text-muted-foreground">No votes</span>
      )}

      {hasMore && <ShowAllButton isShowingAll={isShowingAll} toggleExpanded={toggleShouldLimit} />}
    </div>
  )
}
