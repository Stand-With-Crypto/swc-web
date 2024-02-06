import { SectionNames } from '@/components/app/userActionFormVoterRegistrationNft/constants'
import { UseSectionsReturn } from '@/hooks/useSections'

interface SurveyProps extends UseSectionsReturn<SectionNames> {}

export function Survey({ goToSection }: SurveyProps) {
  return (
    <div className="flex flex-col">
      TODO: Survery
      <button onClick={() => goToSection(SectionNames.VOTER_REGISTRATION_FORM)}>
        Go to voter registration form
      </button>
    </div>
  )
}
