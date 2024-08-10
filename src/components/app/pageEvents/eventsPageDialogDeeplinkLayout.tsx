import 'server-only'

import React, { cloneElement, ReactElement } from 'react'
import { X } from 'lucide-react'

import NotFound from '@/app/not-found'
import { EventsPage } from '@/components/app/pageEvents'
import {
  dialogCloseStyles,
  dialogContentPaddingStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { PageProps } from '@/types'
import { getEvents } from '@/utils/server/builderIO/swcEvents'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface EventsPageDialogDeeplinkLayout {
  pageParams: PageProps['params']
  hideModal?: boolean
  children: ReactElement
}

export async function EventsPageDialogDeeplinkLayout({
  children,
  pageParams,
}: EventsPageDialogDeeplinkLayout) {
  const urls = getIntlUrls(pageParams.locale)

  const events = await getEvents()

  if (!events || !events?.length) {
    return NotFound()
  }

  return (
    <>
      <InternalLink
        className={cn(dialogOverlayStyles, 'cursor-default')}
        href={urls.events()}
        replace
      />
      <div className={cn(dialogContentStyles, dialogContentPaddingStyles, 'min-h-[200px]')}>
        {cloneElement(children, { events })}
        <InternalLink className={dialogCloseStyles} href={urls.events()} replace>
          <X size={20} />
          <span className="sr-only">Close</span>
        </InternalLink>
      </div>

      <EventsPage events={events!} isDeepLink />
    </>
  )
}
