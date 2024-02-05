import { PageProps } from '@/types'
import { getSignedUserActionByType } from '@/data/user/getSignedUserActionByType'
import { UserActionType } from '@prisma/client'
import { getIntlUrls } from '@/utils/shared/urls'
import { RedirectType, redirect } from 'next/navigation'
import { AccountAuthDialogWrapper } from '@/components/app/accountAuth'

export const dynamic = 'force-dynamic'

export default async function UserActionOptInSWCDeepLink({ params: { locale } }: PageProps) {
  const urls = getIntlUrls(locale)
  const userAction = await getSignedUserActionByType(UserActionType.OPT_IN)

  if (userAction) {
    redirect(urls.profile(), RedirectType.replace)
  }

  return <AccountAuthDialogWrapper defaultOpen />
}
