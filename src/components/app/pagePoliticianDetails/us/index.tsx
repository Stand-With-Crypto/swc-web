import { QUESTIONNAIRE_HASH_KEY } from '@/components/app/pagePoliticianDetails/common/constants'
import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails/common/politiciansDetails'
import { ScoreExplainer } from '@/components/app/pagePoliticianDetails/common/scoreExplainer'
import { QuestionnaireAccordion } from '@/components/app/pagePoliticianDetails/us/questionnaireAccordion'
import { ScrollToTopOnRender } from '@/components/app/scrollToTopOnRender'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import type { NormalizedQuestionnaire } from '@/utils/server/builder/models/data/questionnaire'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function UsPagePoliticianDetails({
  person,
  countryCode,
  questionnaire,
}: {
  person: DTSIPersonDetails
  countryCode: SupportedCountryCodes
  questionnaire: NormalizedQuestionnaire | null
}) {
  return (
    <PagePoliticianDetails>
      <section>
        <PagePoliticianDetails.Header person={person} />
        <PagePoliticianDetails.Links person={person} />
        <ScoreExplainer person={person} useLetterGrade />
      </section>

      {questionnaire && <QuestionnaireAccordion questionnaire={questionnaire} />}

      <section>
        <PagePoliticianDetails.Stances countryCode={countryCode} person={person} />
      </section>

      <ScrollToTopOnRender blockedHashes={[QUESTIONNAIRE_HASH_KEY]} />
    </PagePoliticianDetails>
  )
}
