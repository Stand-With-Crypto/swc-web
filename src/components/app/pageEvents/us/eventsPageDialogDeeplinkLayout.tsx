import 'server-only'

import React, { cloneElement, JSX } from 'react'
import { isAfter, parseISO, subDays } from 'date-fns'
import { X } from 'lucide-react'

import { EventsPageProps } from '@/components/app/pageEvents/common/types'
import { UsPageEvents } from '@/components/app/pageEvents/us'
import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface UsEventsPageDialogDeeplinkLayout extends Omit<EventsPageProps, 'isDeepLink'> {
  children: JSX.Element
  countryCode: SupportedCountryCodes
}

const countryCode = SupportedCountryCodes.US

export async function UsEventsPageDialogDeeplinkLayout({
  children,
  events,
}: UsEventsPageDialogDeeplinkLayout) {
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

      <UsPageEvents countryCode={countryCode} events={events} isDeepLink />
    </>
  )
}
