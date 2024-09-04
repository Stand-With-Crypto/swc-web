import { UserActionType } from '@prisma/client'

import { KeyRacesDialog } from '@/components/app/pageVoterGuide/keyRacesDialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { UserActionFormVotingInformationResearchedDialog } from '@/components/app/userActionFormVotingInformationResearched/dialog'
import {
  UserActionCampaignName,
  UserActionViewKeyRacesCampaignName,
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
    description: 'View key races in your area and see where politicians stand on crypto.',
    WrapperComponent: KeyRacesDialog,
    action: UserActionType.VIEW_KEY_RACES,
    campaignName: UserActionViewKeyRacesCampaignName['2024_ELECTION'],
  },
  {
    title: 'Make sure you’re registered to vote',
    description: 'Check your voter registration status. Earn a free NFT from pplpleasr.',
    WrapperComponent: UserActionFormVoterRegistrationDialog,
    action: UserActionType.VOTER_REGISTRATION,
    campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
  },
  {
    title: 'Get ready to vote',
    description:
      'Find your polling location and check to see if there are early voting options in your district.',
    WrapperComponent: ({ children }) => {
      return (
        <UserActionFormVotingInformationResearchedDialog
          initialValues={{
            campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
          }}
        >
          {children}
        </UserActionFormVotingInformationResearchedDialog>
      )
    },
    action: UserActionType.VOTING_INFORMATION_RESEARCHED,
    campaignName: UserActionVotingInformationResearchedCampaignName['2024_ELECTION'],
  },
]
