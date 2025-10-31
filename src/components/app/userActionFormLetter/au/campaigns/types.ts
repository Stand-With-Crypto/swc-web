import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/au'
import type { PostGridSenderContact } from '@/validation/fields/zodPostGridAddress'

export interface CampaignMetadata {
  campaignName: AUUserActionLetterCampaignName
  dialogTitle: string
  dialogSubtitle: string
  politicianCategory: YourPoliticianCategory
  getLetterBodyText: (props?: GetTextProps & { address?: string }) => string
  templateId: string
  senderAddress: Omit<PostGridSenderContact, 'metadata'>
}
