import { Builder } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'

import {
  DEFAULT_ASPECT_RATIO,
  PlayerType,
  supportedVideoFitTypes,
  SupportedVideoTypes,
  VideoPlayer,
} from '.'

interface Props extends BuilderComponentBaseProps {
  type: SupportedVideoTypes
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
  width: string
  height: string
}

Builder.registerComponent(
  (props: Props) => {
    let playerType: PlayerType

    if (props.type === SupportedVideoTypes.YOUTUBE && props.videoId) {
      playerType = { type: SupportedVideoTypes.YOUTUBE, videoId: props.videoId }
    } else if (props.type === SupportedVideoTypes.VIDEO && props.video) {
      playerType = { type: SupportedVideoTypes.VIDEO, url: props.video }
    } else {
      return null
    }

    return (
      <VideoPlayer
        {...props.attributes}
        {...playerType}
        allowFullScreen={props.allowFullScreen}
        aspectRatio={100 / Number(props.aspectRatio)}
        autoplay={props.autoplay}
        controls={props.controls}
        height={props.height || undefined}
        key={props.attributes?.key}
        loop={props.loop}
        muted={props.muted}
        playsinline={props.playsinline}
        previewImage={props.posterImage}
        start={props.start}
        volume={
          props.overrideDefaultVolume && !props.muted ? Number(props.volume) / 100 : undefined
        }
        width={props.width || undefined}
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
        enum: [SupportedVideoTypes.YOUTUBE, SupportedVideoTypes.VIDEO],
        defaultValue: SupportedVideoTypes.VIDEO,
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
          'Image to display before the video plays. If Video type is Youtube and you want to use the default thumbnail, leave this field empty',
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
        name: 'playsinline',
        type: 'boolean',
        defaultValue: true,
        helperText: 'Allows video to play inline on iOS',
        friendlyName: 'Plays Inline',
        showIf: options => options.get('type') === 'video',
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
        name: 'fit',
        type: 'enum',
        enum: supportedVideoFitTypes,
        helperText: 'How the video should fit within the parent element',
        advanced: true,
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
