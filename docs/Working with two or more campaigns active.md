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

## Change CTAs priority order

- The order of action cards is determined by the arrangement of action objects within `USER_ACTION_CTAS_FOR_GRID_DISPLAY` (`src/components/app/userActionGridCTAs/constants/ctas.tsx`). This applies similarly to each action campaign array. If you need to change the order of campaigns or actions, you can easily do so by repositioning the relevant action or campaign within the respective actions object or campaigns array.

## Create the corresponding modules for the campaign

- You need to create all the necessary UI components, dialogs, deeplink page, server actions, and any other elements required for the new campaign to function correctly. [Refer to this document for reference](/docs/Add%20a%20new%20user%20action.md#create-ui)

## Create the campaign CTA

- To define the new campaign CTA, update the related action campaigns array in `USER_ACTION_CTAS_FOR_GRID_DISPLAY`(`src/components/app/userActionGridCTAs/constants/ctas.tsx`) with the new campaign:

```javascript
/// ctas.tsx

{
  actionType: UserActionType.EMAIL,
  campaignName: USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.EMAIL,
  isCampaignActive: false,
  title: `Email your ${getYourPoliticianCategoryShortDisplayName(EMAIL_FLOW_POLITICIANS_CATEGORY)}`,
  description: 'Make your voice heard. We make it easy.',
  canBeTriggeredMultipleTimes: true,
  WrapperComponent: UserActionFormEmailCongresspersonDialog,
},
```

For details about each field, please refer to `src/components/app/userActionGridCTAs/types/index.ts`.

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

- If there is a specific activity row for the campaign, you will need to update `VariantRecentActivityRow` in `src/components/app/recentActivityRow/variantRecentActivityRow.tsx` for the corresponding campaign case. e.g.: \_You sent a CNN presidential debate email.

## How to disable the campaign after it is not necessary anymore

- Delete all files related to the campaign that are no longer needed, including UI components, the deeplink page, server actions, and any other associated components.
- Locate the campaign object in `USER_ACTION_CTAS_FOR_GRID_DISPLAY` (`src/components/app/userActionGridCTAs/constants/ctas.tsx`). Set `isCampaignActive` to `false`, and update `WrapperComponent` to `WrapperComponent: () => null.`

```javascript
{
  actionType: UserActionType.EMAIL,
  campaignName: UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024,
  isCampaignActive: false, // This disables the campaign
  title: 'CNN Presidential Debate 2024',
  description: "You emailed CNN and asked them to include the candidates' stance on crypto.",
  canBeTriggeredMultipleTimes: true,
  WrapperComponent: () => null, // Changing the Wrapper component to return null will enable you to delete all campaign files.
}
```
