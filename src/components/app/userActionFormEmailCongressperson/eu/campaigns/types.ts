import { z } from 'zod'

import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { EUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/eu/euUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/eu'
import { zodAddress } from '@/validation/fields/zodAddress'

export interface CampaignMetadata {
  campaignName: EUUserActionEmailCampaignName
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
