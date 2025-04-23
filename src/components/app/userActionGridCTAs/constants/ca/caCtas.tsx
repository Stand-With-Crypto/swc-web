import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionViewKeyPageDialog } from '@/components/app/userActionFormViewKeyPage/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  CAUserActionPollCampaignName,
  CAUserActionReferCampaignName,
  CAUserActionTweetCampaignName,
  CAUserActionViewKeyPageCampaignName,
  CAUserActionViewKeyRacesCampaignName,
} from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

const countryCode = SupportedCountryCodes.CA
const countryDisplayName = COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]

export const CA_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.OPT_IN]: {
    title: 'Join Stand With Crypto',
    description: `Join the movement to make ${countryDisplayName} the best crypto ecosystem in the world.`,
    mobileCTADescription: `Join the Movement for crypto in ${countryDisplayName}.`,
    campaignsModalDescription: `Join the movement to make ${countryDisplayName} the best crypto ecosystem in the world.`,
    image: '/ca/actionTypeIcons/opt-in.png',
    campaigns: [
      {
        actionType: UserActionType.OPT_IN,
        campaignName: UserActionOptInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Join Stand With Crypto',
        description: `Join the movement to make ${countryDisplayName} the best crypto ecosystem in the world.`,
        canBeTriggeredMultipleTimes: false,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper authenticatedContent={children}>{children}</LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.VIEW_KEY_PAGE]: {
    title: 'Email your Member of Parliament',
    description:
      'Make your voice heard on important crypto policy issues by emailing your representatives.',
    campaignsModalDescription:
      'Make your voice heard on important crypto policy issues by emailing your representatives.',
    image: '/ca/actionTypeIcons/email.png',
    link: ({ children }) => <Link href={getIntlUrls(countryCode).emailDeeplink()}>{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: CAUserActionViewKeyPageCampaignName.CA_Q2_2025_ELECTION,
        isCampaignActive: true,
        title: 'Email your Member of Parliament',
        description: 'Tell your MP to support responsible crypto policy — send an email now!',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionViewKeyPageDialog
            countryCode={countryCode}
            url={getIntlUrls(countryCode).newmodeElectionAction()}
          >
            {children}
          </UserActionViewKeyPageDialog>
        ),
      },
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: CAUserActionViewKeyPageCampaignName.CA_NEWMODE_DEBANKING,
        isCampaignActive: true,
        title: 'Email your MP to stop unfair debanking',
        description: 'Urge them to stand up for financial access and innovation.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionViewKeyPageDialog
            countryCode={countryCode}
            url={getIntlUrls(countryCode).newmodeDebankingAction()}
          >
            {children}
          </UserActionViewKeyPageDialog>
        ),
      },
    ],
  },
  [UserActionType.VIEW_KEY_RACES]: {
    title: 'View Key Races in Canada',
    description:
      'View the key races occurring across Canada that will impact the future of crypto.',
    campaignsModalDescription:
      'View the key races occurring across Canada that will impact the future of crypto.',
    image: '/ca/actionTypeIcons/view-key-races.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_RACES,
        campaignName: CAUserActionViewKeyRacesCampaignName.H1_2025,
        isCampaignActive: true,
        title: 'View Key Races in Canada',
        description:
          'View the key races occurring across Canada that will impact the future of crypto.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <Link href={getIntlUrls(countryCode).locationKeyRaces()}>{children}</Link>
        ),
      },
    ],
  },
  [UserActionType.TWEET]: {
    title: 'Follow us on X',
    description: 'Stay up to date on crypto policy by following @StandWithCryptoCA on X.',
    mobileCTADescription: 'Stay up to date on crypto policy.',
    campaignsModalDescription:
      'Stay up to date on crypto policy by following @StandWithCryptoCA on X.',
    image: '/ca/actionTypeIcons/tweet.png',
    campaigns: [
      {
        actionType: UserActionType.TWEET,
        campaignName: CAUserActionTweetCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Follow us on X',
        description: 'Stay up to date on crypto policy by following @StandWithCryptoCA on X.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormShareOnTwitterDialog countryCode={countryCode}>
            {children}
          </UserActionFormShareOnTwitterDialog>
        ),
      },
    ],
  },
  [UserActionType.REFER]: {
    title: 'Refer a Friend',
    description: 'Get your friend to signup for Stand With Crypto and verify their account.',
    mobileCTADescription:
      'Get your friend to signup for Stand With Crypto and verify their account.',
    campaignsModalDescription: 'Share your referral link with friends to help grow our movement.',
    image: '/ca/actionTypeIcons/refer.png',
    campaigns: [
      {
        actionType: UserActionType.REFER,
        campaignName: CAUserActionReferCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Refer a Friend',
        description: 'You have referred friends to join Stand With Crypto.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <LoginDialogWrapper
            authenticatedContent={
              <UserActionFormReferDialog countryCode={countryCode}>
                {children}
              </UserActionFormReferDialog>
            }
          >
            {children}
          </LoginDialogWrapper>
        ),
      },
    ],
  },
  [UserActionType.POLL]: {
    title: 'Take the poll',
    description: 'Take the poll and see the results.',
    mobileCTADescription: 'Take the poll and see the results.',
    campaignsModalDescription: 'Take the poll and see the results.',
    image: '/actionTypeIcons/voterAttestation.png',
    link: ({ children }) => <Link href="/polls">{children}</Link>,
    campaigns: [
      {
        actionType: UserActionType.POLL,
        campaignName: CAUserActionPollCampaignName.CRYPTO_NEWS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: CAUserActionPollCampaignName.DIGITAL_ASSETS,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.POLL,
        campaignName: CAUserActionPollCampaignName.ENCOURAGE,
        isCampaignActive: true,
        title: 'Take the poll',
        description: 'Take the poll and see the results.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
    ],
  },
}
