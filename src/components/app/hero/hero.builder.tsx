import { Builder } from '@builder.io/react'

import { HeroCTA } from '@/components/app/hero/heroCTA'
import { HeroImageContent, HeroImageContentProps } from '@/components/app/hero/heroImage'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

type HeroBuilderProps = BuilderComponentBaseProps &
  HeroImageContentProps & {
    ctaTitle: string
    ctaSubTitle: string
    ctaButtonText: string
  }

Builder.registerComponent(
  (props: HeroBuilderProps) => {
    const heroProps = {
      ...props.attributes,
      heroTitle: props.heroTitle,
      heroCtaText: props.heroCtaText,
      imagePath: props.imagePath,
      videoPath: props.videoPath,
    }

    const isAuthenticated = props.builderState?.state?.isAuthenticated

    if (isAuthenticated) {
      return (
        <section className="grid-fl lg:standard-spacing-from-navbar mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2 lg:gap-8 lg:gap-y-1">
          <div className="lg:order-0 container order-1 mx-auto max-w-xl space-y-6 pt-4 text-center md:max-w-3xl lg:px-0 lg:pt-0 lg:text-left">
            <PageTitle className={'lg:text-left'} withoutBalancer>
              {props.ctaTitle}
            </PageTitle>
            <PageSubTitle className="lg:max-w-xl lg:text-left" withoutBalancer>
              {props.ctaSubTitle}
            </PageSubTitle>
            <HeroCTA ctaText={props.ctaButtonText} />
          </div>
          <div className="order-0 self-start md:container lg:order-1 lg:px-0">
            <UserActionFormShareOnTwitterDialog>
              {/* This div is here because the dialog won't open on builder.io without it*/}
              <div>
                <HeroImageContent {...heroProps} key={props.attributes?.key} />
              </div>
            </UserActionFormShareOnTwitterDialog>
          </div>
        </section>
      )
    }

    return (
      <section className="grid-fl lg:standard-spacing-from-navbar mb-6 grid grid-cols-1 items-center gap-4 lg:container lg:grid-cols-2 lg:gap-8 lg:gap-y-1">
        <div className="lg:order-0 container order-1 mx-auto max-w-xl space-y-6 pt-4 text-center md:max-w-3xl lg:px-0 lg:pt-0 lg:text-left">
          <PageTitle className={'lg:text-left'} withoutBalancer>
            {props.ctaTitle}
          </PageTitle>
          <PageSubTitle className="lg:max-w-xl lg:text-left" withoutBalancer>
            {props.ctaSubTitle}
          </PageSubTitle>
          <HeroCTA ctaText={props.ctaButtonText} />
        </div>
        <div className="order-0 self-start md:container lg:order-1 lg:px-0">
          <HeroImageContent {...heroProps} key={props.attributes?.key} />
        </div>
      </section>
    )
  },
  {
    name: 'HeroCTA',
    description: 'The hero CTA',
    friendlyName: 'Hero CTA',
    canHaveChildren: false,
    noWrap: true,
    inputs: [
      {
        name: 'ctaTitle',
        helperText: 'The title of the CTA',
        friendlyName: 'CTA Title',
        type: 'text',
        required: true,
        defaultValue: "If you care about crypto, it's time to prove it",
      },
      {
        name: 'ctaSubTitle',
        helperText: 'The subtitle of the CTA',
        friendlyName: 'CTA Subtitle',
        type: 'text',
        required: true,
        defaultValue:
          "52 million Americans own crypto. And yet, crypto's future in America remains uncertain. Congress is writing the rules as we speak - but they won't vote YES until they've heard from you.",
      },
      {
        name: 'ctaButtonText',
        helperText: 'The text of the CTA button',
        friendlyName: 'CTA Button Text',
        type: 'text',
        required: true,
        defaultValue: 'Join the fight',
      },
      {
        name: 'heroTitle',
        helperText: 'The title of the unauthenticated hero',
        friendlyName: 'Hero Title',
        type: 'text',
        required: true,
        defaultValue:
          'Join Stand With Crypto and help us defend your right to own crypto in America.',
      },
      {
        name: 'heroCtaText',
        helperText: 'The text of the CTA button for the unauthenticated hero',
        friendlyName: 'Hero CTA Text',
        type: 'text',
        required: true,
        defaultValue: 'Join',
      },
      {
        name: 'imagePath',
        helperText: 'The path to the image. This is a fallback if no video is provided.',
        friendlyName: 'Image Path',
        type: 'object',
        defaultValue: {
          src: '/homepageHero.webp',
          alt: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
        },
        subFields: [
          {
            name: 'src',
            type: 'text',
            helperText: 'The path to the image',
            friendlyName: 'Image Path',
            defaultValue: '/homepageHero.webp',
          },
          {
            name: 'alt',
            type: 'text',
            helperText: 'The alt text for the image',
            friendlyName: 'Alt Text',
            defaultValue: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
          },
        ],
      },
      {
        name: 'videoPath',
        helperText: 'The path to the video',
        friendlyName: 'Video Path',
        type: 'text',
        defaultValue: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
      },
    ],
  },
)
