# Add a new user action

- [Create UI](#create-ui)
- [Update database schema](#update-database-schema)
- [Create a new server action](#create-a-new-server-action)
- [Add a new airdrop NFT](#add-a-new-airdrop-nft)
- [Create `/action/actionName` deeplink](#create-actionactionname-deeplink)
- [Unit tests / E2E tests](#unit-tests--e2e-tests)
- [Having two or more campaigns active at the same time](#having-two-or-more-campaigns-active-at-the-same-time)

**NOTE: Replace `ActionName` in variable/folder names with the name of the new user action**

## Create UI

- Create a new folder in `src/components/app` called `userActionFormActionName`. All UI should be contained in this folder.
- Typical files in this folder include `dialog.tsx`, `homepageDialogDeeplinkWrapper.tsx`, `index.tsx`, `lazyLoad.tsx`, `skeleton.tsx`

```javascript
/// dialog.tsx

export function UserActionActionNameFormDialog({
  children,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormActionName>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
}) {
 const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_ACTION_NAME,
  })
  const { data, isLoading } = useApiResponseForUserFullProfileInfo()
  const { user } = data ?? { user: null }

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        {isLoading ? (
          <UserActionFormActionNameSkeleton />
        ) : (
          <Suspense fallback={<UserActionFormActionNameSkeleton />}>
            <LazyUserActionFormActionName
              {...formProps}
              onClose={() => dialogProps.onOpenChange(false)}
              user={user}
            />
          </Suspense>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

```javascript
/// homepageDialogDeeplinkWrapper.tsx
/// Used in app/[locale]/(homepageDialogDeeplink)/action folder

function UserActionFormActionNameDeeplinkWrapperContent() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()
  const { user } = fetchUser.data || { user: null }

  return fetchUser.isLoading ? (
    <UserActionFormActionNameSkeleton />
  ) : (
    <UserActionFormActionName onClose={() => router.push(urls.home())} user={user} />
  )
}

export function UserActionFormActionNameDeeplinkWrapper() {
  return (
    <Suspense fallback={<UserActionFormActionNameSkeleton />}>
      <UserActionFormActionNameDeeplinkWrapperContent />
    </Suspense>
  )
}
```

```javascript
/// index.tsx

export function UserActionFormActionName({ onClose }: { onClose: () => void }) {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.INITIAL_SECTION,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_ACTION_NAME,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  const content = useMemo(() => {
    switch (currentTab) {
      case SectionNames.SECTION_ONE:
        return <SectionOne {...sectionProps} />
      case SectionNames.SECTION_TWO:
        return (
          <SectionTwo {...sectionProps} />
        )
      case SectionNames.SUCCESS:
        return (
          <UserActionFormSuccessScreen
            {...sectionProps}
            nftWhenAuthenticated={NFT_CLIENT_METADATA[NFTSlug.NFT_NAME]}
            onClose={onClose}
          />
        )
      default:
        onTabNotFound()
        return null
    }
  }, [currentTab, onClose, onTabNotFound, sectionProps, stateCode])

  return content
}
```

```javascript
/// lazyLoad.tsx

import { lazy } from 'react'

export const LazyUserActionFormActionName = lazy(() =>
  import('@/components/app/userActionFormActionName').then(m => ({
    default: m.UserActionFormActionName,
  })),
)
```

```javascript
/// skeleton.tsx

import { Skeleton } from '@/components/ui/skeleton'

export function UserActionFormActionNameSkeleton() {
  return (
    <div className="p-6">
      // Use Skeleton to create a loading component for the user action
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
```

## Update database schema

**NOTE: All changes to schema should be made in its own PR, and before any UI changes. Follow guide [here](https://github.com/Stand-With-Crypto/swc-web/blob/main/docs/Contributing.md#updating-the-planetscale-schema) to update PlanetScale DB.**

1. Update UserActionType enum with the new user action.
2. If your user action requires some associated metadata to be stored, then add new model for the user action with name `UserActionActionName`, replacing `ActionName` with the name of the action.
3. Add a new field to the [UserAction](https://github.com/Stand-With-Crypto/swc-web/blob/main/prisma/schema.prisma#L271) model to reference the new user action model if you added a new model.
4. Run `npm run initial` after making changes to the schema.

## Create a new server action

- Create a new file in `src/actions/` with the name formatting `actionActionName` to handle the server action logic
- Safe parse all user input utilizing utils such as zod before sending it to the server.

## Add a new airdrop NFT

- The NFT asset should be added under `public/nfts` folder. Ensure that the image size is less than 1MB.
- The NFT contract address should be added as an env variable.
- Use `SWC_DOT_ETH_WALLET` as the associated wallet.
- Update the following variables with the relevant changes for the new NFT:
  - [NFTSlug](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/shared/nft.ts#L1) enum
  - [ACTION_NFT_SLUG](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/server/nft/claimNFT.ts#L15)
  - [NFT_SLUG_BACKEND_METADATA](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/server/nft/constants.ts#L26)
  - [NFT_CLIENT_METADATA](https://github.com/Stand-With-Crypto/swc-web/blob/main/src/utils/web/nft.ts#L7)

## Create `/action/actionName` deeplink

1. Create a folder in `src/swc-web/src/app/[locale]/(homepageDialogDeeplink)/action/` called the action name
2. Create a `page.tsx` file in the folder with content similar to the following. Replace `ActionName` with the name of the new action.

```javascript
/// page.tsx

export const revalidate = SECONDS_DURATION.HOUR
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

### Having two or more campaigns active at the same time

If you ever need to run multiple campaigns simultaneously, please refer to [this documentation](/docs/Working%20with%20two%20or%20more%20campaigns%20active.md) for guidance on how to add multiple campaigns and how to disable them later.
