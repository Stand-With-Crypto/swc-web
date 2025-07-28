import { UserActionType } from '@prisma/client'
import Link from 'next/link'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { getEmailActionWrapperComponentByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getWrapperComponentByCampaignName'
import { UserActionFormFollowLinkedInDialog } from '@/components/app/userActionFormFollowOnLinkedIn/common/dialog'
import { UserActionFormReferDialog } from '@/components/app/userActionFormRefer/dialog'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/common/dialog'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/types'
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  CAUserActionEmailCampaignName,
  CAUserActionLinkedInCampaignName,
  CAUserActionPollCampaignName,
  CAUserActionReferCampaignName,
  CAUserActionTweetCampaignName,
  CAUserActionViewKeyPageCampaignName,
  CAUserActionViewKeyRacesCampaignName,
} from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { UserActionOptInCampaignName } from '@/utils/shared/userActionCampaigns/common'

const countryCode = SupportedCountryCodes.CA
const countryDisplayName = COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]

const urls = getIntlUrls(countryCode)

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
  [UserActionType.EMAIL]: {
    title: 'Email your MP',
    description:
      'Make your voice heard on important crypto policy issues by emailing your representatives.',
    mobileCTADescription: 'Support Innovation and Growth',
    campaignsModalDescription:
      'Make your voice heard on important crypto policy issues by emailing your representatives.',
    image: '/ca/actionTypeIcons/email.png',
    campaigns: [
      {
        actionType: UserActionType.EMAIL,
        campaignName: CAUserActionEmailCampaignName.CA_MOMENTUM_AHEAD_HOUSE_RISING,
        isCampaignActive: true,
        title: 'Email your MP',
        description: 'Support Innovation and Growth',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: getEmailActionWrapperComponentByCampaignName({
          countryCode,
          campaignName: CAUserActionEmailCampaignName.CA_MOMENTUM_AHEAD_HOUSE_RISING,
        }),
      },
    ],
  },
  [UserActionType.VIEW_KEY_PAGE]: {
    title: 'Email your member of Parliament',
    description:
      'Make your voice heard on important crypto policy issues by emailing your representatives.',
    campaignsModalDescription:
      'Make your voice heard on important crypto policy issues by emailing your representatives.',
    image: '/ca/actionTypeIcons/email.png',
    link: ({ children }) => (
      <Link href={urls.newmodeMomentumAheadHouseRisingAction()}>{children}</Link>
    ),
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: CAUserActionViewKeyPageCampaignName.CA_Q2_2025_ELECTION,
        isCampaignActive: false,
        title: 'Email your member of Parliament',
        description: 'Tell your MP to support responsible crypto policy — send an email now!',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: CAUserActionViewKeyPageCampaignName.CA_NEWMODE_DEBANKING,
        isCampaignActive: false,
        title: 'Email your MP to stop unfair debanking',
        description: 'Urge them to stand up for financial access and innovation.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
      {
        actionType: UserActionType.VIEW_KEY_PAGE,
        campaignName: CAUserActionViewKeyPageCampaignName.CA_MOMENTUM_AHEAD_HOUSE_RISING,
        isCampaignActive: false,
        title: 'Email your MP',
        description: 'Support Innovation and Growth',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: null,
      },
    ],
  },
  [UserActionType.VIEW_KEY_RACES]: {
    title: 'View key races in Canada',
    description:
      'View the key races occurring across Canada that will impact the future of crypto.',
    campaignsModalDescription:
      'View the key races occurring across Canada that will impact the future of crypto.',
    image: '/ca/actionTypeIcons/view-key-races.png',
    campaigns: [
      {
        actionType: UserActionType.VIEW_KEY_RACES,
        campaignName: CAUserActionViewKeyRacesCampaignName.H1_2025,
        isCampaignActive: false,
        title: 'View key races in Canada',
        description:
          'Viewed the key races occurring across Canada that would impact the future of crypto in early 2025.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => <Link href={urls.locationKeyRaces()}>{children}</Link>,
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
    title: 'Refer a friend',
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
        title: 'Refer a friend',
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
    link: ({ children }) => (
      <Link className="w-full" href={urls.polls()}>
        {children}
      </Link>
    ),
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
  [UserActionType.LINKEDIN]: {
    title: 'Follow us on LinkedIn',
    description: 'Follow us on LinkedIn and stay up to date on crypto policy changes in Canada.',
    mobileCTADescription:
      'Follow us on LinkedIn and stay up to date on crypto policy changes in Canada.',
    campaignsModalDescription:
      'Follow us on LinkedIn and stay up to date on crypto policy changes in Canada.',
    image: '/ca/actionTypeIcons/follow-linkedin.png',
    campaigns: [
      {
        actionType: UserActionType.LINKEDIN,
        campaignName: CAUserActionLinkedInCampaignName.DEFAULT,
        isCampaignActive: true,
        title: 'Follow us on LinkedIn',
        description:
          'Follow us on LinkedIn and stay up to date on crypto policy changes in Canada.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormFollowLinkedInDialog countryCode={countryCode}>
            {children}
          </UserActionFormFollowLinkedInDialog>
        ),
      },
    ],
  },
}
