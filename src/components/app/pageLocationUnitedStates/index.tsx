import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { PACFooter } from '@/components/app/pacFooter'
import { UserAddressVoterGuideInput } from '@/components/app/pageLocationUnitedStates/userAddressVoterGuideInput'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_UnitedStatesInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import { ORDERED_KEY_SENATE_RACE_STATES } from '@/utils/shared/locationSpecificPages'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'
import { listOfThings } from '@/utils/web/listOfThings'

import americanFlagImage from './americanFlag.png'
import { organizePeople } from './organizePeople'

interface LocationUnitedStatesProps extends DTSI_UnitedStatesInformationQuery {
  locale: SupportedLocale
  countAdvocates: number
}

export function LocationUnitedStates({
  locale,
  countAdvocates,
  ...queryData
}: LocationUnitedStatesProps) {
  const { endorsed } = queryData
  const groups = organizePeople(queryData)
  const urls = getIntlUrls(locale)
  return (
    <div className="space-y-20">
      <DarkHeroSection>
        <div className="text-center">
          <NextImage
            alt="American flag"
            className="mb-10 inline-block w-40"
            sizes="160px"
            src={americanFlagImage}
          />
          <PageTitle as="h1" className="mb-4" size="md">
            Key Races in the United States
          </PageTitle>
          <PageSubTitle as="h2" className="text-gray-400" size="md">
            View the races critical to keeping crypto in America.
          </PageSubTitle>
          {countAdvocates > 1000 && (
            <h3 className="mt-4 text-xl font-bold text-purple-400">
              <FormattedNumber amount={countAdvocates} locale={locale} /> crypto advocates
            </h3>
          )}
          <UserActionFormVoterRegistrationDialog>
            <Button className="mt-6 w-full max-w-xs" variant="secondary">
              Register to vote
            </Button>
          </UserActionFormVoterRegistrationDialog>
        </div>
      </DarkHeroSection>
      <div className="space-y-20">
        {!!groups.president.length && (
          <DTSIPersonHeroCardSection
            cta={
              <InternalLink href={urls.locationUnitedStatesPresidential()}>View Race</InternalLink>
            }
            locale={locale}
            people={groups.president}
            recommend={false}
            subtitle="Vote for pro-crypto candidates. See where presidential candidates stand on crypto."
            title={<>Presidential Race</>}
          />
        )}
        {!!endorsed.length && (
          <DTSIPersonHeroCardSection
            cta={<InternalLink href={urls.endorsedCandidates()}>View Endorsements</InternalLink>}
            locale={locale}
            people={endorsed}
            recommend={false}
            subtitle="These are the most pro-crypto candidates running for office across America."
            title={<>SWC Endorsed Candidates</>}
          />
        )}
        <ContentSection
          className="container"
          subtitle={
            'Discover the races critical to keeping crypto in America, or enter your address to find your state.'
          }
          title={'Key races'}
        >
          <UserAddressVoterGuideInput locale={locale} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ORDERED_KEY_SENATE_RACE_STATES.map(stateCode => {
              const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
              const people = groups.keySenateRaceMap[stateCode]
              const { recommended, others } = findRecommendedCandidate(people)
              if (!recommended) {
                return null
              }
              return (
                <LinkBox className="border shadow-md" key={stateCode}>
                  <div className="flex items-center justify-center bg-black p-4 antialiased">
                    <div>
                      <NextImage
                        alt={`SWC Shield with an outline of the state of ${stateName}`}
                        height={100}
                        src={`/stateShields/${stateCode}.png`}
                        width={100}
                      />
                    </div>
                    <div className="font-mono text-3xl font-bold text-white">{stateName}</div>
                  </div>
                  <div className="p-6">
                    <p className="mb-4 text-xl font-semibold">Senate</p>
                    <p>
                      <InternalLink
                        className={cn(linkBoxLinkClassName, '!text-fontcolor-muted')}
                        href={urls.locationStateSpecificSenateRace(stateCode)}
                      >
                        Support{' '}
                        <span className="font-semibold !text-fontcolor">
                          {dtsiPersonFullName(recommended)}
                        </span>{' '}
                        {others.length && <>over {listOfThings(others.map(dtsiPersonFullName))}</>}
                      </InternalLink>
                    </p>
                  </div>
                </LinkBox>
              )
            })}
          </div>
        </ContentSection>
        <ContentSection
          className="container"
          subtitle={'Dive deeper and discover races in other states across America.'}
          title={'Other states'}
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
        <PACFooter className="container" />
      </div>
    </div>
  )
}
