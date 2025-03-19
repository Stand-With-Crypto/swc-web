# Add a new user action

- [Add a new user action](#add-a-new-user-action)
  - [Create UI](#create-ui)
  - [Country-specific implementations](#country-specific-implementations)
  - [Action Card - CTA](#action-card---cta)
  - [Update database schema](#update-database-schema)
  - [Create a new server action](#create-a-new-server-action)
  - [Add a new airdrop NFT](#add-a-new-airdrop-nft)
  - [Create `/action/actionName` deeplink](#create-actionactionname-deeplink)
  - [Unit tests / E2E tests](#unit-tests--e2e-tests)
  - [Having two or more campaigns active at the same time](#having-two-or-more-campaigns-active-at-the-same-time)

**NOTE: Replace `ActionName` in variable/folder names with the name of the new user action**

### Create UI

- Create a new folder in `src/components/app` called `userActionFormActionName`. All UI should be contained in this folder.
- Typical files in this folder include `dialog.tsx`, `homepageDialogDeeplinkWrapper.tsx`, `userActionFormActionName.tsx`, `index.ts`
- For country-specific implementations, follow the [country-specific implementation guide](#country-specific-implementations)

```javascript
/// dialog.tsx

export function UserActionActionNameFormDialog({
  children,
  defaultOpen = false,
  countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  countryCode?: string
}) {
  // Get country-specific analytics name
  const countryConfig = getUserActionContentByCountry(countryCode)
  const analyticsName = countryConfig.analyticsName

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: analyticsName,
  })

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      <UserActionFormActionName
        countryCode={countryCode}
        onClose={() => dialogProps.onOpenChange(false)}
      />
    </UserActionFormDialog>
  )
}
```

```javascript
/// homepageDialogDeeplinkWrapper.tsx
/// Used in app/[countryCode]/(homepageDialogDeeplink)/action folder

export function UserActionFormActionNameDeeplinkWrapper() {
  usePreventOverscroll()

  const urls = useIntlUrls()
  const router = useRouter()
  useEffect(() => {
    trackDialogOpen({ open: true, analytics: ANALYTICS_NAME_USER_ACTION_FORM_ACTION_NAME })
  }, [])

  return (
    <GeoGate
      countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
      unavailableContent={<UserActionFormActionUnavailable />}
    >
      <UserActionFormActionName
        countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
        onClose={() => router.replace(urls.home())}
      />
    </GeoGate>
  )
}
```

```javascript
/// userActionFormActionName.tsx

export function UserActionFormActionName(props: ShareOnXBaseProps) {
  const { onClose, countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE } = props

  // Get the country-specific configuration
  const countryConfig = getUserActionContentByCountry(countryCode)

  // Setup sections using the country-specific configuration
  const sectionProps = useSections({
    sections: countryConfig.sections,
    initialSectionId: countryConfig.initialSection,
    analyticsName: countryConfig.analyticsName,
  })

  // Get the component for the current section
  const currentSectionId = sectionProps.currentSection
  const SectionComponent = countryConfig.sectionComponents[currentSectionId]

  if (!SectionComponent) {
    sectionProps.onSectionNotFound()
    return null
  }

  // Render the current section component with the needed props
  return <SectionComponent {...sectionProps} countryCode={countryCode} onClose={onClose} />
}
```

### Country-specific implementations

For user actions that need country-specific customizations, follow this structure:

1. Create a folder structure with:

   ```
   userActionFormActionName/
   ├── common/                    # Shared code
   │   ├── types.d.ts             # Type definitions
   │   ├── constants.ts           # Default values and constants
   │   ├── getUserActionContentByCountry.ts  # Get content by country code
   │   └── sections/              # Common section components
   │       ├── sectionOne.tsx     # Shared section component
   │       └── success.tsx        # Success section component
   ├── us/                        # US-specific implementation
   │   └── index.tsx              # US config
   ├── uk/                        # UK-specific implementation
   │   ├── index.tsx              # UK config with overrides
   │   └── ukSpecificComponent.tsx        # UK-specific components (if needed)
   ├── userActionFormActionName.tsx  # Main component
   └── dialog.tsx                 # Dialog component
   ```

2. Define types:

   ```typescript
   // common/types.d.ts
   import { UseSectionsReturn } from '@/hooks/useSections'
   import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

   export type ActionNameSectionProps<T extends string = string> = UseSectionsReturn<T> & {
     countryCode: SupportedCountryCodes
   }

   export interface UserActionNameCountryConfig<
     SectionKeys extends readonly string[] = readonly string[],
   > {
     sections: SectionKeys
     initialSection: SectionKeys[number]
     analyticsName: string
     sectionComponents: Record<SectionKeys[number], React.ComponentType<any>>
     // Action-specific properties
     meta: {
       title: string
       subtitle: string
       // ...
     }
   }
   ```

3. Define common constants and default values:

   ```typescript
   // common/constants.ts
   import { CommonSectionOne } from './sections/sectionOne'
   import { CommonSuccessSection } from './sections/success'
   import { UserActionNameCountryConfig } from './types'

   export enum SectionNames {
     SECTION_ONE = 'SectionOne',
     SUCCESS = 'Success',
   }

   export const ANALYTICS_NAME_USER_ACTION_FORM_ACTION_NAME = 'User Action Form Action Name'

   export const USER_ACTION_DEFAULT_CONTENT: UserActionNameCountryConfig = {
     sections: Object.values(SectionNames),
     initialSection: SectionNames.SECTION_ONE,
     analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_ACTION_NAME,
     sectionComponents: {
       [SectionNames.SECTION_ONE]: CommonSectionOne,
       [SectionNames.SUCCESS]: CommonSuccessSection,
     },
     meta: {
       title: 'Default Title',
       subtitle: 'Default subtitle',
       // Other default values
     },
   }
   ```

4. Define country-specific configurations:

   ```typescript
   // us/index.tsx
   import { USER_ACTION_DEFAULT_CONTENT } from '../common/constants'
   import { UserActionNameCountryConfig } from '../common/types'

   // Add any country-specific overrides here
   export const usConfig: UserActionNameCountryConfig = USER_ACTION_DEFAULT_CONTENT
   ```

   ```typescript
   // uk/index.tsx
   import { SectionNames } from '../common/constants'
   import { CommonSectionOne } from '../common/sections/sectionOne'
   import { CommonSuccessSection } from '../common/sections/success'
   import { UserActionNameCountryConfig } from '../common/types'
   import { UKCustomSection } from './CustomSection'

   export enum UKSectionNames {
     CUSTOM = 'Custom',
     SECTION_ONE = SectionNames.SECTION_ONE,
     SUCCESS = SectionNames.SUCCESS,
   }

   // Add any country-specific overrides here
   export const ukConfig: UserActionNameCountryConfig = {
     sections: Object.values(UKSectionNames),
     initialSection: UKSectionNames.CUSTOM, // Start with custom section
     analyticsName: 'User Action Form Action Name UK',
     sectionComponents: {
       [UKSectionNames.CUSTOM]: UKCustomSection,
       [UKSectionNames.SECTION_ONE]: CommonSectionOne,
       [UKSectionNames.SUCCESS]: CommonSuccessSection,
     },
     meta: {
       title: 'UK-specific Title',
       subtitle: 'UK-specific subtitle',
       // UK-specific overrides
     },
   }
   ```

5. Create the country lookup function:

   ```typescript
   // common/getUserActionContentByCountry.ts
   import { UserActionNameCountryConfig } from './types'
   import { ukConfig } from '../uk'
   import { usConfig } from '../us'
   import { gracefullyError } from '@/utils/shared/gracefullyError'
   import {
     DEFAULT_SUPPORTED_COUNTRY_CODE,
     SupportedCountryCodes,
   } from '@/utils/shared/supportedCountries'

   const USER_ACTION_CONTENT_BY_COUNTRY: Record<
     SupportedCountryCodes,
     UserActionNameCountryConfig
   > = {
     [SupportedCountryCodes.US]: usConfig,
     [SupportedCountryCodes.GB]: ukConfig,
     // ...
   }

   export function getUserActionContentByCountry(countryCode: SupportedCountryCodes) {
     if (countryCode in USER_ACTION_CONTENT_BY_COUNTRY) {
       return USER_ACTION_CONTENT_BY_COUNTRY[countryCode]
     }

     return gracefullyError({
       msg: `Country config not found for country code: ${countryCode}`,
       fallback: USER_ACTION_CONTENT_BY_COUNTRY[DEFAULT_SUPPORTED_COUNTRY_CODE],
       hint: {
         level: 'error',
         tags: {
           domain: 'getUserActionContentByCountry',
         },
         extra: {
           countryCode,
         },
       },
     })
   }
   ```

### Action Card - CTA

To add a call-to-action (CTA) for the new user action, create country-specific CTA definitions:

1. Create a folder structure for your CTAs that follows the existing pattern:

   ```
   src/components/app/userActionGridCTAs/constants/
   ├── us/                     # US-specific CTAs
   │   └── usCtas.tsx          # US CTA definitions
   ├── uk/                     # UK-specific CTAs
   │   └── ukCtas.tsx          # UK CTA definitions
   └── ctas.tsx                # Main export file
   ```

2. Define country-specific CTAs:

   ```javascript
   // constants/us/usCtas.tsx
   export const US_USER_ACTION_CTAS_FOR_GRID_DISPLAY: UserActionGridCTA = {
     [UserActionType.ACTION_NAME]: {
       title: 'US-specific title',
       description: 'US-specific description',
       mobileCTADescription: 'Short mobile description',
       campaignsModalDescription: 'Description for campaigns modal',
       image: '/actionTypeIcons/action-name.png',
       campaigns: [
         {
           actionType: UserActionType.ACTION_NAME,
           campaignName: UserActionCampaignName.DEFAULT,
           isCampaignActive: true,
           title: 'Campaign title',
           description: 'Campaign description',
           canBeTriggeredMultipleTimes: true,
           WrapperComponent: ({ children }) => (
             <UserActionFormActionNameDialog countryCode="US" defaultOpen={false}>
               {children}
             </UserActionFormActionNameDialog>
           ),
         },
       ],
     },
   };
   ```

3. The central registry is already set up in `constants/ctas.tsx`, which imports and exports all country-specific CTAs:

   ```javascript
   // constants/ctas.tsx
   import { US_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './us/usCtas';
   import { UK_USER_ACTION_CTAS_FOR_GRID_DISPLAY } from './uk/ukCtas';
   import { DEFAULT_SUPPORTED_COUNTRY_CODE, SupportedCountryCodes } from '@/utils/shared/supportedCountries';

   export const COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY: Record<SupportedCountryCodes, UserActionGridCTA> = {
     [SupportedCountryCodes.US]: US_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
     [SupportedCountryCodes.GB]: UK_USER_ACTION_CTAS_FOR_GRID_DISPLAY,
     // ...
   };

   export function getUserActionCTAsByCountry(countryCode: SupportedCountryCodes) {
     if (countryCode in COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY) {
       return COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY[countryCode];
     }

     return COUNTRY_USER_ACTION_CTAS_FOR_GRID_DISPLAY[DEFAULT_SUPPORTED_COUNTRY_CODE];
   }
   ```

The order of the objects within the CTA definition determines how they will be displayed to users.

### Update database schema

**NOTE: All changes to schema should be made in its own PR, and before any UI changes. Follow guide [here](https://github.com/Stand-With-Crypto/swc-web/blob/main/docs/Contributing.md#updating-the-planetscale-schema) to update PlanetScale DB.**

1. Update UserActionType enum with the new user action.
2. If your user action requires some associated metadata to be stored, then add new model for the user action with name `UserActionActionName`, replacing `ActionName` with the name of the action.
3. Add a new field to the [UserAction](https://github.com/Stand-With-Crypto/swc-web/blob/main/prisma/schema.prisma#L271) model to reference the new user action model if you added a new model.
4. Run `npm run initial` after making changes to the schema.

### Create a new server action

- Create a new file in `src/actions/` with the name formatting `actionActionName` to handle the server action logic
- Safe parse all user input utilizing utils such as zod before sending it to the server.

### Add a new airdrop NFT

- The NFT asset should be added under `public/nfts` folder. Ensure that the image size is less than 1MB.
- The NFT contract address should be added as an env variable.
- Use `SWC_DOT_ETH_WALLET` as the associated wallet.
- Update the following variables with the relevant changes for the new NFT:
  - [NFTSlug](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/shared/nft.ts#L1) enum
  - [ACTION_NFT_SLUG](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/server/nft/claimNFT.ts#L15)
  - [NFT_SLUG_BACKEND_METADATA](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/server/nft/constants.ts#L26)
  - [NFT_CLIENT_METADATA](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/web/nft.ts#L7)

### Create `/action/actionName` deeplink

1. Create a folder in `src/swc-web/src/app/[countryCode]/(homepageDialogDeeplink)/action/` called the action name
2. Create a `page.tsx` file in the folder with content similar to the following. Replace `ActionName` with the name of the new action.

```javascript
/// page.tsx

export const revalidate = 900 // 15 minutes
export const dynamic = 'error'

export default function UserActionActionNameDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
        <UserActionActionNameDeeplinkWrapper />
    </HomepageDialogDeeplinkLayout>
  )
}
```

### Unit tests / E2E tests

Unit tests can be added in the same folder as where new UI components are created, and E2E tests are stored in the `cypress` folder.

## Having two or more campaigns active at the same time

If you ever need to run multiple campaigns simultaneously, please refer to [this documentation](/docs/Working%20with%20two%20or%20more%20campaigns%20active.md) for guidance on how to add multiple campaigns and how to disable them later.
