import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { EmailActionFormValues } from '@/components/app/userActionFormEmailCongressperson'
import {
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.FOUNDERS_PUSH_MAY_14_2025

const SUBJECT = 'Support Crypto Legislation'

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house'

export const DIALOG_TITLE = 'Email Your Member of Congress'

export const DIALOG_SUBTITLE = 'Support Crucial Crypto Legislation'

export function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `As a Stand With Crypto Advocate, I am your constituent and one of the tens of millions of Americans who own, build, or develop with cryptocurrencies and blockchain technology. Today, over 60 crypto founders and advocates are flying into D.C. to push for strong crypto legislation. On behalf of the entire crypto community, I urge you to support this important effort.

In order for the U.S. to realize the full potential of crypto, we must foster a regulatory environment that encourages the growth of the crypto industry while ensuring the protection of consumers like myself. We need clear guidelines and standards for regulation, helping to enhance the efficiency of our financial system and maintain U.S. leadership in digital asset innovation.

In the past, you’ve shown a commitment to thoughtful and forward-looking legislation, and as one of your constituents, I am grateful to you for helping move America forward. Thank you for supporting the 52 million Americans who own crypto by backing strong, sensible crypto legislation.

When you stand with crypto, you stand with millions of Americans across the country. Thank you.${fullNameSignOff}`
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
    contactMessage: getEmailBodyText(),
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
      contactMessage: getEmailBodyText({
        firstName: user.firstName,
        lastName: user.lastName,
        address: user?.address?.formattedDescription,
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
