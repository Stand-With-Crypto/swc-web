import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ArrowRight } from 'lucide-react'

const ICON_SIZE_PX = 32

export function EventCard({
  imageUrl,
  cta,
  link,
  title,
}: {
  imageUrl: string
  cta: string
  link: string
  title: string
}) {
  return (
    <LinkBox className="relative h-[329px] w-full cursor-pointer overflow-hidden rounded-[32px] sm:w-[357px]">
      <NextImage priority alt="" src={imageUrl} fill className="h-full w-full object-cover" />
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backgroundBlendMode: 'overlay',
        }}
        className="absolute flex h-full w-full flex-col items-start justify-between gap-4 p-[32px] text-white"
      >
        <PageTitle as="span" size="sm" className="text-left">
          {title}
        </PageTitle>
        <div className="w-full">
          <ExternalLink className={linkBoxLinkClassName} data-link-box-subject href={link}>
            <div className="flex w-full flex-row items-center justify-between gap-4">
              <span className="text-xl font-bold">{cta}</span>
              <ArrowRight size={ICON_SIZE_PX} />
            </div>
          </ExternalLink>
        </div>
      </div>
    </LinkBox>
  )
}
