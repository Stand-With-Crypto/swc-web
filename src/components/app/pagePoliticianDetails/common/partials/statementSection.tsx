import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { PoliticianDetails } from '@/components/app/pagePoliticianDetails/common/types'
import { PageTitle } from '@/components/ui/pageTitleText'
import { shouldPersonHaveStanceScoresHidden } from '@/utils/dtsi/dtsiPersonUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

function StatementSection({
  person,
  countryCode,
}: {
  person: PoliticianDetails
  countryCode: SupportedCountryCodes
}) {
  const { noBills } = person.stances

  return (
    <div>
      <PageTitle as="h2" className="text-center" size="md">
        Statements
      </PageTitle>

      {noBills.length ? (
        <div className="mt-8 space-y-1 md:space-y-1 [&>.info-card+.info-card]:mt-16">
          {noBills.map(stance => (
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
    </div>
  )
}

export default StatementSection
