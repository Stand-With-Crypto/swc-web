import { notFound, redirect, RedirectType } from 'next/navigation'

import { DEFAULT_DEEPLINK_URL_CAMPAIGN_NAME } from '@/components/app/userActionFormEmailCongressperson/au/campaigns'
import { PageProps } from '@/types'
import { slugify } from '@/utils/shared/slugify'

export default async function UserActionEmailDeepLink(props: PageProps) {
  const slugifiedCampaignName = slugify(DEFAULT_DEEPLINK_URL_CAMPAIGN_NAME)

  if (!slugifiedCampaignName) {
    return notFound()
  }

  const searchParams = await props.searchParams
  const urlParams = new URLSearchParams(searchParams as Record<string, string>)
  const searchParamsString = urlParams.toString()
  const redirectUrl = `/au/action/email/${slugifiedCampaignName}${searchParamsString ? `?${searchParamsString}` : ''}`

  return redirect(redirectUrl, RedirectType.replace)
}
