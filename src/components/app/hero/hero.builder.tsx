import { Builder } from '@builder.io/react'

import { Hero } from '@/components/app/hero'
import {
  AuthenticatedHeroCTAProps,
  UnauthenticatedHeroCTAProps,
} from '@/components/app/hero/heroCTA'
import {
  AuthenticatedHeroContentProps,
  UnauthenticatedHeroContentProps,
} from '@/components/app/hero/heroImage'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface HeroBuilderProps extends BuilderComponentBaseProps {
  title: string
  subtitle: string
  unauthenticatedImageWrapperProps: UnauthenticatedHeroContentProps
  authenticatedImageWrapperProps: AuthenticatedHeroContentProps
  unauthenticatedHeroCTAProps: UnauthenticatedHeroCTAProps
  authenticatedHeroCTAProps: AuthenticatedHeroCTAProps
}

Builder.registerComponent(
  (props: HeroBuilderProps) => {
    const {
      title,
      subtitle,
      unauthenticatedImageWrapperProps,
      authenticatedImageWrapperProps,
      unauthenticatedHeroCTAProps,
      authenticatedHeroCTAProps,
    } = props
    return (
      <Hero
        {...props.attributes}
        heroCTAProps={{
          unauthenticatedProps: unauthenticatedHeroCTAProps,
          authenticatedProps: authenticatedHeroCTAProps,
        }}
        imageWrapperProps={{
          unauthenticatedProps: unauthenticatedImageWrapperProps,
          authenticatedProps: authenticatedImageWrapperProps,
        }}
        key={props.attributes?.key}
        subtitle={subtitle}
        title={title}
      />
    )
  },
  {
    name: 'Hero',
    canHaveChildren: false,
    noWrap: true,
    inputs: [
      {
        name: 'title',
        helperText: 'The title of the hero',
        friendlyName: 'Title',
        type: 'text',
        defaultValue: "If you care about crypto, it's time to prove it",
      },
      {
        name: 'subtitle',
        helperText: 'The subtitle of the hero',
        friendlyName: 'Subtitle',
        type: 'text',
        defaultValue:
          "52 million Americans own crypto. And yet, crypto's future in America remains uncertain.",
      },
      {
        name: 'unauthenticatedImageWrapperProps',
        helperText: 'Values for the unauthenticated hero image',
        friendlyName: 'Unauthenticated Hero Image',
        type: 'object',
        defaultValue: {
          title: 'Join Stand With Crypto and help us defend your right to own crypto in America.',
          ctaText: 'Join',
          imagePath: '/homepageHero.webp',
          videoPath: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
        },
        subFields: [
          {
            name: 'title',
            helperText: 'The title of the unauthenticated hero image',
            friendlyName: 'Title',
            type: 'text',
            required: true,
          },
          {
            name: 'ctaText',
            helperText: 'The text of the CTA button for the unauthenticated hero image',
            friendlyName: 'CTA Text',
            type: 'text',
            required: true,
          },
          {
            name: 'imagePath',
            helperText: 'The path to the image. This is a fallback if no video is provided.',
            friendlyName: 'Image Path',
            type: 'text',
          },
          {
            name: 'videoPath',
            helperText: 'The path to the video',
            friendlyName: 'Video Path',
            type: 'text',
          },
        ],
      },
      {
        name: 'authenticatedImageWrapperProps',
        helperText: 'Values for the authenticated hero image',
        friendlyName: 'Authenticated Hero Image',
        type: 'object',
        defaultValue: {
          title: 'Stay up to date on crypto policy by following @StandWithCrypto on X.',
          ctaText: 'Follow',
          imagePath: '/homepageHero.webp',
          videoPath: 'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/heroImage.mp4',
        },
        subFields: [
          {
            name: 'title',
            helperText: 'The title of the authenticated hero image',
            friendlyName: 'Title',
            type: 'text',
          },
          {
            name: 'ctaText',
            helperText: 'The text of the CTA button for the authenticated hero image',
            friendlyName: 'CTA Text',
            type: 'text',
          },
          {
            name: 'imagePath',
            helperText: 'The path to the image. This is a fallback if no video is provided.',
            friendlyName: 'Image Path',
            type: 'text',
          },
          {
            name: 'videoPath',
            helperText: 'The path to the video',
            friendlyName: 'Video Path',
            type: 'text',
          },
        ],
      },
      {
        name: 'unauthenticatedHeroCTAProps',
        helperText: 'Values for the unauthenticated hero CTA',
        friendlyName: 'Unauthenticated Hero CTA',
        type: 'object',
        defaultValue: {
          ctaText: 'Join the fight',
        },
        subFields: [
          {
            name: 'ctaText',
            helperText: 'The text of the CTA button',
            friendlyName: 'CTA Text',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        name: 'authenticatedHeroCTAProps',
        helperText: 'Values for the authenticated hero CTA',
        friendlyName: 'Authenticated Hero CTA',
        type: 'object',
        defaultValue: {
          viewProfileText: 'View Profile',
          finishProfileText: 'Finish your profile',
        },
        subFields: [
          {
            name: 'viewProfileText',
            friendlyName: 'View Profile Text',
            type: 'text',
            required: true,
            helperText: 'The text of the view profile button',
          },
          {
            name: 'finishProfileText',
            friendlyName: 'Finish Profile Text',
            type: 'text',
            required: true,
            helperText: 'The text of the finish profile button',
          },
        ],
      },
    ],
  },
)
