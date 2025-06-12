import {
  getConstituentIntroduction,
  getFullNameSignOff,
  getRepIntro,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/emailBodyUtils'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import {
  getYourPoliticianCategoryShortDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = USUserActionEmailCampaignName.TEST_CAMPAIGN_CREATED_BY_CURSOR

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'senate'

export const DIALOG_TITLE = 'Email Your Senator'

export const DIALOG_SUBTITLE = 'Hello World Title'

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })
  const maybeDistrictIntro = getConstituentIntroduction(props?.location)

  return `${getRepIntro({ dtsiLastName: props?.dtsiLastName })}\n\n${maybeDistrictIntro}, and I wanted to write to you with a test message.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: `Email your ${getYourPoliticianCategoryShortDisplayName('senate')}`,
  dialogSubtitle: 'Hello World Title',
  politicianCategory: 'senate',
  subject: 'Hello World Subject',
  getEmailBodyText,
}
