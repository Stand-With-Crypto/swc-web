'use client'

import { ReactNode } from 'react'
import { UserActionType } from '@prisma/client'
import sanitizeHtml from 'sanitize-html'

import { handleCreateRsvpAction } from '@/components/app/pageEvents/utils/createRsvpAction'
import { getUniqueEventKey } from '@/components/app/pageEvents/utils/getUniqueEventKey'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'

export function Root({ children }: { children: ReactNode }) {
  return <section className="flex flex-col items-center gap-8">{children}</section>
}

export function RsvpButton({
  children,
  event,
  countryCode,
}: {
  children: ReactNode
  event: SWCEvent
  countryCode: SupportedCountryCodes
}) {
  const handleRSVPButtonClick = () => {
    void handleCreateRsvpAction({
      shouldReceiveNotifications: false,
      event,
      campaignName: getActionDefaultCampaignName(UserActionType.RSVP_EVENT, countryCode),
    })

    window.open(event.rsvpUrl, '_blank')
  }

  return (
    <Button
      className="mt-2 w-full sm:w-fit lg:mt-4"
      onClick={handleRSVPButtonClick}
      type="button"
      variant="secondary"
    >
      {children}
    </Button>
  )
}

export function Event({
  event,
  action,
}: {
  event: SWCEvent
  countryCode: SupportedCountryCodes
  action: ReactNode
}) {
  return (
    <div
      className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6"
      key={getUniqueEventKey(event)}
    >
      <div className="relative h-[182px] min-w-[271px]">
        <NextImage
          alt={event.name}
          className="rounded-3xl object-cover object-center"
          fill
          sizes="(max-width: 640px) 100vw, 271px"
          src={event.image}
        />
      </div>

      <div className="grid justify-items-center gap-2 lg:justify-items-start">
        <PageSubTitle as="h3" className="text-bold font-sans text-base text-foreground">
          {event.name}
        </PageSubTitle>
        <div
          className="line-clamp-3 text-center font-mono text-base text-muted-foreground lg:text-left [&_a]:font-medium [&_a]:text-primary-cta [&_strong]:font-semibold [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(event.formattedDescription),
          }}
        />

        {action}
      </div>
    </div>
  )
}
