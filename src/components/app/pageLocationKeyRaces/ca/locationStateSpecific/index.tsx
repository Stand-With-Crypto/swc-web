'use client'

import { useEffect } from 'react'
import { isEmpty } from 'lodash-es'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DTSI_PersonStanceType, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import {
  CAProvinceOrTerritoryCode,
  getCAProvinceOrTerritoryNameFromCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'

interface CALocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: CAProvinceOrTerritoryCode
  countAdvocates: number
}

const countryCode = SupportedCountryCodes.CA

export function CALocationStateSpecific({
  stateCode,
  people,
  countAdvocates,
  personStances,
}: CALocationStateSpecificProps) {
  const stances = personStances.filter(x => x.stanceType === DTSI_PersonStanceType.TWEET)
  const groups = organizeStateSpecificPeople(people)
  const urls = getIntlUrls(countryCode)
  const stateName = getCAProvinceOrTerritoryNameFromCode(stateCode)

  useEffect(() => {
    void actionCreateUserActionViewKeyRaces({
      usaState: stateCode,
    })
  }, [stateCode])

  return (
    <div>
      <DarkHeroSection>
        <div className="text-center">
          <h2 className={'mb-4'}>
            <InternalLink className="text-gray-400" href={urls.locationKeyRaces()}>
              Canada
            </InternalLink>{' '}
            / <span>{stateName}</span>
          </h2>
          <PageTitle as="h1" className="mb-4" size="md">
            Key Races in {stateName}
          </PageTitle>
          {countAdvocates > 1000 && (
            <h3 className="mt-4 font-mono text-xl font-light">
              <FormattedNumber
                amount={countAdvocates}
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              crypto advocates
            </h3>
          )}
        </div>
      </DarkHeroSection>

      {isEmpty(groups.houseOfCommons) && isEmpty(groups.senate) ? (
        <PageTitle as="h3" className="mt-20" size="sm">
          There's no key races currently in {stateName}
        </PageTitle>
      ) : (
        <div className="space-y-20">
          {!!groups.houseOfCommons.length && (
            <div className="mt-20">
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink href={urls.locationStateSpecificHouseOfCommonsRace(stateCode)}>
                    View Race
                  </InternalLink>
                }
                people={groups.houseOfCommons}
                title={<>House of Commons Race ({stateCode})</>}
              />
            </div>
          )}
          {groups.senate.length && (
            <div className="mt-20">
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink href={urls.locationStateSpecificSenateRace(stateCode)}>
                    View Race
                  </InternalLink>
                }
                people={groups.senate}
                title={<>Senate Race ({stateCode})</>}
              />
            </div>
          )}
          {!!stances.length && (
            <ContentSection
              subtitle={
                <>Keep up with recent tweets about crypto from politicians in {stateName}.</>
              }
              title={<>What politicians in {stateCode} are saying</>}
            >
              <ScrollArea>
                <div className="flex justify-center gap-5 pb-3 pl-4">
                  {stances.map(stance => {
                    return (
                      <div
                        className="flex w-[300px] shrink-0 flex-col lg:w-[500px]"
                        key={stance.id}
                      >
                        <DTSIStanceDetails
                          bodyClassName="line-clamp-6"
                          className="flex-grow"
                          countryCode={countryCode}
                          hideImages
                          person={stance.person}
                          stance={stance}
                        />
                      </div>
                    )
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ContentSection>
          )}
        </div>
      )}
    </div>
  )
}
