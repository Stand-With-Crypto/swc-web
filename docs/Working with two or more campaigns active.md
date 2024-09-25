# Working with two or more campaigns active at the same time

- [Create the campaign](#create-the-campaign)
- [Change CTAs priority order](#change-ctas-priority-order)
- [Create the corresponding modules for the campaign](#create-the-corresponding-modules-for-the-campaign)
- [Create the campaign CTA](#create-the-campaign-cta)
- [Update the deeplink URL for our internal deeplink page](#update-the-deeplink-url-for-our-internal-deeplink-page)
- [Update the variantRecentActivityRow](#update-the-variantrecentactivityrow)
- [Create a new card to display when the campaign is deactivated](#create-a-new-card-to-display-when-the-campaign-is-deactivated)
- [How to remove the campaign after it is not necessary anymore](#how-to-remove-the-campaign-after-it-is-not-necessary-anymore)

## Create the campaign

- Add the new campaign to the appropriate user action in `src/utils/shared/userActionCampaigns.ts`. Please choose a specific campaign name that isn’t too generic to avoid potential issues in the future. One suggestion is to include a date in the name. e.g.:

```javascript
/// userActionCampaigns.ts

export enum UserActionTweetAtPersonCampaignName {
  'DEFAULT' = 'DEFAULT',
  '2024_05_22_PIZZA_DAY' = '2024_05_22_PIZZA_DAY', // new campaign for tweet at person action
}
```

- Now update the `USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN` array that is inside the same file(`src/utils/shared/userActionCampaigns.ts`) with the new campaign:

```javascript
/// userActionCampaigns.ts

export const USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN: Partial<UserActionAdditionalCampaigns> = {
  [UserActionType.TWEET_AT_PERSON]: [ // note that the campaign should be added as an array
    UserActionTweetAtPersonCampaignName.2024_05_22_PIZZA_DAY,
  ],
}
```

## Change CTAs priority order

- Next, you’ll need to specify the position of this new campaign in the CTAs list. You can do this by editing `USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN` in `src/utils/web/userActionUtils.ts`. e.g.:

```javascript
/// userActionUtils.ts

export const USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN: ReadonlyArray<{
  action: ActiveClientUserActionType
  campaign: UserActionCampaignName
}> = [
  { action: UserActionType.EMAIL, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.EMAIL },
  { action: UserActionType.OPT_IN, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.OPT_IN },
  {
    action: UserActionType.VOTER_REGISTRATION,
    campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.VOTER_REGISTRATION,
  },
  { action: UserActionType.CALL, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.CALL },
  { action: UserActionType.TWEET, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.TWEET },
  { action: UserActionType.DONATION, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.DONATION },
  { action: UserActionType.TWEET_AT_PERSON, campaign: UserActionTweetAtPersonCampaignName.2024_05_22_PIZZA_DAY }, // new campaign will be presented after donation CTA and before the nft mint CTA
  { action: UserActionType.NFT_MINT, campaign: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.NFT_MINT },
]

```

## Create the corresponding modules for the campaign

- You need to create all the necessary UI components, dialogs, deeplink page, server actions, and any other elements required for the new campaign to function correctly. [Refer to this document for reference](/docs/Add%20a%20new%20user%20action.md#create-ui)

## Create the campaign CTA

- You need to define the new campaign CTA(image, title and subtitle). To do so, edit `USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN` in `src/components/app/userActionRowCTA/constants.tsx` with the corresponding information. e.g.:

```javascript

export const USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN: Record<
  string,
  Omit<UserActionRowCTAProps, 'state'>
> = {
  [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: {
    actionType: UserActionType.EMAIL,
    image: {
      src: '/actionTypeIcons/email-cnn.svg',
    },
    text: 'Ask CNN to include crypto questions at the Presidential Debate',
    subtext: 'Send an email to CNN and tell them we need the candidates’ stance on crypto',
    shortText: 'Email CNN to ask about crypto',
    shortSubtext: 'Send an email to CNN and tell them we need the candidates’ stance on crypto.',
    canBeTriggeredMultipleTimes: true,
    WrapperComponent: UserActionFormEmailCNNDialog, // This is the dialog component related to your new campaign
  },
}
```

## Update the deeplink URL for our internal deeplink page

- Add the path to the deeplink page that you created previously inside `USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP` in `src/utils/shared/urlsDeeplinkUserActions.ts`. e.g.:

```javascript
export const USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP: {
  [key in ActiveClientUserActionType]?: {
    [campaign in UserActionCampaigns[key]]?: DeeplinkFunction
  }
} = {
  [UserActionType.EMAIL]: {
    [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: ({ locale }) => {
      return `${getIntlPrefix(locale)}/action/email-cnn`
    },
  },
}
```

## Update the variantRecentActivityRow

- If there is a specific activity row for the campaign, you will need to update `VariantRecentActivityRow` in `src/components/app/recentActivityRow/variantRecentActivityRow.tsx` for the corresponding campaign case. e.g.: _You sent a CNN presidential debate email._

## Create a new card to display when the campaign is deactivated.

- Please update the `DISABLED_USER_ACTION_CAMPAIGNS` in `src/components/app/pageUserProfile/disabledUserActionCampaigns.ts` to ensure that the new campaign is displayed as a completed action once it is disabled, provided the user has completed it previously. This is crucial for accurately showcasing all user actions campaigns completed, including those that are no longer active.

## How to remove the campaign after it is not necessary anymore

- Delete all files related to the campaign that are no longer needed, including UI components, the deeplink page, server actions, and any other associated components.
- Ensure there is a card displayed when the campaign is deactivated. Refer to [this section for guidance](#create-a-new-card-to-display-when-the-campaign-is-deactivated)
- Remove the campaign from `USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN` in `src/utils/shared/userActionCampaigns.ts`.
- Remove the campaign from `USER_ACTION_TYPE_CTA_PRIORITY_ORDER_WITH_CAMPAIGN` in `src/utils/web/userActionUtils.ts`.
- Remove the campaign from `USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP` in `src/utils/shared/urlsDeeplinkUserActions.ts`
- Remove the campaign from `USER_ACTION_ROW_CTA_INFO_FROM_CAMPAIGN` in `src/components/app/userActionRowCTA/constants.tsx`
