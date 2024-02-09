import 'server-only'

import React from 'react'
import { X } from 'lucide-react'

import { PageHome } from '@/components/app/pageHome'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

import { PageProps } from '@/types'

interface HomepageDialogDeeplinkLayoutProps extends React.PropsWithChildren {
  size?: 'sm' | 'md'
  pageParams: PageProps['params']
  hideModal?: boolean
}

export async function HomepageDialogDeeplinkLayout({
  children,
  size = 'md',
  pageParams,
}: HomepageDialogDeeplinkLayoutProps) {
  const urls = getIntlUrls(pageParams.locale)
  const asyncProps = await getHomepageData()
  return (
    <>
      <InternalLink
        className={cn(dialogOverlayStyles, 'cursor-default')}
        href={urls.home()}
        replace
      />
      <div className={cn(dialogContentStyles, size === 'md' && 'max-w-3xl', 'min-h-[400px]')}>
        {children}
        <InternalLink className={dialogCloseStyles} href={urls.home()} replace>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </InternalLink>
      </div>

      <PageHome params={pageParams} {...asyncProps} />
    </>
  )
}
