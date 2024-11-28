import 'server-only'

import React, { cloneElement, ReactElement } from 'react'
import { isAfter, parseISO, subDays } from 'date-fns'
import { X } from 'lucide-react'

import NotFound from '@/app/not-found'
import { EventsPage } from '@/components/app/pageEvents'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { PageProps } from '@/types'
import { getEvents } from '@/utils/server/builderIO/swcEvents'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface EventsPageDialogDeeplinkLayout {
  pageParams: Awaited<PageProps['params']>
  hideModal?: boolean
  children: ReactElement<any>
}

export async function EventsPageDialogDeeplinkLayout({
  children,
  pageParams,
}: EventsPageDialogDeeplinkLayout) {
  const { locale } = pageParams
  const urls = getIntlUrls(locale)

  const events = await getEvents()

  if (!events || !events?.length) {
    return NotFound()
  }

  const filteredFutureEvents = events.filter(event =>
    isAfter(parseISO(event.data.date), subDays(new Date(), 1)),
  )

  return (
    <>
      <InternalLink
        className={cn(dialogOverlayStyles, 'cursor-default')}
        href={urls.events()}
        replace
      />
      <div className={cn(dialogContentStyles, 'min-h-[200px]')}>
        {cloneElement(children, { events: filteredFutureEvents })}
        <InternalLink className={dialogCloseStyles} href={urls.events()} replace>
          <X size={20} />
          <span className="sr-only">Close</span>
        </InternalLink>
      </div>

      <EventsPage events={filteredFutureEvents!} isDeepLink />
    </>
  )
}
