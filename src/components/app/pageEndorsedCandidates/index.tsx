import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { PACFooter } from '@/components/app/pacFooter'
import { MaybeDonateButton } from '@/components/app/pageEndorsedCandidates/dtsiPersonHeroCardDonateButton'
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
            2024 will be a monumental election year and Congress holds the power to shape the future
            of crypto in the US. SWC is committed to supporting pro-crypto candidates and we are
            proud to endorse the candidates below. You can support the candidates directly by
            clicking on their links.
          </h3>
        </div>
      </DarkHeroSection>

      <DTSIPersonHeroCardRow className="mx-auto max-w-4xl xl:max-w-6xl">
        {people.map(person => (
          <DTSIPersonHeroCard
            footer={
              person.donationUrl ? <MaybeDonateButton donationUrl={person.donationUrl} /> : null
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
