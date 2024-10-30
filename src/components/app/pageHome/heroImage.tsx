import Balancer from 'react-wrap-balancer'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { LinkBox, linkBoxLinkClassName } from '@/components/ui/linkBox'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

interface HeroImageProps {
  locale: SupportedLocale
}

export function HeroImage({ locale }: HeroImageProps) {
  return (
    <Link href={getIntlUrls(locale).locationUnitedStates()}>
      <LinkBox
        className="relative flex h-[320px] items-center justify-center overflow-hidden md:rounded-xl lg:h-[400px]"
        style={{
          background: 'radial-gradient(74.32% 74.32% at 50% 50%, #F0E8FF 8.5%, #6B28FF 89%);',
        }}
      >
        <NextImage
          alt="Election results"
          height={400}
          priority
          quality={100}
          src="/actionTypeIcons/votingResearched.png"
          width={400}
        />

        <div
          className={
            'absolute bottom-0 flex w-full items-center justify-between gap-4 p-4 text-sm text-white'
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
