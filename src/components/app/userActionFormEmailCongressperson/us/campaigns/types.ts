import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/us'

export interface CampaignMetadata {
  campaignName: USUserActionEmailCampaignName
  dialogTitle: string
  dialogSubtitle: string
  politicianCategory: YourPoliticianCategory
  subject: string
  getEmailBodyText: (props?: GetTextProps & { address?: string }) => string
}
