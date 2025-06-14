import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/au'

export interface CampaignMetadata {
  campaignName: AUUserActionEmailCampaignName
  dialogTitle: string
  dialogSubtitle: string
  politicianCategory: YourPoliticianCategory
  subject: string
  getEmailBodyText: (props?: GetTextProps & { address?: string }) => string
}
