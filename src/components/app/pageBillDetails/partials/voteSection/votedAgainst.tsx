import { ThumbsDown } from 'lucide-react'

import ShowAllButton from '@/components/app/pageBillDetails/partials/voteSection/showAllButton'
import { BillDetails } from '@/data/bills/types'
import { DTSI_Person } from '@/data/dtsi/generated'
import { useLimitItems } from '@/hooks/useLimitItems'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import AvatarGrid from './avatarGrid'
import DTSIAvatarBox from './dtsiAvatarBox'

interface VotedAgainstProps {
  votedAgainst: BillDetails['relationships']['votedAgainst']
  countryCode: SupportedCountryCodes
}

function VotedAgainst({ votedAgainst, countryCode }: VotedAgainstProps) {
  const { list, toggleShouldLimit, canReturnMore, isReturnMore, totalItems } =
    useLimitItems<DTSI_Person>({
      items: votedAgainst,
      nItems: 6,
    })

  return (
    <div className="mx-4 mt-7 flex flex-col gap-2 md:mx-6">
      <strong className="mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-red-700 sm:justify-normal">
        <div className="rounded-full bg-red-200 p-2">
          <ThumbsDown />
        </div>
        Voted Against <span className="font-normal">({totalItems})</span>
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

export default VotedAgainst
