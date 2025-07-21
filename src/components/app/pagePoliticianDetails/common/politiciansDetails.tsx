import React, { ReactNode } from 'react'
import { Globe } from 'lucide-react'

import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ProfileAvatar } from '@/components/ui/profileAvatar'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { useCategorizedStances } from '@/hooks/useCategorizedStances'
import {
  getDTSIPersonRoleLocation,
  getFormattedDTSIPersonRoleDateRange,
  getHasDTSIPersonRoleEnded,
  getRoleNameResolver,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
  shouldPersonHaveStanceScoresHidden,
} from '@/utils/dtsi/dtsiPersonUtils'
import { dtsiTwitterAccountUrl } from '@/utils/dtsi/dtsiTwitterAccountUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

export function PagePoliticianDetails({ children }: { children: ReactNode }) {
  return (
    <div className="standard-spacing-from-navbar container max-w-3xl font-sans">{children}</div>
  )
}

function PoliticianHeader({
  person,
  countryCode,
  showRoleLocation = true,
  showDonateButton = true,
}: {
  person: DTSIPersonDetails
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
            <p className="mb-5 font-sans text-xl font-normal text-black/80">
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
  person: DTSIPersonDetails
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
  person: DTSIPersonDetails
  countryCode: SupportedCountryCodes
}) {
  const { billRelationship, noBillRelationship } = useCategorizedStances(person.stances)

  const votesExtraClassNames =
    '[&>.info-card:first-child]:border-none [&>.info-card]:rounded-none [&>.info-card]:border-t-2 [&>.info-card]:border-t-white'

  return (
    <section>
      <PageTitle as="h2" className="text-center" size="md">
        Vote History
      </PageTitle>

      {billRelationship.length ? (
        <div
          className={cn(
            'mb-16 mt-8 box-border space-y-0 overflow-hidden rounded-3xl',
            votesExtraClassNames,
          )}
        >
          {billRelationship.map(stance => (
            <DTSIStanceDetails
              countryCode={countryCode}
              isStanceHidden={shouldPersonHaveStanceScoresHidden(person)}
              key={stance.id}
              person={person}
              stance={stance}
            />
          ))}
        </div>
      ) : (
        <div className="mb-11 flex items-center justify-center">No recent votes.</div>
      )}

      <PageTitle as="h2" className="text-center" size="md">
        Statements
      </PageTitle>

      {noBillRelationship.length ? (
        <div className="mt-8 space-y-1 md:space-y-1 [&>.info-card+.info-card]:mt-16">
          {noBillRelationship.map(stance => (
            <DTSIStanceDetails
              countryCode={countryCode}
              isStanceHidden={shouldPersonHaveStanceScoresHidden(person)}
              key={stance.id}
              person={person}
              stance={stance}
            />
          ))}
        </div>
      ) : (
        <div className="mb-11 flex items-center justify-center">No recent statements.</div>
      )}
    </section>
  )
}

PagePoliticianDetails.Stances = PoliticianStances
