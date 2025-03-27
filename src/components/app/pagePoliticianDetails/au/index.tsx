import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails/common/politiciansDetails'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ScoreExplainer } from '@/components/app/pagePoliticianDetails/common/scoreExplainer'

import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'

import { ScrollToTopOnRender } from '@/components/app/scrollToTopOnRender'
import { QUESTIONNAIRE_HASH_KEY } from '@/components/app/pagePoliticianDetails/common/constants'

const countryCode = SupportedCountryCodes.AU

export function AuPagePoliticianDetails({ person }: { person: DTSIPersonDetails }) {
  return (
    <PagePoliticianDetails>
      <section>
        <PagePoliticianDetails.Header person={person} />
        <PagePoliticianDetails.Links person={person} showDonateButton={false} />
        <ScoreExplainer person={person} useLetterGrade={false} />
      </section>

      {/* {questionnaire && <QuestionnaireAccordion questionnaire={questionnaire} />} */}

      <section>
        <PagePoliticianDetails.Stances countryCode={countryCode} person={person} />
      </section>

      <ScrollToTopOnRender blockedHashes={[QUESTIONNAIRE_HASH_KEY]} />
    </PagePoliticianDetails>
  )
}
