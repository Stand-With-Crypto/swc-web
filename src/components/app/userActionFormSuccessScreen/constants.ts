import { UserActionType } from '@prisma/client'

import type { UserActionFormSuccessScreenFeedbackProps } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { ActiveClientUserActionType } from '@/utils/shared/activeUserAction'

export const DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO = {
  WITHOUT_NFT:
    'Keep up the good work! Complete the actions below to continue your progress as a crypto advocate.',
  WITH_NFT:
    '... and got a free NFT for doing so! Complete the actions below to continue your progress as a crypto advocate.',
}

export const USER_ACTION_FORM_SUCCESS_SCREEN_INFO: Record<
  ActiveClientUserActionType,
  UserActionFormSuccessScreenFeedbackProps
> = {
  [UserActionType.EMAIL]: {
    title: 'You emailed your representatives!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.OPT_IN]: {
    title: 'You joined Stand With Crypto!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITH_NFT'],
  },
  [UserActionType.VOTER_REGISTRATION]: {
    title: 'You registered to vote!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITH_NFT'],
  },
  [UserActionType.CALL]: {
    title: 'You called your representatives!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITH_NFT'],
  },
  [UserActionType.TWEET]: {
    title: 'You followed us on X!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.DONATION]: {
    title: 'You donated to help keep crypto in America!',
    description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
  },
  [UserActionType.NFT_MINT]: {
    title: 'Transaction complete',
    description:
      "You've done your part to save crypto, but the fight isn't over yet. Keep the momentum going by completing the next action below.",
  },
  [UserActionType.VOTER_ATTESTATION]: {
    title: 'You pledged to vote',
    description:
      '... and got a free NFT for doing so! Complete the actions below to continue your progress as a crypto advocate.',
  },
}
