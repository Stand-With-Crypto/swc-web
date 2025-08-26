import { QUESTIONNAIRE_HASH_KEY } from '@/components/app/pagePoliticianDetails/common/constants'
import { PagePoliticianDetails } from '@/components/app/pagePoliticianDetails/common/politiciansDetails'
import { QuestionnaireAccordion } from '@/components/app/pagePoliticianDetails/common/questionnaireAccordion'
import { ScoreExplainer } from '@/components/app/pagePoliticianDetails/common/scoreExplainer'
import { PoliticianDetailsPageProps } from '@/components/app/pagePoliticianDetails/common/types'
import { ScrollToTopOnRender } from '@/components/app/scrollToTopOnRender'

export function UsPagePoliticianDetails({
  person,
  countryCode,
  questionnaire,
}: PoliticianDetailsPageProps) {
  return (
    <PagePoliticianDetails>
      <section>
        <PagePoliticianDetails.Header countryCode={countryCode} person={person} />
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
