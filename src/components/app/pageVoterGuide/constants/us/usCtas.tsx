import { Suspense } from 'react'
import { UserActionType } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { VoterGuideStep } from '@/components/app/pageVoterGuide/types'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionFormVotingInformationResearchedDialog } from '@/components/app/userActionFormVotingInformationResearched/dialog'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'
import {
  USUserActionVoterRegistrationCampaignName,
  USUserActionVotingInformationResearchedCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

export const ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED = 'User Action Form Get Informed'

export const US_VOTER_GUIDE_CTAS: VoterGuideStep[] = [
  {
    action: UserActionType.OPT_IN,
    campaignName: UserActionOptInCampaignName.DEFAULT,
    title: 'Join Stand With Crypto',
    description: `Join over ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} advocates fighting to keep crypto in America.`,
    WrapperComponent: ({ children }) => (
      <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
    ),
    image: '/actionTypeIcons/optIn.png',
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
