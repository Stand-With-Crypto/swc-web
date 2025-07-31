import { BillDetails } from '@/data/bills/types'
import { DTSI_Person } from '@/data/dtsi/generated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLimitItems } from '@/hooks/useLimitItems'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import AvatarGrid from './avatarGrid'
import DTSIAvatarBox from './dtsiAvatarBox'
import ShowAllButton from './showAllButton'

const COSPONSORS_ITEMS_LIMIT = {
  DESKTOP: 5,
  MOBILE: 6,
}

interface SponsorsProps {
  coSponsors: BillDetails['relationships']['coSponsors']
  sponsors: BillDetails['relationships']['sponsors']
  countryCode: SupportedCountryCodes
}

function Sponsors({ coSponsors, sponsors, countryCode }: SponsorsProps) {
  const isMobile = useIsMobile()

  const columnLimit = COSPONSORS_ITEMS_LIMIT[isMobile ? 'MOBILE' : 'DESKTOP']

  const { list, toggleShouldLimit, canReturnMore, isReturnMore, totalItems } =
    useLimitItems<DTSI_Person>({
      items: coSponsors,
      nItems: columnLimit,
    })

  return (
    <div className="mx-4 flex flex-col gap-2 md:mx-6">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="mb-10 min-w-[160px] md:mb-0">
          <strong className="mb-6 block text-xl">Sponsor</strong>
          {sponsors?.map(person => (
            <DTSIAvatarBox
              className="m-auto h-[188px] max-w-40 sm:m-0"
              countryCode={countryCode}
              key={person.slug}
              person={person}
            />
          ))}
        </div>

        <div className="flex-1">
          <strong className="mb-6 block text-xl">Cosponsors ({totalItems})</strong>
          <AvatarGrid>
            {list?.map(person => (
              <DTSIAvatarBox countryCode={countryCode} key={person.slug} person={person} />
            ))}
          </AvatarGrid>
        </div>
      </div>

      {canReturnMore && (
        <ShowAllButton isReturnMore={isReturnMore} toggleShouldLimit={toggleShouldLimit} />
      )}
    </div>
  )
}

export default Sponsors
