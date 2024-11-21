'use client'

import Balancer from 'react-wrap-balancer'

import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { PACFooter } from '@/components/app/pacFooter'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { QueryDTSILocationUnitedStatesInformationData } from '@/data/dtsi/queries/queryDTSILocationUnitedStatesInformation'
import { SupportedLocale } from '@/intl/locales'
import { formatDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizePeople } from './organizePeople'
import { UserAddressVoterGuideInputSection } from './userAddressVoterGuideInput'

interface LocationUnitedStatesProps extends QueryDTSILocationUnitedStatesInformationData {
  locale: SupportedLocale
  countAdvocates: number
}

export function LocationUnitedStates({
  locale,
  countAdvocates,
  ...queryData
}: LocationUnitedStatesProps) {
  const groups = organizePeople(queryData)
  const urls = getIntlUrls(locale)

  return (
    <div className="space-y-20">
      <DarkHeroSection>
        <div className="space-y-6 text-center">
          <PageTitle as="h1" size="md">
            Key Races in the United States
          </PageTitle>
          <h2 className="space-y-4 font-light text-muted lg:space-y-1">
            <p>
              <Balancer>
                2024 will be a monumental election year and Congress holds the power to shape the
                future of crypto in the U.S.
              </Balancer>
            </p>
          </h2>
          <h3 className="text-xl font-bold">
            <FormattedNumber amount={countAdvocates} locale={locale} /> advocates in the U.S.
          </h3>
          <UserActionFormVoterRegistrationDialog>
            <Button className="mt-6 w-full max-w-xs" variant="secondary">
              Make sure you're registered to vote
            </Button>
          </UserActionFormVoterRegistrationDialog>
        </div>
      </DarkHeroSection>
      <div className="space-y-20 xl:space-y-28">
        {!!groups.president.length && (
          <DTSIPersonHeroCardSection
            cta={
              <InternalLink href={urls.locationUnitedStatesPresidential()}>View race</InternalLink>
            }
            locale={locale}
            people={groups.president}
            recommend={false}
            subtitle="Vote for pro-crypto candidates. See where presidential candidates stand on crypto."
            title={<>Presidential Race</>}
          />
        )}
        <UserAddressVoterGuideInputSection locale={locale} />
        <ContentSection
          className="container"
          subtitle={
            'There are dozens of races in the House and the Senate that matter in this upcoming election. View your state below:'
          }
          title={'Key Races Across US States'}
        >
          <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
            {Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(_stateCode => {
              const stateCode = _stateCode as USStateCode
              return (
                <InternalLink
                  className={cn('mb-4 block flex-shrink-0 font-semibold')}
                  href={urls.locationStateSpecific(stateCode)}
                  key={stateCode}
                >
                  {US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
                </InternalLink>
              )
            })}
          </div>
        </ContentSection>

        {Object.entries(groups.keyRaces).map(([stateCode, races]) => {
          const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as USStateCode]
          return (
            <div className="container flex flex-col items-center" key={stateCode}>
              <NextImage
                alt={`${stateName} shield`}
                height={150}
                src={`/stateShields/${stateCode}.png`}
                width={150}
              />

              <PageTitle as="h2" size="sm">
                {stateName}
              </PageTitle>

              {races.map(people => {
                const primaryDistrict =
                  people[0].runningForSpecificRole.primaryDistrict &&
                  normalizeDTSIDistrictId(people[0].runningForSpecificRole)

                return (
                  <DTSIPersonHeroCardSection
                    cta={
                      <InternalLink
                        href={
                          primaryDistrict
                            ? urls.locationDistrictSpecific({
                                stateCode: stateCode as USStateCode,
                                district: primaryDistrict,
                              })
                            : urls.locationStateSpecificSenateRace(stateCode as USStateCode)
                        }
                      >
                        View race
                      </InternalLink>
                    }
                    key={`${stateCode}-${primaryDistrict}`}
                    locale={locale}
                    people={people}
                    subtitle={
                      primaryDistrict ? (
                        <>
                          {stateName} {formatDTSIDistrictId(primaryDistrict)} Congressional District
                          Race
                        </>
                      ) : (
                        <>{stateName} Senate Race</>
                      )
                    }
                    title=""
                  />
                )
              })}
            </div>
          )
        })}

        <PACFooter className="container" />
      </div>
    </div>
  )
}
