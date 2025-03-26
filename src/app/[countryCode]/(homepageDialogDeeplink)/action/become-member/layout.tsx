import { USHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/us'
import { PageProps } from '@/types'

export const revalidate = 3600 // 1 hour

export default async function Layout(props: React.PropsWithChildren<PageProps>) {
  const params = await props.params

  const { children } = props

  return (
    <USHomepageDialogDeeplinkLayout pageParams={params} size="sm">
      {children}
    </USHomepageDialogDeeplinkLayout>
  )
}
