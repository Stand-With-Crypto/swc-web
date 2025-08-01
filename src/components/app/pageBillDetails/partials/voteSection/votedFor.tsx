import { ThumbsUp } from 'lucide-react'

import { BillDetails } from '@/data/bills/types'
import { DTSI_Person } from '@/data/dtsi/generated'
import { useLimitItems } from '@/hooks/useLimitItems'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import AvatarGrid from './avatarGrid'
import DTSIAvatarBox from './dtsiAvatarBox'
import ShowAllButton from './showAllButton'

interface VotedForProps {
  votedFor: BillDetails['relationships']['votedFor']
  countryCode: SupportedCountryCodes
}

function VotedFor({ votedFor, countryCode }: VotedForProps) {
  const { list, toggleShouldLimit, canReturnMore, isReturnMore, totalItems } =
    useLimitItems<DTSI_Person>({
      items: votedFor,
      nItems: 6,
    })

  return (
    <div className="mx-4 mt-7 flex flex-col gap-2 md:mx-6">
      <strong className="mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-green-700 sm:justify-normal">
        <div className="rounded-full bg-green-200 p-2">
          <ThumbsUp />
        </div>
        Voted For <span className="font-normal">({totalItems})</span>
      </strong>

      <AvatarGrid>
        {list?.map(person => (
          <DTSIAvatarBox countryCode={countryCode} key={person.slug} person={person} />
        ))}
      </AvatarGrid>

      {canReturnMore && (
        <ShowAllButton isReturnMore={isReturnMore} toggleShouldLimit={toggleShouldLimit} />
      )}
    </div>
  )
}

export default VotedFor
