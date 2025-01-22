import { HeroCTA, HeroCTAProps } from '@/components/app/hero/heroCTA'
import { HeroImageContainer, HeroImageWrapperProps } from '@/components/app/hero/heroImage'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export interface HeroProps {
  title: string
  subtitle: string
  imageWrapperProps: HeroImageWrapperProps
  heroCTAProps: HeroCTAProps
}

export function Hero({
  title = "If you care about crypto, it's time to prove it",
  subtitle = "52 million Americans own crypto. And yet, crypto's future in America remains uncertain.",
  imageWrapperProps,
  heroCTAProps,
}: HeroProps) {
  console.log(imageWrapperProps)
  console.log(heroCTAProps)
  return (
    <section className="grid-fl lg:standard-spacing-from-navbar mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2 lg:gap-8 lg:gap-y-1">
      <div className="lg:order-0 container order-1 mx-auto max-w-xl space-y-6 pt-4 text-center md:max-w-3xl lg:px-0 lg:pt-0 lg:text-left">
        <PageTitle className={'lg:text-left'} withoutBalancer>
          {title}
        </PageTitle>
        <PageSubTitle className="lg:max-w-xl lg:text-left" withoutBalancer>
          {subtitle}
        </PageSubTitle>
        <HeroCTA {...heroCTAProps} />
      </div>
      <div className="order-0 self-start md:container lg:order-1 lg:px-0">
        <HeroImageContainer {...imageWrapperProps} />
      </div>
    </section>
  )
}
