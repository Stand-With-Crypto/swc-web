import { Builder } from '@builder.io/react'

import { VideoPlayer, DEFAULT_ASPECT_RATIO, PlayerType } from '.'
import { BuilderComponentBaseProps } from '@/utils/web/builder'

interface Props extends BuilderComponentBaseProps {
  type: PlayerType['type']
  video?: string
  videoId?: string
  aspectRatio: string
  start: number
  posterImage?: string
  allowFullScreen: boolean
  controls: boolean
  loop: boolean
  muted: boolean
  autoplay: boolean
  playsinline: boolean
  volume: string
  overrideDefaultVolume: boolean
}

const DEFAULT_VIDEO_TYPE: PlayerType['type'] = 'video'

const supportedVideoTypes: PlayerType['type'][] = ['youtube', 'video']

// TODO: add fit prop
// TODO: add width and height as advanced options
Builder.registerComponent(
  (props: Props) => {
    let playerType: PlayerType

    if (props.type === 'youtube') {
      playerType = { type: 'youtube', videoId: props.videoId! }
    } else {
      playerType = { type: 'video', url: props.video! }
    }

    return (
      <VideoPlayer
        {...props.attributes}
        {...playerType}
        allowFullScreen={props.allowFullScreen}
        aspectRatio={100 / Number(props.aspectRatio)}
        key={props.attributes?.key}
        controls={props.controls}
        start={props.start}
        loop={props.loop}
        muted={props.muted}
        playsinline={props.playsinline}
        autoplay={!Builder.isEditing && props.autoplay}
        previewImage={props.posterImage}
        volume={
          props.overrideDefaultVolume && !props.muted ? Number(props.volume) / 100 : undefined
        }
      />
    )
  },
  {
    name: 'Video',
    override: true,
    noWrap: true,
    inputs: [
      {
        name: 'type',
        type: 'enum',
        required: true,
        enum: supportedVideoTypes,
        defaultValue: DEFAULT_VIDEO_TYPE,
      },
      {
        name: 'videoId',
        type: 'string',
        required: true,
        helperText: 'youtube.com/embed/VIDEO_ID or youtube.com/watch?v=VIDEO_ID',
        showIf: options => options.get('type') === 'youtube',
      },
      {
        name: 'video',
        type: 'file',
        required: true,
        showIf: options => options.get('type') === 'video',
      },
      {
        name: 'autoplay',
        friendlyName: 'Auto Play',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Automatically play the video when the page loads. Requires mute to work',
      },
      {
        name: 'posterImage',
        friendlyName: 'Poster Image',
        type: 'file',
        helperText:
          'Image to display before the video plays. If Video type is Youtube, leave it empty to use the default thumbnail',
        showIf: options => options.get('autoplay') === false,
      },
      {
        name: 'muted',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Indicates whether the audio is muted',
      },
      {
        name: 'overrideDefaultVolume',
        friendlyName: 'Override Default Volume',
        type: 'boolean',
        showIf: options => options.get('muted') === false,
      },
      {
        name: 'volume',
        friendlyName: 'Default Volume',
        type: 'range',
        defaultValue: '50',
        showIf: options =>
          options.get('overrideDefaultVolume') === true && options.get('muted') === false,
      },
      {
        name: 'loop',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Indicates whether the video should start over again when it reaches the end',
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
      },
      {
        name: 'start',
        type: 'number',
        friendlyName: 'Start Time',
        helperText: 'The time in seconds at which the video should start playing',
        defaultValue: 0,
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
        name: 'playsinline',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Allows video to play inline on iOS',
        friendlyName: 'Plays Inline',
      },
    ],
  },
)
