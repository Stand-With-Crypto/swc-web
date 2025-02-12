'use client'

import ReactYouTube from 'react-youtube'
import { Builder } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'

interface Props extends BuilderComponentBaseProps {
  videoId: string
}

Builder.registerComponent(
  ({ videoId }: Props) => {
    return <ReactYouTube videoId={videoId} />
  },
  {
    name: 'Youtube Video',
    noWrap: true,
    inputs: [
      {
        name: 'videoId',
        type: 'string',
        required: true,
        helperText: 'The ID of the YouTube video to display',
      },
    ],
  },
)
