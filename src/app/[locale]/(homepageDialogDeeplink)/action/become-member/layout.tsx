import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.HOUR

export default async function Layout({ params, children }: React.PropsWithChildren<PageProps>) {
  console.log('layout')
  return (
    <HomepageDialogDeeplinkLayout pageParams={params} size="sm">
      {children}
    </HomepageDialogDeeplinkLayout>
  )
}
