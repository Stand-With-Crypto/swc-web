import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { AUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/au'
import { UserActionFormEmailCongresspersonDeeplinkWrapper } from '@/components/app/userActionFormEmailCongressperson/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { slugify } from '@/utils/shared/slugify'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
export const dynamicParams = false

export async function generateStaticParams() {
  return Object.values(AUUserActionEmailCampaignName).map(campaignName => {
    if (campaignName === AUUserActionEmailCampaignName.DEFAULT) {
      return {
        campaignName: 'default',
      }
    }

    return {
      campaignName: slugify(campaignName),
    }
  })
}

const countryCode = SupportedCountryCodes.AU

export default async function UserActionEmailCongresspersonDeepLink(
  props: PageProps<{ campaignName: string }>,
) {
  const params = await props.params
  const campaignName = deSlugifyCampaignName(params.campaignName)

  if (!campaignName) {
    notFound()
  }

  return (
    <AUHomepageDialogDeeplinkLayout>
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
    </AUHomepageDialogDeeplinkLayout>
  )
}

function deSlugifyCampaignName(slugifiedCampaignName: string) {
  if (slugifiedCampaignName === 'default') {
    return AUUserActionEmailCampaignName.DEFAULT
  }

  return Object.values(AUUserActionEmailCampaignName).find(
    campaignName => slugify(campaignName) === slugifiedCampaignName,
  )
}
