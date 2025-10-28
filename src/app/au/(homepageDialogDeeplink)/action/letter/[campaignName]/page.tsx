import { UserActionType } from '@prisma/client'
import { notFound } from 'next/navigation'

import { AUHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/au'
import { UserActionFormLetterDeeplinkWrapper } from '@/components/app/userActionFormLetter/homepageDialogDeeplinkWrapper'
import { PageProps } from '@/types'
import { slugify } from '@/utils/shared/slugify'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { deSlugifyCampaignName } from '@/utils/shared/userActionCampaigns/deSlugifyCampaignName'
import { ErrorBoundary } from '@/utils/web/errorBoundary'

export const revalidate = 3600 // 1 hour
export const dynamic = 'error'
export const dynamicParams = false

export async function generateStaticParams() {
  return Object.values(AUUserActionLetterCampaignName).map(campaignName => {
    if (campaignName === AUUserActionLetterCampaignName.DEFAULT) {
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

export default async function UserActionLetterDeepLink(
  props: PageProps<{ campaignName: string }>,
) {
  const params = await props.params
  const campaignName = deSlugifyCampaignName(params.campaignName, AUUserActionLetterCampaignName)

  if (!campaignName) {
    notFound()
  }

  return (
    <AUHomepageDialogDeeplinkLayout>
      <ErrorBoundary
        extras={{
          action: {
            isDeeplink: true,
            actionType: UserActionType.LETTER,
          },
        }}
        severityLevel="error"
        tags={{
          domain: 'UserActionLetterDeepLink',
        }}
      >
        <UserActionFormLetterDeeplinkWrapper
          campaignName={campaignName}
          countryCode={countryCode}
        />
      </ErrorBoundary>
    </AUHomepageDialogDeeplinkLayout>
  )
}

