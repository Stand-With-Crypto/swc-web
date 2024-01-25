// Campaign IDs representing the different campaigns in Capitol Canary.
export const enum CapitolCanaryCampaignId {
  // Testing campaign IDs.
  // TODO: Deprecate ID below once sandbox environment is fully operational.
  TESTING = 137795,

  // Campaign IDs to use when registering a user as a member.
  DEFAULT_MEMBERSHIP = 137775,

  // Campaign IDs to use when registering a user as a subscriber (i.e. opting in to emails or SMS).
  DEFAULT_SUBSCRIBER = 140959,
  ONE_CLICK_NATIVE_SUBSCRIBER = 140958,

  // Campaign IDS to use when sending emails to representatives.
  DEFAULT_EMAIL_REPRESENTATIVE = 137765,
}
