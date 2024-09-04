import { Suspense } from 'react'
import { UserActionType } from '@prisma/client'

import { KeyRacesDialog } from '@/components/app/pageVoterGuide/keyRacesDialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionFormVotingInformationResearchedDialog } from '@/components/app/userActionFormVotingInformationResearched/dialog'
import {
  UserActionCampaignName,
  UserActionVoterAttestationCampaignName,
  UserActionVoterRegistrationCampaignName,
  UserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns'

type VoterGuideStep = {
  title: string
  description: string
  WrapperComponent: (args: { children: React.ReactNode }) => React.ReactNode
  action: UserActionType
  campaignName: UserActionCampaignName
}

export const ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED = 'User Action Form Get Informed'

export const VOTER_GUIDE_STEPS: VoterGuideStep[] = [
  {
    title: 'Get Informed',
    description: 'See where politicians on your ballot stand on crypto.',
    WrapperComponent: KeyRacesDialog,
    action: UserActionType.VOTER_ATTESTATION,
    campaignName: UserActionVoterAttestationCampaignName.DEFAULT,
  },
  {
    title: 'Check your voter registration',
    description: 'Make sure you’re registered to vote in this year’s election.',
    WrapperComponent: UserActionFormVoterRegistrationDialog,
    action: UserActionType.VOTER_REGISTRATION,
    campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
  },
  {
    title: 'Prepare to vote',
    description: 'Find your polling location and learn about early voting options.',
    WrapperComponent: ({ children }) => {
      return (
        <Suspense fallback={children}>
          <UserActionFormVotingInformationResearchedDialog
            initialValues={{
              campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
            }}
          >
            {children}
          </UserActionFormVotingInformationResearchedDialog>
        </Suspense>
      )
    },
    action: UserActionType.VOTING_INFORMATION_RESEARCHED,
    campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
  },
]
