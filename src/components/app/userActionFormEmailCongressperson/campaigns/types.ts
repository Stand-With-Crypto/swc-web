import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'

export interface CampaignMetadata {
  campaignName: USUserActionEmailCampaignName
  dialogTitle: string
  dialogSubtitle: string
  politicianCategory: YourPoliticianCategory
  subject: string
  getEmailBodyText: (props?: GetTextProps & { address?: string }) => string
}
