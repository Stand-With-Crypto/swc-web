import { Builder } from '@builder.io/react'

import { YouTube } from '@/components/app/youtube'
import { BuilderComponentBaseProps } from '@/utils/web/builder'

interface Props extends BuilderComponentBaseProps {
  videoId: string
  title: string
  allowFullScreen?: boolean
  autoplay?: boolean
  muted?: boolean
}

Builder.registerComponent(
  ({ videoId, title, attributes, allowFullScreen, autoplay, muted }: Props) => {
    return (
      <YouTube
        {...attributes}
        allowFullScreen={allowFullScreen}
        autoplay={autoplay}
        key={attributes?.key}
        muted={muted}
        title={title}
        videoId={videoId}
      />
    )
  },
  {
    name: 'Youtube Video',
    noWrap: true,
    inputs: [
      {
        name: 'title',
        type: 'string',
        required: true,
        helperText: 'The title of the YouTube video',
      },
      {
        name: 'videoId',
        type: 'string',
        required: true,
        helperText: 'The ID of the YouTube video to display',
      },
      {
        name: 'autoplay',
        friendlyName: 'Auto Play',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Automatically play the video when the page loads',
      },
      {
        name: 'muted',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Automatically mute the video when it plays',
      },
      {
        name: 'allowFullScreen',
        friendlyName: 'Allow Full Screen',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Allow the video to be played in full screen',
      },
    ],
  },
)
