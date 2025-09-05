import { UserActionType } from '@prisma/client'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { UserActionFormClaimNFTDeeplinkWrapper } from '@/components/app/userActionFormClaimNFT/common/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { NFTSlug } from '@/utils/shared/nft'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
const countryCode = SupportedCountryCodes.US

export default async function UserActionClaimNftDeepLink(props: PageProps) {
  const params = await props.params

  return (
    <USHomepageDialogDeeplinkLayout className="max-w-3xl" pageParams={params}>
      <div className={cn(dialogContentPaddingStyles, 'h-full')}>
        <ErrorBoundary
          extras={{
            action: {
              isDeeplink: true,
              actionType: UserActionType.CLAIM_NFT,
            },
          }}
          severityLevel="error"
          tags={{
            domain: 'UserActionClaimNftDeepLink',
          }}
        >
          <UserActionFormClaimNFTDeeplinkWrapper
            countryCode={countryCode}
            nftSlug={NFTSlug.GENIUS_ACT_2025}
          />
        </ErrorBoundary>
      </div>
    </USHomepageDialogDeeplinkLayout>
  )
}
