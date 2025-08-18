'use client'

import { Suspense } from 'react'

import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useTranslation } from '@/hooks/useLanguage'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { SWCEvents } from '@/utils/shared/zod/getSWCEvents'

const translations = {
  [SupportedLocale.EN_US]: {
    title: 'Events near you',
    noEventsMessage: 'No events found in your area.',
    loadingMessage: 'Finding events near you...',
  },
  [SupportedLocale.FR_CA]: {
    title: 'Événements près de chez vous',
    noEventsMessage: 'Aucun événement trouvé dans votre région.',
    loadingMessage: "Recherche d'événements près de chez vous...",
  },
}

interface EventsNearYouProps {
  events: SWCEvents
}

export function EventsNearYou(props: EventsNearYouProps) {
  const t = useTranslation(translations)

  return (
    <section className="flex w-full flex-col items-center gap-4 lg:gap-6">
      <PageTitle as="h3">{t.title}</PageTitle>
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <SuspenseEventsNearYou {...props} />
      </Suspense>
    </section>
  )
}

function SuspenseEventsNearYou({ events }: EventsNearYouProps) {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const t = useTranslation(translations)

  const userState = profileReq.data?.user?.userLocationDetails?.administrativeAreaLevel1

  if (profileReq.isLoading) {
    return <div className="text-center text-muted-foreground">{t.loadingMessage}</div>
  }

  return <FilteredEventsNearUser events={events} userState={userState} />
}

function FilteredEventsNearUser({
  events,
  userState,
}: {
  events: SWCEvents
  userState: string | undefined
}) {
  const t = useTranslation(translations)

  const nearbyEvents = events.filter(event => {
    if (!userState || !event.data.state) return false
    return event.data.state.toLowerCase() === userState.toLowerCase()
  })

  if (nearbyEvents.length === 0) {
    return <div className="text-center text-muted-foreground">{t.noEventsMessage}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nearbyEvents.slice(0, 6).map((event, index) => (
        <div className="rounded-lg border p-4" key={`${event.data.slug}-${index}`}>
          <h4 className="font-semibold">{event.data.name}</h4>
          <p className="text-sm text-muted-foreground">{event.data.date}</p>
          {event.data.formattedAddress && <p className="text-sm">{event.data.formattedAddress}</p>}
        </div>
      ))}
    </div>
  )
}
