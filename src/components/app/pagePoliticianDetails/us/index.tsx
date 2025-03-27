import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails/common/politiciansDetails'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { ScoreExplainer } from '@/components/app/pagePoliticianDetails/common/scoreExplainer'

import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'

import { ScrollToTopOnRender } from '@/components/app/scrollToTopOnRender'
import { QUESTIONNAIRE_HASH_KEY } from '@/components/app/pagePoliticianDetails/common/constants'
import { SWCQuestionnaireAnswers } from '@/utils/shared/zod/getSWCQuestionnaire'
import { QuestionnaireAccordion } from '@/components/app/pagePoliticianDetails/us/questionnaireAccordion'

export function UsPagePoliticianDetails({
  person,
  countryCode,
  questionnaire,
}: {
  person: DTSIPersonDetails
  countryCode: SupportedCountryCodes
  questionnaire: SWCQuestionnaireAnswers | null
}) {
  return (
    <PagePoliticianDetails>
      <section>
        <PagePoliticianDetails.Header person={person} />
        <PagePoliticianDetails.Links person={person} />
        <ScoreExplainer person={person} />
      </section>

      {questionnaire && <QuestionnaireAccordion questionnaire={questionnaire} />}

      <section>
        <PagePoliticianDetails.Stances countryCode={countryCode} person={person} />
      </section>

      <ScrollToTopOnRender blockedHashes={[QUESTIONNAIRE_HASH_KEY]} />
    </PagePoliticianDetails>
  )
}
