'use client'

import { useEffect } from 'react'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { MaybeDonateButton } from '@/components/app/maybeDonateButton'
import { PACFooter } from '@/components/app/pacFooter'
import { DTSIPersonHeroCardDonateButton } from '@/components/app/pageEndorsedCandidates/dtsiPersonHeroCardDonateButton'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_EndorsedCandidatesQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

interface LocationStateSpecificProps extends DTSI_EndorsedCandidatesQuery {
  locale: SupportedLocale
}

export function PageEndorsedCandidates({ people, locale }: LocationStateSpecificProps) {
  const urls = getIntlUrls(locale)

  useEffect(() => {
    void actionCreateUserActionViewKeyRaces()
  }, [])

  return (
    <div className="space-y-20">
      <DarkHeroSection>
        <div className="container space-y-4 text-center">
          <h2>
            <InternalLink className="text-gray-400" href={urls.locationUnitedStates()}>
              United States
            </InternalLink>{' '}
            / <span>Endorsements</span>
          </h2>
          <PageTitle as="h1" size="lg">
            Stand With Crypto PAC 2024 House and Senate Endorsements
          </PageTitle>
          <h3 className="font-mono text-xl font-light">
            2024 will be a monumental election year and Congress holds the power to shape the future
            of crypto in the US. SWC is committed to supporting pro-crypto candidates and we are
            proud to endorse the candidates below. You can support the candidates directly by
            clicking on their links.
          </h3>

          <MaybeDonateButton
            donationUrl="https://commerce.coinbase.com/checkout/f1fa8e95-d8d9-45e4-8329-e11ad95f5c34"
            variant="secondary"
          >
            Donate to all candidates
          </MaybeDonateButton>
        </div>
      </DarkHeroSection>

      <DTSIPersonHeroCardRow className="mx-auto max-lg:max-w-2xl">
        {people.map(person => (
          <DTSIPersonHeroCard
            footer={
              person?.donationUrl ? (
                <DTSIPersonHeroCardDonateButton donationUrl={person.donationUrl} />
              ) : null
            }
            key={person.id}
            locale={locale}
            person={person}
            subheader="role-w-state"
          />
        ))}
      </DTSIPersonHeroCardRow>

      <PACFooter className="container" />
    </div>
  )
}
