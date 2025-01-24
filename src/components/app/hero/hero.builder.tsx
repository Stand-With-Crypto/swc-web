import { Builder } from '@builder.io/react'

import { HeroContentProps, HeroImageContainer } from '@/components/app/hero/heroImage'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface HeroBuilderProps extends BuilderComponentBaseProps {
  unauthenticatedImageWrapperProps: HeroContentProps
  authenticatedImageWrapperProps: HeroContentProps
}

Builder.registerComponent(
  (props: HeroBuilderProps) => {
    return (
      <HeroImageContainer
        {...props.attributes}
        authenticatedProps={props.authenticatedImageWrapperProps}
        key={props.attributes?.key}
        unauthenticatedProps={props.unauthenticatedImageWrapperProps}
      />
    )
  },
  {
    name: 'Hero',
    description: 'The hero image container',
    friendlyName: 'Hero Image Container',
    canHaveChildren: false,
    noWrap: true,
    inputs: [
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
            name: 'ctaOverrideLink',
            helperText: 'The link to override the CTA button for the unauthenticated hero image',
            friendlyName: 'CTA Override Link',
            type: 'object',
            subFields: [
              {
                name: 'enabled',
                helperText: 'Whether the CTA override link is enabled',
                type: 'boolean',
                required: true,
                friendlyName: 'Enabled',
              },
              {
                name: 'text',
                helperText: 'The text of the CTA button for the unauthenticated hero image',
                type: 'text',
                required: true,
                friendlyName: 'CTA Text',
              },
              {
                name: 'href',
                helperText:
                  'The link to override the CTA button for the unauthenticated hero image',
                type: 'text',
                required: true,
                friendlyName: 'CTA Link',
              },
            ],
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
            name: 'ctaOverrideLink',
            helperText: 'The link to override the CTA button for the authenticated hero image',
            friendlyName: 'CTA Override Link',
            type: 'object',
            subFields: [
              {
                name: 'enabled',
                helperText: 'Whether the CTA override link is enabled',
                type: 'boolean',
                required: true,
                friendlyName: 'Enabled',
              },
              {
                name: 'text',
                helperText: 'The text of the CTA button for the authenticated hero image',
                type: 'text',
                required: true,
                friendlyName: 'CTA Text',
              },
              {
                name: 'href',
                helperText: 'The link to override the CTA button for the authenticated hero image',
                type: 'text',
                required: true,
                friendlyName: 'CTA Link',
              },
            ],
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
    ],
  },
)
