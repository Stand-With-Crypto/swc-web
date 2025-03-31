import { QUESTIONNAIRE_HASH_KEY } from '@/components/app/pagePoliticianDetails/common/constants'
import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails/common/politiciansDetails'
import { QuestionnaireAccordion } from '@/components/app/pagePoliticianDetails/common/questionnaireAccordion'
import { ScoreExplainer } from '@/components/app/pagePoliticianDetails/common/scoreExplainer'
import { ScrollToTopOnRender } from '@/components/app/scrollToTopOnRender'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { NormalizedQuestionnaire } from '@/utils/server/builder/models/data/questionnaire'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.AU

export function AuPagePoliticianDetails({
  person,
  questionnaire,
}: {
  person: DTSIPersonDetails
  questionnaire: NormalizedQuestionnaire | null
}) {
  return (
    <PagePoliticianDetails>
      <section>
        <PagePoliticianDetails.Header person={person} showRoleLocation={false} />
        <PagePoliticianDetails.Links person={person} showDonateButton={false} />
        <ScoreExplainer person={person} useLetterGrade={false} />
      </section>

      {questionnaire && <QuestionnaireAccordion questionnaire={questionnaire} />}

      <section>
        <PagePoliticianDetails.Stances countryCode={countryCode} person={person} />
      </section>

      <ScrollToTopOnRender blockedHashes={[QUESTIONNAIRE_HASH_KEY]} />
    </PagePoliticianDetails>
  )
}
