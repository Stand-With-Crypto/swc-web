import { NextImage } from '@/components/ui/image'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageTitle } from '@/components/ui/pageTitleText'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { ArrowRight } from 'lucide-react'

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
      data-test-id="event-card"
      className="relative h-[329px] w-full cursor-pointer overflow-hidden rounded-[32px] sm:w-[357px]"
    >
      <NextImage
        priority
        alt={imageAltText}
        src={imageUrl}
        fill
        className="h-full w-full object-cover"
      />
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backgroundBlendMode: 'overlay',
        }}
        className="absolute flex h-full w-full flex-col items-start justify-between gap-4 p-8 text-white"
      >
        <PageTitle as="span" size="sm" className="text-left">
          {title}
        </PageTitle>
        <div className="w-full">
          <TrackedExternalLink
            eventProperties={{
              component: AnalyticComponentType.card,
              action: AnalyticActionType.click,
              link,
              page: 'Resources',
              surface: 'Event Card',
            }}
            className={linkBoxLinkClassName}
            data-link-box-subject
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
