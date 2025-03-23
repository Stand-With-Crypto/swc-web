# Working with two or more campaigns active at the same time

- [Working with two or more campaigns active at the same time](#working-with-two-or-more-campaigns-active-at-the-same-time)
  - [Create the campaign](#create-the-campaign)
  - [Country-specific campaigns](#country-specific-campaigns)
  - [Change CTAs priority order](#change-ctas-priority-order)
  - [Create the corresponding modules for the campaign](#create-the-corresponding-modules-for-the-campaign)
  - [Create the campaign CTA](#create-the-campaign-cta)
  - [Update the deeplink URL for our internal deeplink page](#update-the-deeplink-url-for-our-internal-deeplink-page)
  - [Update the variantRecentActivityRow](#update-the-variantrecentactivityrow)
  - [How to disable the campaign after it is not necessary anymore](#how-to-disable-the-campaign-after-it-is-not-necessary-anymore)

### Create the campaign

- Add the new campaign to the appropriate user action in `src/utils/shared/userActionCampaigns.ts`. Please choose a specific campaign name that isn't too generic to avoid potential issues in the future. One suggestion is to include a date in the name. e.g.:

```javascript
/// userActionCampaigns.ts

export enum UserActionTweetAtPersonCampaignName {
  'DEFAULT' = 'DEFAULT',
  '2024_05_22_PIZZA_DAY' = '2024_05_22_PIZZA_DAY', // new campaign for tweet at person action
}
```

### Country-specific campaigns

When creating campaigns that should behave differently based on country:

1. **Define country-specific campaign values**:

   ```javascript
   // src/components/app/userActionGridCTAs/constants/us/usCtas.tsx
   export const US_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
     [UserActionType.TWEET]: {
       // US general tweet action configuration
       campaigns: [
         {
           actionType: UserActionType.TWEET,
           campaignName: UserActionTweetCampaignName['2024_05_22_PIZZA_DAY'],
           isCampaignActive: true,
           title: 'US Bitcoin Pizza Day',
           description: 'Tweet about Bitcoin Pizza Day in the US',
           canBeTriggeredMultipleTimes: true,
           WrapperComponent: ({ children }) => (
             <UserActionFormTweetDialog countryCode="US" defaultOpen={false}>
               {children}
             </UserActionFormTweetDialog>
           ),
         }
       ]
     }
   };

   // src/components/app/userActionGridCTAs/constants/gb/gbCtas.tsx
   export const GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
     [UserActionType.TWEET]: {
       // GB general tweet action configuration
       campaigns: [
         {
           actionType: UserActionType.TWEET,
           campaignName: UserActionTweetCampaignName['2024_05_22_PIZZA_DAY'],
           isCampaignActive: true,
           title: 'GB Bitcoin Pizza Day',
           description: 'Tweet about Bitcoin Pizza Day in the GB',
           canBeTriggeredMultipleTimes: true,
           WrapperComponent: ({ children }) => (
             <UserActionFormTweetDialog countryCode="GB" defaultOpen={false}>
               {children}
             </UserActionFormTweetDialog>
           ),
         }
       ]
     }
   };
   ```

2. **Implement country-specific UI components**:

   Create dedicated UI components for each country or use dynamic country-based configuration as described in the [country-specific implementations section](/docs/Add%20a%20new%20user%20action.md#country-specific-implementations).

### Change CTAs priority order

- The order of action cards is determined by the arrangement of action objects within `USER_ACTION_CTAS_FOR_GRID_DISPLAY` (`src/components/app/userActionGridCTAs/constants/ctas.tsx`). This applies similarly to each action campaign array. If you need to change the order of campaigns or actions, you can easily do so by repositioning the relevant action or campaign within the respective actions object or campaigns array.

- For country-specific CTAs, you can set different priorities in each country's configuration file:

```javascript
// For US, show EMAIL first, then TWEET
// src/components/app/userActionGridCTAs/constants/us/usCtas.tsx
export const US_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.EMAIL]: { /* ... */ },
  [UserActionType.TWEET]: { /* ... */ }
};

// For GB, show TWEET first, then EMAIL
// src/components/app/userActionGridCTAs/constants/gb/gbCtas.tsx
export const GB_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.TWEET]: { /* ... */ },
  [UserActionType.EMAIL]: { /* ... */ }
};
```

### Create the corresponding modules for the campaign

- You need to create all the necessary UI components, dialogs, deeplink page, server actions, and any other elements required for the new campaign to function correctly. [Refer to this document for reference](/docs/Add%20a%20new%20user%20action.md#create-ui)

### Create the campaign CTA

- To define the new campaign CTA, update the related action campaigns array in the appropriate country CTA configuration:

```javascript
/// src/components/app/userActionGridCTAs/constants/us/usCtas.tsx
export const US_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
  [UserActionType.EMAIL]: {
    // General email action configuration
    campaigns: [
      {
        actionType: UserActionType.EMAIL,
        campaignName: USUserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024,
        isCampaignActive: true,
        title: `Email CNN about the Presidential Debate`,
        description: 'Make your voice heard about crypto in the debate. We make it easy.',
        canBeTriggeredMultipleTimes: true,
        WrapperComponent: ({ children }) => (
          <UserActionFormEmailDialog countryCode="US" defaultOpen={false}>
            {children}
          </UserActionFormEmailDialog>
        ),
      },
      // Add more campaigns here
    ]
  }
};
```

For details about each field, please refer to `src/components/app/userActionGridCTAs/types/index.ts`.

### Update the deeplink URL for our internal deeplink page

- Add the campaign-specific deeplink path in `USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP` in `src/utils/shared/urlsDeeplinkUserActions.ts`:

```javascript
const USER_ACTION_WITH_CAMPAIGN_DEEPLINK_MAP: {
  [key in ActiveClientUserActionType]?: {
    [campaign in UserActionCampaigns[key]]?: DeeplinkFunction
  }
} = {
  [UserActionType.EMAIL]: {
    [USUserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/email-cnn`
    },
    // Add your new campaign here
    [USUserActionEmailCampaignName.YOUR_NEW_CAMPAIGN]: ({ countryCode }) => {
      return `${getIntlPrefix(countryCode)}/action/your-new-campaign-path`
    },
  },
}
```

- With this configuration, the system will automatically use the appropriate URL when `getUserActionDeeplink` is called with your campaign:

```javascript
const url = getUserActionDeeplink({
  actionType: UserActionType.EMAIL,
  campaign: USUserActionEmailCampaignName.YOUR_NEW_CAMPAIGN,
  config: { countryCode },
})
```

- If your campaign doesn't have a specific deeplink defined, it will fall back to using the default deeplink for that action type.

### Update the variantRecentActivityRow

- If there is a specific activity row for the campaign, you will need to update `VariantRecentActivityRow` in `src/components/app/recentActivityRow/variantRecentActivityRow.tsx` for the corresponding campaign case. e.g.: \_You sent a CNN presidential debate email.

### How to disable the campaign after it is not necessary anymore

- Delete all files related to the campaign that are no longer needed, including UI components, the deeplink page, server actions, and any other associated components.
- Locate the campaign object in `USER_ACTION_CTAS_FOR_GRID_DISPLAY` (`src/components/app/userActionGridCTAs/constants/ctas.tsx`). Set `isCampaignActive` to `false`, and set `WrapperComponent` to null. `WrapperComponent: null.`

```javascript
// In each country file:
// src/components/app/userActionGridCTAs/constants/us/usCtas.tsx
// src/components/app/userActionGridCTAs/constants/gb/gbCtas.tsx
// etc.

{
  actionType: UserActionType.EMAIL,
  campaignName: USUserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024,
  isCampaignActive: false, // This disables the campaign
  title: 'CNN Presidential Debate 2024',
  description: "You emailed CNN and asked them to include the candidates' stance on crypto.",
  canBeTriggeredMultipleTimes: true,
  WrapperComponent: null, // Changing the Wrapper component to null will enable you to delete all campaign files.
}
```
