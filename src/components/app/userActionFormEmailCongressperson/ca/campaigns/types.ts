import { z } from 'zod'

import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/ca'
import { zodAddress } from '@/validation/fields/zodAddress'

export interface CampaignMetadata {
  campaignName: CAUserActionEmailCampaignName
  dialogTitle: string
  dialogSubtitle: string
  politicianCategory: YourPoliticianCategory
  subject: string
  getEmailBodyText: (
    props?: GetTextProps & {
      address?: string
      dtsiPeopleFromAddressResponse?: ReturnType<typeof useGetDTSIPeopleFromAddress>
      addressSchema?: z.infer<typeof zodAddress> | null
    },
  ) => string
}
