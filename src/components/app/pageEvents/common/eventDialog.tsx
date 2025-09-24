'use client'

import { ReactNode, Suspense } from 'react'

import { LazyEventDialogContent } from '@/components/app/pageEvents/common/eventDialogContentLazyload'
import { EventDialogContentSkeleton } from '@/components/app/pageEvents/common/eventDialogContentSkeleton'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useDialog } from '@/hooks/useDialog'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface EventDialogProps {
  event: SWCEvent
  trigger: ReactNode
  triggerClassName?: string
}

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      a11yTitle: 'State {state} Events',
    },
    fr: {
      a11yTitle: 'Événements de {state}',
    },
    de: {
      a11yTitle: 'Veranstaltungen von {state}',
    },
  },
})

export function EventDialog({ event, trigger, triggerClassName }: EventDialogProps) {
  const { t } = useTranslation(i18nMessages, 'eventDialog')

  const dialogProps = useDialog({ analytics: 'Event Details Dialog' })
  const countryCode = useCountryCode()

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger className={triggerClassName ?? 'flex w-full justify-center'}>
        {trigger}
      </DialogTrigger>
      <DialogContent
        a11yTitle={t('a11yTitle', { state: event.state })}
        className="max-w-xl"
        padding={false}
      >
        <Suspense fallback={<EventDialogContentSkeleton />}>
          <LazyEventDialogContent countryCode={countryCode} event={event} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
