import { PageHome } from '@/components/app/pageHome'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { cn } from '@/utils/web/cn'
import { UserActionType } from '@prisma/client'
import { X } from 'lucide-react'
import { headers } from 'next/headers'

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { locale } = params
  const asyncProps = await getHomepageData()
  const urls = getIntlUrls(locale)
  const headersList = headers()

  const isOptInAction =
    USER_ACTION_DEEPLINK_MAP[UserActionType.OPT_IN].getDeeplinkUrl({ locale }) ===
    headersList.get('x-pathname')

  return (
    <>
      <InternalLink
        replace
        href={urls.home()}
        className={cn(dialogOverlayStyles, 'cursor-default')}
      />
      <div className={cn(dialogContentStyles, !isOptInAction && 'max-w-3xl', 'min-h-[400px]')}>
        {children}
        <InternalLink className={dialogCloseStyles} replace href={urls.home()}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </InternalLink>
      </div>
      <PageHome params={params} {...asyncProps} />
    </>
  )
}
