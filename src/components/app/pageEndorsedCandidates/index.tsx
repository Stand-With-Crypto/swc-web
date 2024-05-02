import Balancer from 'react-wrap-balancer'

import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { PACFooter } from '@/components/app/pacFooter'
import { Button } from '@/components/ui/button'
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
  return (
    <div className="space-y-20">
      <DarkHeroSection>
        <div className="container text-center">
          <h2 className={'mb-4'}>
            <InternalLink className="text-gray-400" href={urls.locationUnitedStates()}>
              United States
            </InternalLink>{' '}
            / <span>Endorsements</span>
          </h2>
          <PageTitle as="h1" className="mb-4" size="md">
            Stand With Crypto PAC 2024 House and Senate Endorsements
          </PageTitle>
          <h3 className="mt-4 space-y-4 font-mono text-xl font-light">
            <p>
              <Balancer>
                2024 will be a monumental election year and Congress holds the power to shape the
                future of crypto in the U.S.
              </Balancer>
            </p>

            <p>
              <Balancer>
                Stand With Crypto is committed to supporting pro-crypto candidates and we are proud
                to endorse the candidates below.
              </Balancer>
            </p>

            {/*
          Uncomment once we have a PAC donate button
           <p>
          You can support the candidates directly, or click the donate button below to support the
          SWC PAC that will disburse funds to all the endorsed candidates below.
        </p> 
        */}
          </h3>
        </div>
      </DarkHeroSection>

      <DTSIPersonHeroCardRow>
        {people.map(person => (
          <DTSIPersonHeroCard
            footer={
              person.donationUrl ? (
                <div className="sm:p-4">
                  <Button className="sm:w-full" variant="secondary">
                    Donate
                  </Button>
                </div>
              ) : null
            }
            key={person.id}
            locale={locale}
            person={person}
            subheader="role"
          />
        ))}
      </DTSIPersonHeroCardRow>

      <PACFooter className="container" />
    </div>
  )
}
