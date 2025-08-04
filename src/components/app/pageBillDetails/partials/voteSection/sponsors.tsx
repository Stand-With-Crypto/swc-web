import { BillDetails } from '@/data/bills/types'
import { DTSI_Person } from '@/data/dtsi/generated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useLimitItems } from '@/hooks/useLimitItems'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { AvatarGrid } from './avatarGrid'
import { DTSIAvatarBox } from './dtsiAvatarBox'
import { ShowAllButton } from './showAllButton'

const COSPONSORS_ITEMS_LIMIT = {
  DESKTOP: 5,
  MOBILE: 6,
}

interface SponsorsProps {
  coSponsors: BillDetails['relationships']['coSponsors']
  sponsors: BillDetails['relationships']['sponsors']
  countryCode: SupportedCountryCodes
}

export function Sponsors({ coSponsors, sponsors, countryCode }: SponsorsProps) {
  const isMobile = useIsMobile()

  const columnLimit = COSPONSORS_ITEMS_LIMIT[isMobile ? 'MOBILE' : 'DESKTOP']

  const { list, toggleShouldLimit, hasMore, isShowingAll, totalItems } = useLimitItems<DTSI_Person>(
    {
      items: coSponsors,
      initialLimit: columnLimit,
    },
  )

  return (
    <div className="mx-4 flex flex-col gap-2 md:mx-6">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="mb-10 min-w-40 md:mb-0">
          <strong className="mb-6 block text-xl font-semibold">Sponsor</strong>
          {sponsors?.map(person => (
            <DTSIAvatarBox
              className="m-auto max-w-40 sm:m-0"
              countryCode={countryCode}
              key={person.slug}
              person={person}
            />
          ))}
        </div>

        <div className="flex-1">
          <strong className="mb-6 block text-xl font-semibold">
            Cosponsors <span className="font-normal">({totalItems})</span>
          </strong>
          <AvatarGrid className="sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {list?.map(person => (
              <DTSIAvatarBox countryCode={countryCode} key={person.slug} person={person} />
            ))}
          </AvatarGrid>
        </div>
      </div>

      {hasMore && <ShowAllButton isShowingAll={isShowingAll} toggleExpanded={toggleShouldLimit} />}
    </div>
  )
}
