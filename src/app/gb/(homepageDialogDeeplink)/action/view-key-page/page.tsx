import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'
import { GbUserActionViewKeyPageDeeplinkWrapper } from '@/components/app/userActionViewKeyPageDeeplinkWrapper/gb'
import { PageProps } from '@/types'

export default async function UserActionViewKeyPageDeepLink(props: PageProps) {
  const searchParams = await props.searchParams

  return (
    <GBHomepageDialogDeeplinkLayout hidePseudoDialog>
      <GbUserActionViewKeyPageDeeplinkWrapper searchParams={searchParams} />
    </GBHomepageDialogDeeplinkLayout>
  )
}
