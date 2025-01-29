import { Builder } from '@builder.io/react'

import { HeroImageContent, HeroImageContentProps } from '@/components/app/hero/heroImage'
import { UserActionFormShareOnTwitterDialog } from '@/components/app/userActionFormShareOnTwitter/dialog'
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
        <UserActionFormShareOnTwitterDialog>
          {/* This div is here because the dialog won't open on builder.io without it*/}
          <div>
            <HeroImageContent {...heroProps} key={props.attributes?.key} />
          </div>
        </UserActionFormShareOnTwitterDialog>
      )
    }

    return <HeroImageContent {...heroProps} key={props.attributes?.key} />
  },
  {
    name: 'HeroImage',
    description: 'The hero image',
    friendlyName: 'Hero Image',
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
        type: 'text',
        defaultValue: '/homepageHero.webp',
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
