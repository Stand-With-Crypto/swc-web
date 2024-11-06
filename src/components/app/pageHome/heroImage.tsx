import Balancer from 'react-wrap-balancer'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { Video } from '@/components/ui/video'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

interface HeroImageProps {
  locale: SupportedLocale
}

export function HeroImage({ locale }: HeroImageProps) {
  return (
    <Link href={getIntlUrls(locale).locationUnitedStates()}>
      <LinkBox className="relative h-[320px] overflow-hidden md:rounded-xl lg:h-[400px]">
        <Video
          className={'absolute left-0 top-0 h-full w-full object-cover'}
          fallback={
            <NextImage
              alt="sign up"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOM8FqyAgAEOAHwiAoWHAAAAABJRU5ErkJggg=="
              className="h-full w-full object-cover"
              fill
              placeholder="blur"
              priority
              sizes={'(max-width: 400px) 375px, 500px'}
              src="/homepageHero.webp"
            />
          }
          poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP0dpm3AgAD5gHXYQBQLgAAAABJRU5ErkJggg=="
          src="https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/swca_refer_app-49WzI9pK1mMO5mj40fy1miIzF4Nrqa.mp4"
        />

        <div
          className={
            'absolute bottom-0 flex w-full items-center justify-between gap-2 p-4 text-sm text-white'
          }
          style={{
            background:
              'linear-gradient(to top, hsla(0, 0%, 0%, 0.8) 10%, hsla(0, 0%, 0%, 0.4) 70%,  transparent 100%)',
          }}
        >
          <Balancer>Check out the election results and the role crypto played.</Balancer>
          <Button className={linkBoxLinkClassName} data-link-box-subject variant="secondary">
            View results
            <ArrowUpRight />
          </Button>
        </div>
      </LinkBox>
    </Link>
  )
}
