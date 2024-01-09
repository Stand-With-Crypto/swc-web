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
import { cn } from '@/utils/web/cn'
import { X } from 'lucide-react'

export const revalidate = 3600
export const dynamic = 'error'

export default async function Layout({
  children,
  params,
}: PageProps & { children: React.ReactNode }) {
  const { locale } = params
  const asyncProps = await getHomepageData()
  const urls = getIntlUrls(locale)
  return (
    <>
      <div className={dialogOverlayStyles} />
      <div className={cn(dialogContentStyles, 'max-w-3xl p-0')}>
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
