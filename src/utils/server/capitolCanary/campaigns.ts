import { isJest } from '@/utils/shared/executionEnvironment'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

// Campaign IDs representing the different campaigns in the sandbox Capitol Canary.
export enum SandboxCapitolCanaryCampaignId {
  // Campaign IDs to use when registering a user as a member. Should include "C4 Member" tag when creating.
  DEFAULT_MEMBERSHIP = 142628,

  // Campaign IDs to use when dealing with subscribers (i.e. opting in/out to emails or SMS).
  DEFAULT_SUBSCRIBER = 142742,
  ONE_CLICK_NATIVE_SUBSCRIBER = 142743,

  // Campaign IDS to use when sending emails to representatives.
  DEFAULT_EMAIL_REPRESENTATIVE = 142630,
  DEFAULT_EMAIL_REPRESENTATIVE_AND_SENATORS = 145354,
  DEFAULT_EMAIL_SENATORS = 145353,
}

// Campaign IDs representing the different campaigns in the production Capitol Canary.
// You should only use the campaign IDs if the environment is production.
//   (hint: use `NEXT_PUBLIC_ENVIRONMENT` to check if environment is production).
export enum CapitolCanaryCampaignId {
  // Campaign IDs to use when registering a user as a member. Should include "C4 Member" tag when creating.
  DEFAULT_MEMBERSHIP = 137775,

  // Campaign IDs to use when dealing with subscribers (i.e. opting in to emails or SMS).
  DEFAULT_SUBSCRIBER = 140959,
  ONE_CLICK_NATIVE_SUBSCRIBER = 140958,

  // Campaign IDS to use when sending emails to representatives.
  DEFAULT_EMAIL_REPRESENTATIVE = 137765,
  DEFAULT_EMAIL_REPRESENTATIVE_AND_SENATORS = 145319,
  DEFAULT_EMAIL_SENATORS = 145317,

  ABC_EMAIL = 147473,
}

// These campaign names should map 1:1 with the campaign IDs above.
export const enum CapitolCanaryCampaignName {
  DEFAULT_MEMBERSHIP = 'Default Membership',
  DEFAULT_SUBSCRIBER = 'Default Subscriber',
  ONE_CLICK_NATIVE_SUBSCRIBER = 'One Click Native Subscriber',
  DEFAULT_EMAIL_REPRESENTATIVE = 'Default Email Representative',
}

export function getCapitolCanaryCampaignID(campaignName: CapitolCanaryCampaignName) {
  const campaignIdMap = {
    [CapitolCanaryCampaignName.DEFAULT_MEMBERSHIP]: {
      production: CapitolCanaryCampaignId.DEFAULT_MEMBERSHIP,
      sandbox: SandboxCapitolCanaryCampaignId.DEFAULT_MEMBERSHIP,
    },
    [CapitolCanaryCampaignName.DEFAULT_SUBSCRIBER]: {
      production: CapitolCanaryCampaignId.DEFAULT_SUBSCRIBER,
      sandbox: SandboxCapitolCanaryCampaignId.DEFAULT_SUBSCRIBER,
    },
    [CapitolCanaryCampaignName.ONE_CLICK_NATIVE_SUBSCRIBER]: {
      production: CapitolCanaryCampaignId.ONE_CLICK_NATIVE_SUBSCRIBER,
      sandbox: SandboxCapitolCanaryCampaignId.ONE_CLICK_NATIVE_SUBSCRIBER,
    },
    [CapitolCanaryCampaignName.DEFAULT_EMAIL_REPRESENTATIVE]: {
      production: CapitolCanaryCampaignId.DEFAULT_EMAIL_REPRESENTATIVE,
      sandbox: SandboxCapitolCanaryCampaignId.DEFAULT_EMAIL_REPRESENTATIVE,
    },
  }

  const environment = NEXT_PUBLIC_ENVIRONMENT === 'production' && !isJest ? 'production' : 'sandbox'

  if (!campaignIdMap[campaignName]) {
    throw new Error(`unhandled campaign name`)
  }

  return campaignIdMap[campaignName][environment]
}
