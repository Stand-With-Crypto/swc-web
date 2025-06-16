import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { slugify } from '@/utils/shared/slugify'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { GBUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
export const dynamicParams = false

export async function generateStaticParams() {
  return Object.values(GBUserActionEmailCampaignName).map(campaignName => {
    if (campaignName === GBUserActionEmailCampaignName.DEFAULT) {
      return {
        campaignName: 'default',
      }
    }

    return {
      campaignName: slugify(campaignName),
    }
  })
}

export default async function UserActionEmailCongresspersonDeepLink(
  props: PageProps<{ campaignName: string }>,
) {
  const params = await props.params
  const campaignName = deSlugifyCampaignName(params.campaignName)

  if (!campaignName) {
    notFound()
  }

  return (
    <GBHomepageDialogDeeplinkLayout>
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
          countryCode={SupportedCountryCodes.GB}
        />
      </ErrorBoundary>
    </GBHomepageDialogDeeplinkLayout>
  )
}

function deSlugifyCampaignName(slugifiedCampaignName: string) {
  if (slugifiedCampaignName === 'default') {
    return GBUserActionEmailCampaignName.DEFAULT
  }

  return Object.values(GBUserActionEmailCampaignName).find(
    campaignName => slugify(campaignName) === slugifiedCampaignName,
  )
}
