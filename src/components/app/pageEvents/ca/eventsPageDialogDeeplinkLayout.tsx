import 'server-only'

import React, { cloneElement, JSX } from 'react'
import { isAfter, parseISO, subDays } from 'date-fns'
import { X } from 'lucide-react'

import { CAEventsPage, CAEventsPageProps } from '@/components/app/pageEvents/ca'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface EventsPageDialogDeeplinkLayout extends Omit<CAEventsPageProps, 'isDeepLink'> {
  children: JSX.Element
}

const countryCode = SupportedCountryCodes.CA

export async function EventsPageDialogDeeplinkLayout({
  children,
  events,
}: EventsPageDialogDeeplinkLayout) {
  const urls = getIntlUrls(SupportedCountryCodes.CA)

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

      <CAEventsPage events={events} isDeepLink />
    </>
  )
}
