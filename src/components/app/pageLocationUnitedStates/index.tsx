import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { PACFooter } from '@/components/app/pacFooter'
import { UserAddressVoterGuideInput } from '@/components/app/pageLocationUnitedStates/userAddressVoterGuideInput'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { LinkBox } from '@/components/ui/linkBox'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_UnitedStatesInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { ORDERED_KEY_SENATE_RACE_STATES } from '@/utils/shared/locationSpecificPages'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ORDERED_KEY_SENATE_RACE_STATES.map(stateCode => {
              const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
              const people = groups.keySenateRaceMap[stateCode]
              return (
                <LinkBox className="border-2 p-10" key={stateCode}>
                  <p>{stateName}</p>
                  <InternalLink href={urls.locationStateSpecificSenateRace(stateCode)}>
                    {people.map(x => dtsiPersonFullName(x)).join(' vs. ')}
                  </InternalLink>
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
          <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3">
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
