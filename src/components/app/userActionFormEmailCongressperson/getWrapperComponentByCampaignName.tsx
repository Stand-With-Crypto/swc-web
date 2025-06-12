import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import {
  UserActionFormEmailCongresspersonDialog,
  UserActionFormEmailCongresspersonDialogProps,
} from './dialog'

export const getEmailActionWrapperComponentByCampaignName = (
  campaignName: USUserActionEmailCampaignName,
) =>
  function EmailActionWrapperComponent(
    props: Omit<UserActionFormEmailCongresspersonDialogProps, 'campaignName'>,
  ) {
    return <UserActionFormEmailCongresspersonDialog {...props} campaignName={campaignName} />
  }
