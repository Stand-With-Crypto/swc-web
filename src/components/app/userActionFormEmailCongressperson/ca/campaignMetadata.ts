import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { EmailActionFormValues } from '@/components/app/userActionFormEmailCongressperson'
import {
  getConstituentLocationSignOff,
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/ca'
import { zodAddress } from '@/validation/fields/zodAddress'

const CAMPAIGN_NAME = CAUserActionEmailCampaignName.CA_MOMENTUM_AHEAD_HOUSE_RISING

const SUBJECT = 'Supporting Blockchain as a Priority for Canada’s Innovation Agenda'

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house-of-commons'

export const DIALOG_TITLE = 'Email Your MP'

export const DIALOG_SUBTITLE = 'Support Crucial Crypto Legislation'

export function getEmailBodyText(
  dtsiPeopleFromAddressResponse?: ReturnType<typeof useGetDTSIPeopleFromAddress>,
  addressSchema?: z.infer<typeof zodAddress> | null,
) {
  const dtsiPeople =
    dtsiPeopleFromAddressResponse?.data && 'dtsiPeople' in dtsiPeopleFromAddressResponse.data
      ? dtsiPeopleFromAddressResponse.data.dtsiPeople
      : []
  const representativeName =
    `${dtsiPeople?.[0]?.firstName || ''} ${dtsiPeople?.[0]?.lastName || ''}`.trim() ||
    'Representative'

  return (props?: GetTextProps) => {
    const { firstName, lastName } = props || {}

    const fullNameSignOff = getFullNameSignOff({
      firstName,
      lastName,
    })
    const locationSignOff = getConstituentLocationSignOff(addressSchema)

    return `Dear ${representativeName},

I’m writing as someone who cares about Canada’s economic resilience and future competitiveness. I know you share those priorities too.

One area with growing potential is blockchain technology. While often associated with finance, it offers far broader benefits, from secure digital identity to more efficient public services. It’s a tool that can help modernize systems, support entrepreneurs, and strengthen consumer trust.

Other countries are already moving to integrate blockchain into their innovation plans. Canada has the talent and values to lead in this space if we take thoughtful steps forward.

As Parliament continues its work, I hope you’ll consider the role blockchain can play in advancing innovation and improving public outcomes.

Thank you for your leadership and service.${fullNameSignOff}${locationSignOff}`
  }
}

export function getDefaultFormValuesWithCampaignMetadata({
  user,
  dtsiSlugs,
}: {
  user: GetUserFullProfileInfoResponse['user']
  dtsiSlugs: string[]
}): Partial<EmailActionFormValues> {
  const unauthedValues = {
    campaignName: CAMPAIGN_NAME,
    firstName: '',
    lastName: '',
    emailAddress: '',
    contactMessage: getEmailBodyText()(),
    subject: SUBJECT,
    address: undefined,
    dtsiSlugs,
  }

  if (user) {
    return {
      ...unauthedValues,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
      contactMessage: getEmailBodyText()({
        firstName: user.firstName,
        lastName: user.lastName,
      }),
      address: user.address?.route
        ? {
            description: user.address.formattedDescription,
            place_id: user.address.googlePlaceId,
          }
        : undefined,
    }
  }

  return unauthedValues
}
