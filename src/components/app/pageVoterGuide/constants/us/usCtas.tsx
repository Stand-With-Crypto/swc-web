import { Suspense } from 'react'
import { UserActionType } from '@prisma/client'

import { KeyRacesDialog } from '@/components/app/pageVoterGuide/keyRacesDialog'
import { VoterGuideStep } from '@/components/app/pageVoterGuide/types'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionFormVotingInformationResearchedDialog } from '@/components/app/userActionFormVotingInformationResearched/dialog'
import {
  USUserActionVoterAttestationCampaignName,
  USUserActionVoterRegistrationCampaignName,
  USUserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export const ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED = 'User Action Form Get Informed'

export const US_VOTER_GUIDE_CTAS: VoterGuideStep[] = [
  {
    title: 'Get informed',
    description: 'See where politicians on your ballot stand on crypto.',
    WrapperComponent: KeyRacesDialog,
    action: UserActionType.VOTER_ATTESTATION,
    campaignName: USUserActionVoterAttestationCampaignName['H1_2025'],
    image: '/actionTypeIcons/getInformedAction.png',
    wideDesktopImage: true,
  },
  {
    title: 'Check your voter registration',
    description: 'Make sure you’re registered to vote in this year’s election.',
    WrapperComponent: UserActionFormVoterRegistrationDialog,
    action: UserActionType.VOTER_REGISTRATION,
    campaignName: USUserActionVoterRegistrationCampaignName['H1_2025'],
    image: '/actionTypeIcons/voterAttestation.png',
  },
  {
    title: 'Prepare to vote',
    description: 'Find your polling location and learn about early voting options.',
    WrapperComponent: ({ children }) => {
      return (
        <Suspense fallback={children}>
          <UserActionFormVotingInformationResearchedDialog
            initialValues={{
              campaignName: USUserActionVotingInformationResearchedCampaignName['H1_2025'],
              address: undefined,
              shouldReceiveNotifications: false,
            }}
          >
            {children}
          </UserActionFormVotingInformationResearchedDialog>
        </Suspense>
      )
    },
    action: UserActionType.VOTING_INFORMATION_RESEARCHED,
    campaignName: USUserActionVotingInformationResearchedCampaignName['H1_2025'],
    image: '/actionTypeIcons/votingResearched.png',
  },
]
