# Add a new user action

## Create UI

- Create a new folder in `src/components/app` called userActionForm[actionName]. All UI should be contained in this folder.
- Typical files in this folder include dialog.tsx, homepageDialogDeeplinkWrapper.tsx, index.tsx, lazyLoad.tsx, skeleton.tsx

```javascript
dialog.tsx

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
homepageDialogDeeplinkWrapper.tsx

function UserActionFormActionNameDeeplinkWrapperContent() {
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const urls = useIntlUrls()
  const router = useRouter()
  const { user } = fetchUser.data || { user: null }

  return fetchUser.isLoading || loadingParams ? (
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
index.tsx

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
lazyLoad.tsx

import { lazy } from 'react'

export const LazyUserActionFormActionName = lazy(() =>
  import('@/components/app/userActionFormActionName').then(m => ({
    default: m.UserActionFormActionName,
  })),
)
```

```javascript
skeleton.tsx

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

1. Add new model for the user action with formatting `UserActionActionName`, replacing `ActionName` with the name of the action.
2. Add a new field to the [UserAction](https://github.com/Stand-With-Crypto/swc-web/blob/main/prisma/schema.prisma#L271) model to reference the new user action model
3. Run `npm run initial` after making changes to the schema.

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
