'use client'

import { SectionNames } from '@/components/app/userActionFormShareOnTwitter/common/constants'
import { CommonShareSection } from '@/components/app/userActionFormShareOnTwitter/common/sections/share'
import { CommonSuccessSection } from '@/components/app/userActionFormShareOnTwitter/common/sections/success'
import { UserActionTweetCountryConfig } from '@/components/app/userActionFormShareOnTwitter/common/types'
import { UKInfoSection } from '@/components/app/userActionFormShareOnTwitter/uk/InfoSection'

export enum UKSectionNames {
  INFO = 'Info',
  SHARE = SectionNames.SHARE,
  SUCCESS = SectionNames.SUCCESS,
}

const ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER_UK = 'User Action Form Share on Twitter UK'

export const ukConfig: UserActionTweetCountryConfig = {
  sections: Object.values(UKSectionNames),
  initialSection: UKSectionNames.INFO,
  analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER_UK,
  sectionComponents: {
    [UKSectionNames.INFO]: UKInfoSection,
    [UKSectionNames.SHARE]: CommonShareSection,
    [UKSectionNames.SUCCESS]: CommonSuccessSection,
  },
  meta: {
    title: 'Follow UK Crypto Advocates',
    subtitle: 'Stay informed about cryptocurrency policy in the United Kingdom',
    followUrl: 'REPLACE_ME',
    followText: 'Follow @REPLACE_ME',
    benefits: [
      'Receive updates on UK crypto regulations',
      'Connect with the British crypto community',
      'Learn about crypto events in the UK',
      'Support crypto advocacy in the United Kingdom',
    ],
  },
}
