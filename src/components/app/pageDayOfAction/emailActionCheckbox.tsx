import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import { ActionCheckbox, ActionCheckboxProps } from './actionCheckbox'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export function EmailActionCheckbox({ isCompleted, title, description }: ActionCheckboxProps) {
  return (
    <UserActionFormEmailCongresspersonDialog
      campaignName={USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025}
      countryCode={countryCode}
    >
      <ActionCheckbox description={description} isCompleted={isCompleted} title={title} />
    </UserActionFormEmailCongresspersonDialog>
  )
}
