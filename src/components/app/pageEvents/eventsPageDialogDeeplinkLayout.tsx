import 'server-only'

import React, { cloneElement, JSX } from 'react'
import { isAfter, parseISO, subDays } from 'date-fns'
import { X } from 'lucide-react'

import NotFound from '@/app/not-found'
import { EventsPage, EventsPageProps } from '@/components/app/pageEvents'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface EventsPageDialogDeeplinkLayout extends Omit<EventsPageProps, 'isDeepLink'> {
  children: JSX.Element
}

export async function EventsPageDialogDeeplinkLayout({
  children,
  countryCode,
  events,
  showMap,
}: EventsPageDialogDeeplinkLayout) {
  const urls = getIntlUrls(countryCode)

  const filteredFutureEvents = events?.filter(event =>
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

      <EventsPage events={events} isDeepLink countryCode={countryCode} showMap={showMap} />
    </>
  )
}
