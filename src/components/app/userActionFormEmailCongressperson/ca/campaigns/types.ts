import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/ca'

export interface CampaignMetadata {
  campaignName: CAUserActionEmailCampaignName
  dialogTitle: string
  dialogSubtitle: string
  politicianCategory: YourPoliticianCategory
  subject: string
  getEmailBodyText: (props?: GetTextProps & { address?: string }) => string
}
