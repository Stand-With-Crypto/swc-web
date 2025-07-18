import React, { ReactNode } from 'react'
import { orderBy } from 'lodash-es'
import { Globe } from 'lucide-react'

import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { Button } from '@/components/ui/button'
import { MaybeNextImg, NextImage } from '@/components/ui/image'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import {
  getDTSIPersonRoleLocation,
  getFormattedDTSIPersonRoleDateRange,
  getHasDTSIPersonRoleEnded,
  getRoleNameResolver,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
  getDTSIPersonProfilePictureUrlDimensions,
  shouldPersonHaveStanceScoresHidden,
} from '@/utils/dtsi/dtsiPersonUtils'
import { dtsiTwitterAccountUrl } from '@/utils/dtsi/dtsiTwitterAccountUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const POLITICIAN_IMAGE_SIZE_PX = 230

export function PagePoliticianDetails({ children }: { children: ReactNode }) {
  return <div className="standard-spacing-from-navbar container max-w-3xl">{children}</div>
}

function PoliticianHeader({
  person,
  countryCode,
  showRoleLocation = true,
}: {
  person: DTSIPersonDetails
  countryCode: SupportedCountryCodes
  showRoleLocation?: boolean
}) {
  const roleNameResolver = getRoleNameResolver(countryCode)

  return (
    <>
      {person.profilePictureUrl ? (
        <div
          className="mx-auto mb-6 overflow-hidden rounded-xl"
          style={{ maxWidth: POLITICIAN_IMAGE_SIZE_PX }}
        >
          <MaybeNextImg
            alt={`profile picture of ${dtsiPersonFullName(person)}`}
            sizes={`${POLITICIAN_IMAGE_SIZE_PX}px`}
            {...(getDTSIPersonProfilePictureUrlDimensions(person) || {})}
            className="w-full"
            src={person.profilePictureUrl}
          />
        </div>
      ) : (
        <div className="mx-auto mb-6 max-w-[100px]">
          <InitialsAvatar
            firstInitial={(person.firstNickname || person.firstName).slice(0, 1)}
            lastInitial={person.lastName.slice(0, 1)}
            size={100}
          />
        </div>
      )}
      <PageTitle className="mb-3" size="lg">
        {dtsiPersonFullName(person)}
      </PageTitle>
      <PageSubTitle className="mb-3">
        {person.primaryRole && (
          <>
            <PageSubTitle>
              {person.politicalAffiliationCategory && (
                <>
                  {dtsiPersonPoliticalAffiliationCategoryDisplayName(
                    person.politicalAffiliationCategory,
                    countryCode,
                  )}{' '}
                </>
              )}
              {roleNameResolver(person.primaryRole)}
              {showRoleLocation && getDTSIPersonRoleLocation(person.primaryRole) && (
                <span className="font-normal text-gray-500">
                  {' '}
                  from {getDTSIPersonRoleLocation(person.primaryRole)}
                </span>
              )}
            </PageSubTitle>
            {getHasDTSIPersonRoleEnded(person.primaryRole) && (
              <div className="text-gray-500">
                {getFormattedDTSIPersonRoleDateRange(person.primaryRole)}
              </div>
            )}
          </>
        )}
      </PageSubTitle>
    </>
  )
}

PagePoliticianDetails.Header = PoliticianHeader

function PoliticianLinks({
  person,
  showDonateButton = true,
}: {
  person: DTSIPersonDetails
  showDonateButton?: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      {showDonateButton && person.donationUrl && (
        <Button asChild>
          <ExternalLink href={person.donationUrl}>Donate</ExternalLink>
        </Button>
      )}
      {Boolean(person.officialUrl) && (
        <Button asChild className="h-11 w-11 rounded-full p-3" variant="secondary">
          <ExternalLink href={person.officialUrl}>
            <Globe className="h-6 w-6" />
            <span className="sr-only">{person.officialUrl}</span>
          </ExternalLink>
        </Button>
      )}
      {person.twitterAccounts.slice(0, 1).map(account => (
        <Button
          asChild
          className="h-11 w-11 rounded-full p-[14px]"
          key={account.id}
          variant="secondary"
        >
          <ExternalLink href={dtsiTwitterAccountUrl(account)}>
            <NextImage alt="x.com logo" height={20} src={'/misc/xDotComLogo.svg'} width={20} />
            <span className="sr-only">{dtsiTwitterAccountUrl(account)}</span>
          </ExternalLink>
        </Button>
      ))}
    </div>
  )
}

PagePoliticianDetails.Links = PoliticianLinks

function PoliticianStances({
  person,
  countryCode,
}: {
  person: DTSIPersonDetails
  countryCode: SupportedCountryCodes
}) {
  const stances = orderBy(person.stances, [
    x => (x.stanceType === DTSI_PersonStanceType.BILL_RELATIONSHIP ? 0 : 1),
    x => -1 * new Date(x.dateStanceMade).getTime(),
  ])

  return (
    <section>
      <PageTitle as="h2" className="mb-4 text-center text-lg md:text-xl lg:text-2xl" size="md">
        Notable statements
      </PageTitle>
      <div className="space-y-14 overflow-hidden md:space-y-16">
        {!stances.length && (
          <div className="flex items-center justify-center">No recent statements.</div>
        )}
        {stances.map(stance => (
          <DTSIStanceDetails
            countryCode={countryCode}
            isStanceHidden={shouldPersonHaveStanceScoresHidden(person)}
            key={stance.id}
            person={person}
            stance={stance}
          />
        ))}
      </div>
    </section>
  )
}

PagePoliticianDetails.Stances = PoliticianStances
