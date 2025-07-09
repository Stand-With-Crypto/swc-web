import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { CAHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/ca'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { slugify } from '@/utils/shared/slugify'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { deSlugifyCampaignName } from '@/utils/shared/userActionCampaigns/deSlugifyCampaignName'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
export const dynamicParams = false

export async function generateStaticParams() {
  return Object.values(CAUserActionEmailCampaignName).map(campaignName => {
    if (campaignName === CAUserActionEmailCampaignName.DEFAULT) {
      return {
        campaignName: 'default',
      }
    }

    return {
      campaignName: slugify(campaignName),
    }
  })
}

const countryCode = SupportedCountryCodes.CA

export default async function UserActionEmailCongresspersonDeepLink(
  props: PageProps<{ campaignName: string }>,
) {
  const params = await props.params
  const campaignName = deSlugifyCampaignName(params.campaignName, CAUserActionEmailCampaignName)

  if (!campaignName) {
    notFound()
  }

  return (
    <CAHomepageDialogDeeplinkLayout>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.EMAIL,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionEmailCongresspersonDeepLink',
        }}
      >
        <UserActionFormEmailCongresspersonDeeplinkWrapper
          campaignName={campaignName}
          countryCode={countryCode}
        />
      </ErrorBoundary>
    </CAHomepageDialogDeeplinkLayout>
  )
}
