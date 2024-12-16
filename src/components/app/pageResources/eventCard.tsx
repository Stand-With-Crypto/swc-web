import { ArrowRight } from 'lucide-react'

import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'

const ICON_SIZE_PX = 32

export function EventCard({
  imageUrl,
  imageAltText,
  cta,
  link,
  title,
}: {
  imageUrl: string
  imageAltText: string
  cta: string
  link: string
  title: string
}) {
  return (
    <LinkBox
      className="relative mx-auto h-[329px] w-full max-w-md overflow-hidden rounded-[32px]"
      data-test-id="event-card"
    >
      <NextImage
        alt={imageAltText}
        className="h-full w-full object-cover"
        fill
        priority
        src={imageUrl}
      />
      <div
        className="absolute flex h-full w-full flex-col items-start justify-between gap-4 p-8 text-white"
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backgroundBlendMode: 'overlay',
        }}
      >
        <PageTitle as="span" className="text-left" size="md">
          {title}
        </PageTitle>
        <div className="w-full">
          <TrackedExternalLink
            className={`${linkBoxLinkClassName} text-white`}
            data-link-box-subject
            eventProperties={{
              component: AnalyticComponentType.card,
              action: AnalyticActionType.click,
              link,
              page: 'Resources',
              surface: 'Event Card',
            }}
            href={link}
          >
            <div className="flex w-full flex-row items-center justify-between gap-4">
              <span className="text-xl font-bold">{cta}</span>
              <ArrowRight size={ICON_SIZE_PX} />
            </div>
          </TrackedExternalLink>
        </div>
      </div>
    </LinkBox>
  )
}
