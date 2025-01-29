import { Builder } from '@builder.io/react'

import { HeroCTA } from '@/components/app/hero/heroCTA'
import { HeroImageContent, HeroImageContentProps } from '@/components/app/hero/heroImage'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

type HeroBuilderProps = BuilderComponentBaseProps & HeroImageContentProps

Builder.registerComponent(
  (props: HeroBuilderProps) => {
    const heroProps = {
      ...props.attributes,
      title: props.title,
      ctaText: props.ctaText,
      imagePath: props.imagePath,
      videoPath: props.videoPath,
    }

    const isAuthenticated = props.builderState?.state?.isAuthenticated

    if (isAuthenticated) {
      return (
        <div className="order-0 self-start md:container lg:order-1 lg:px-0">
          <UserActionFormShareOnTwitterDialog>
            {/* This div is here because the dialog won't open on builder.io without it*/}
            <div>
              <HeroImageContent {...heroProps} key={props.attributes?.key} />
            </div>
          </UserActionFormShareOnTwitterDialog>
        </div>
      )
    }

    return (
      <div className="order-0 self-start md:container lg:order-1 lg:px-0">
        <HeroImageContent {...heroProps} key={props.attributes?.key} />
      </div>
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
        name: 'title',
        helperText: 'The title of the unauthenticated hero image',
        friendlyName: 'Title',
        type: 'text',
        required: true,
        defaultValue:
          'Join Stand With Crypto and help us defend your right to own crypto in America.',
      },
      {
        name: 'ctaText',
        helperText: 'The text of the CTA button for the unauthenticated hero image',
        friendlyName: 'CTA Text',
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

type HeroTextBuilderProps = BuilderComponentBaseProps & {
  title: string
  subtitle: string
  ctaText: string
}

Builder.registerComponent(
  (props: HeroTextBuilderProps) => {
    return (
      <div className="lg:order-0 container order-1 mx-auto max-w-xl space-y-6 pt-4 text-center md:max-w-3xl lg:px-0 lg:pt-0 lg:text-left">
        <PageTitle className={'lg:text-left'} withoutBalancer>
          {props.title}
        </PageTitle>
        <PageSubTitle className="lg:max-w-xl lg:text-left" withoutBalancer>
          {props.subtitle}
        </PageSubTitle>
        <HeroCTA ctaText={props.ctaText} />
      </div>
    )
  },
  {
    name: 'HeroText',
    description: 'The hero text',
    friendlyName: 'Hero Text',
    canHaveChildren: false,
    noWrap: true,
    inputs: [
      {
        name: 'title',
        helperText: 'The title of the hero text',
        friendlyName: 'Title',
        type: 'text',
        required: true,
        defaultValue: "If you care about crypto, it's time to prove it",
      },
      {
        name: 'subtitle',
        helperText: 'The subtitle of the hero text',
        friendlyName: 'Subtitle',
        type: 'text',
        required: true,
        defaultValue:
          "52 million Americans own crypto. And yet, crypto's future in America remains uncertain. Congress is writing the rules as we speak - but they won't vote YES until they've heard from you.",
      },
      {
        name: 'ctaText',
        helperText: 'The text of the CTA button for the hero text',
        friendlyName: 'CTA Text',
        type: 'text',
        required: true,
        defaultValue: 'Join the fight',
      },
    ],
  },
)
