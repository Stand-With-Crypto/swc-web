import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { slugify } from '@/utils/shared/slugify'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
export const dynamicParams = true

export async function generateStaticParams() {
  return Object.values(USUserActionEmailCampaignName).map(campaignName => {
    if (campaignName === USUserActionEmailCampaignName.DEFAULT) {
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
    <USHomepageDialogDeeplinkLayout pageParams={params}>
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
        <UserActionFormEmailCongresspersonDeeplinkWrapper campaignName={campaignName} />
      </ErrorBoundary>
    </USHomepageDialogDeeplinkLayout>
  )
}

function deSlugifyCampaignName(slugifiedCampaignName: string) {
  if (slugifiedCampaignName === 'default') {
    return USUserActionEmailCampaignName.DEFAULT
  }

  return Object.values(USUserActionEmailCampaignName).find(
    campaignName => slugify(campaignName) === slugifiedCampaignName,
  )
}
