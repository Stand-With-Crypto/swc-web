import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { EmailActionFormValues } from '@/components/app/userActionFormEmailCongressperson'
import {
  getFullNameSignOff,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory/ca'

const CAMPAIGN_NAME = CAUserActionEmailCampaignName.DEFAULT

const SUBJECT = 'Support GENIUS Act'

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'senate'

export const DIALOG_TITLE = 'Email Your Senator'

export const DIALOG_SUBTITLE = 'Support Crucial Crypto Legislation'

export function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  return `As a Stand With Crypto Advocate and your constituent, I am one of the tens of millions of Americans who own, build, or develop with cryptocurrencies and blockchain technology. On behalf of the broader crypto community, I urge you to support the Guiding and Establishing National Innovation for U.S. Stablecoins (GENIUS) Act.

In order for the U.S. to realize the full potential of stablecoins, we must foster a regulatory environment that encourages the growth of the crypto industry while ensuring the protection of consumers like myself. The GENIUS Act has the potential to provide clear guidelines and standards for stablecoin regulation, helping to enhance the efficiency of our financial system and maintain U.S. leadership in digital asset innovation.

In the past, you’ve shown commitment to thoughtful and forward-looking legislation, and as one of your constituents I am grateful to you for moving America forward. By supporting the GENIUS Act, you have the opportunity to show this commitment once again.

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
