import { KeyRacesDialog } from '@/components/app/pageVoterGuide/keyRacesDialog'
import { UserActionFormVoterAttestationDialog } from '@/components/app/userActionFormVoterAttestation/dialog'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import {
  UserActionCampaignName,
  UserActionViewKeyRacesCampaignName,
  UserActionVoterAttestationCampaignName,
  UserActionVoterRegistrationCampaignName,
} from '@/utils/shared/userActionCampaigns'
import { UserActionType } from '@prisma/client'

type VoterGuideStep = {
  title: string
  description: string
  WrapperComponent: (args: { children: React.ReactNode }) => React.ReactNode
  action: UserActionType
  campaignName: UserActionCampaignName
}

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
    title: 'Get updates',
    description:
      'We’ll send you information on polling locations as it gets closer to the election.',
    WrapperComponent: UserActionFormVoterAttestationDialog,
    action: UserActionType.VOTER_ATTESTATION,
    campaignName: UserActionVoterAttestationCampaignName.DEFAULT,
  },
]
