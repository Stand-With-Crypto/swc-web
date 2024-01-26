// Campaign IDs representing the different campaigns in the sandbox Capitol Canary.
export const enum SandboxCapitolCanaryCampaignId {
  // Campaign IDs to use when registering a user as a member.
  DEFAULT_MEMBERSHIP = 142628,

  // Campaign IDs to use when registering a user as a subscriber (i.e. opting in to emails or SMS).
  DEFAULT_SUBSCRIBER = 142742,
  ONE_CLICK_NATIVE_SUBSCRIBER = 142743,

  // Campaign IDS to use when sending emails to representatives.
  DEFAULT_EMAIL_REPRESENTATIVE = 142630,
}

// Campaign IDs representing the different campaigns in the production Capitol Canary.
// You should only use the campaign IDs if the environment is production.
//   (hint: use `NEXT_PUBLIC_ENVIRONMENT` to check if environment is production).
export const enum CapitolCanaryCampaignId {
  // Campaign IDs to use when registering a user as a member.
  DEFAULT_MEMBERSHIP = 137775,

  // Campaign IDs to use when registering a user as a subscriber (i.e. opting in to emails or SMS).
  DEFAULT_SUBSCRIBER = 140959,
  ONE_CLICK_NATIVE_SUBSCRIBER = 140958,

  // Campaign IDS to use when sending emails to representatives.
  DEFAULT_EMAIL_REPRESENTATIVE = 137765,
}
