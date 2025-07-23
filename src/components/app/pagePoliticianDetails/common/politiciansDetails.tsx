import React, { ReactNode } from 'react'
import { Globe } from 'lucide-react'

import StatementSection from '@/components/app/pagePoliticianDetails/common/partials/statementSection'
import { PoliticianDetails } from '@/components/app/pagePoliticianDetails/common/types'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ProfileAvatar } from '@/components/ui/profileAvatar'
import {
  getDTSIPersonRoleLocation,
  getFormattedDTSIPersonRoleDateRange,
  getHasDTSIPersonRoleEnded,
  getRoleNameResolver,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
} from '@/utils/dtsi/dtsiPersonUtils'
import { dtsiTwitterAccountUrl } from '@/utils/dtsi/dtsiTwitterAccountUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import VoteSection from './partials/voteSection'

export function PagePoliticianDetails({ children }: { children: ReactNode }) {
  return <div className="standard-spacing-from-navbar container max-w-3xl">{children}</div>
}

function PoliticianHeader({
  person,
  countryCode,
  showRoleLocation = true,
  showDonateButton = true,
}: {
  person: PoliticianDetails
  countryCode: SupportedCountryCodes
  showRoleLocation?: boolean
  showDonateButton?: boolean
}) {
  const roleNameResolver = getRoleNameResolver(countryCode)

  return (
    <div className="flex flex-col items-center sm:flex-row">
      <ProfileAvatar className="box-mb-6 sm:mb-0 sm:mr-7" person={person} size={200} />

      <div className="flex flex-col sm:items-start">
        <PageTitle className="mb-3" size="lg">
          {dtsiPersonFullName(person)}
        </PageTitle>

        {person.primaryRole && (
          <div>
            <p className="mb-5 text-xl font-normal text-black/80">
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
                <span className="font-normal">
                  {' '}
                  from {getDTSIPersonRoleLocation(person.primaryRole)}
                </span>
              )}
            </p>

            {getHasDTSIPersonRoleEnded(person.primaryRole) && (
              <div>{getFormattedDTSIPersonRoleDateRange(person.primaryRole)}</div>
            )}

            <PoliticianLinks person={person} showDonateButton={showDonateButton} />
          </div>
        )}
      </div>
    </div>
  )
}

PagePoliticianDetails.Header = PoliticianHeader

function PoliticianLinks({
  person,
  showDonateButton = true,
}: {
  person: PoliticianDetails
  showDonateButton?: boolean
}) {
  return (
    <div className="flex items-center justify-center gap-3 sm:justify-start">
      {showDonateButton && person.donationUrl && (
        <Button asChild className="px-8 text-base">
          <ExternalLink href={person.donationUrl}>Donate</ExternalLink>
        </Button>
      )}

      {Boolean(person.officialUrl) && (
        <Button asChild className="h-12 w-12 rounded-full p-3" variant="secondary">
          <ExternalLink href={person.officialUrl}>
            <Globe className="h-7 w-7" />
            <span className="sr-only">{person.officialUrl}</span>
          </ExternalLink>
        </Button>
      )}

      {person.twitterAccounts.slice(0, 1).map(account => (
        <Button
          asChild
          className="h-12 w-12 rounded-full p-[14px]"
          key={account.id}
          variant="secondary"
        >
          <ExternalLink href={dtsiTwitterAccountUrl(account)}>
            <NextImage alt="x.com logo" height={22} src={'/misc/xDotComLogo.svg'} width={22} />
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
  person: PoliticianDetails
  countryCode: SupportedCountryCodes
}) {
  return (
    <section>
      <VoteSection countryCode={countryCode} person={person} />
      <StatementSection countryCode={countryCode} person={person} />
    </section>
  )
}

PagePoliticianDetails.Stances = PoliticianStances
