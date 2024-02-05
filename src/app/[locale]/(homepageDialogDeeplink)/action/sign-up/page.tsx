import { PageProps } from '@/types'
import { getSignedUserActionByType } from '@/data/user/getSignedUserActionByType'
import { UserActionType } from '@prisma/client'
import { getIntlUrls } from '@/utils/shared/urls'
import { RedirectType, redirect } from 'next/navigation'
import { EmbeddedAccountAuth } from '@/components/app/accountAuth'
import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'

export default async function UserActionOptInSWCDeepLink({ params }: PageProps) {
  const { locale } = params
  const urls = getIntlUrls(locale)
  const userAction = await getSignedUserActionByType(UserActionType.OPT_IN)

  if (userAction) {
    redirect(urls.profile(), RedirectType.replace)
  }

  return (
    <HomepageDialogDeeplinkLayout pageParams={params} size="sm">
      <EmbeddedAccountAuth />
    </HomepageDialogDeeplinkLayout>
  )
}
