import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { DTSIPersonHeroCardRow } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardRow'
import { PACFooter } from '@/components/app/pacFooter'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_EndorsedCandidatesQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'

interface LocationStateSpecificProps extends DTSI_EndorsedCandidatesQuery {
  locale: SupportedLocale
}

export function PageEndorsedCandidates({ people, locale }: LocationStateSpecificProps) {
  return (
    <div className="standard-spacing-from-navbar space-y-20">
      <section className="container">
        <PageTitle as="h1">Stand With Crypto PAC 2024 House and Senate Endorsements</PageTitle>
        <h2 className="mx-auto mt-6 space-y-4 text-center text-fontcolor-muted">
          <p>
            2024 will be a monumental election year and Congress holds the power to shape the future
            of crypto in the U.S.
          </p>

          <p>
            Stand With Crypto is committed to supporting pro-crypto candidates and we are proud to
            endorse the candidates below.
          </p>

          {/*
          Uncomment once we have a PAC donate button
           <p>
          You can support the candidates directly, or click the donate button below to support the
          SWC PAC that will disburse funds to all the endorsed candidates below.
        </p> 
        */}
        </h2>
      </section>
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
