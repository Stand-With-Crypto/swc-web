import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { VoterGuideStep } from '@/components/app/pageVoterGuide/types'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

export const ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED = 'User Action Form Get Informed'

export const AU_VOTER_GUIDE_CTAS: VoterGuideStep[] = [
  {
    title: 'Get informed',
    description: 'See where politicians on your ballot stand on crypto.',
    WrapperComponent: ({ children, countryCode }) => {
      const urls = getIntlUrls(countryCode ?? DEFAULT_SUPPORTED_COUNTRY_CODE)

      return (
        <Link className="justify-self-center" href={urls.locationKeyRaces()}>
          {children}
        </Link>
      )
    },
    action: UserActionType.VIEW_KEY_RACES,
    campaignName: AUUserActionViewKeyRacesCampaignName['H1_2025'],
    image: '/actionTypeIcons/getInformedAction.png',
    wideDesktopImage: true,
  },
]
