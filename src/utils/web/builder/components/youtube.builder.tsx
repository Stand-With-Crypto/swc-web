import { Builder } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder/types'

interface YoutubeProps {
  videoId: string
  width?: string
  height?: string
  aspectRatio?: number
  style?: React.CSSProperties
  controls?: boolean
  allowFullScreen?: boolean
  start?: number
}

// Its recommended to use the default aspect ratio of 16/9
// To calculate the aspect ratio, divide the height by the width
export const DEFAULT_ASPECT_RATIO = 9 / 16

function Youtube({
  videoId,
  height = '100%',
  width = '100%',
  aspectRatio,
  style,
  controls = true,
  allowFullScreen = true,
  start = 0,
  ...props
}: YoutubeProps) {
  // https://developers.google.com/youtube/player_parameters
  const params = {
    playsinline: '1',
    iv_load_policy: '3',
    controls: controls ? '1' : '0',
    fs: allowFullScreen ? '1' : '0',
    start: String(start),
  }

  const urlParams = new URLSearchParams(params)

  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${urlParams.toString()}`

  return (
    <iframe
      {...props}
      height={height}
      loading="lazy"
      src={videoUrl}
      style={{
        ...style,
        aspectRatio: aspectRatio,
      }}
      width={width}
    />
  )
}

Builder.registerComponent(
  (props: BuilderComponentBaseProps & Omit<YoutubeProps, 'style'>) => {
    const youtubeProps: YoutubeProps = {
      videoId: props.videoId,
      width: props.width,
      height: props.height,
      aspectRatio: 100 / Number(props.aspectRatio),
      controls: props.controls,
      allowFullScreen: props.allowFullScreen,
      start: props.start,
    }

    return <Youtube {...props.attributes} {...youtubeProps} key={props.attributes?.key} />
  },
  {
    name: 'Youtube',
    noWrap: true,
    inputs: [
      {
        name: 'videoId',
        type: 'string',
        required: true,
        helperText: 'youtube.com/embed/VIDEO_ID or youtube.com/watch?v=VIDEO_ID',
      },
      {
        name: 'aspectRatio',
        type: 'range',
        friendlyName: 'Aspect Ratio',
        // Builder.io range field is limited and we cannot set the min and max values and step
        // So we need to convert the aspect ratio to a percentage
        defaultValue: String(DEFAULT_ASPECT_RATIO * 100),
      },
      {
        name: 'start',
        type: 'number',
        friendlyName: 'Start Time',
        helperText: 'The time in seconds at which the video should start playing',
        defaultValue: 0,
      },
      {
        name: 'controls',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Indicates whether the video player controls are displayed',
      },
      {
        name: 'allowFullScreen',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Allow the video to be played in full screen',
        friendlyName: 'Allow Full Screen',
        showIf: options => options.get('controls') === true,
      },
      {
        name: 'width',
        type: 'string',
        advanced: true,
        defaultValue: '100%',
      },
      {
        name: 'height',
        type: 'string',
        advanced: true,
        defaultValue: '100%',
      },
    ],
  },
)
