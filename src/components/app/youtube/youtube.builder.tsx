import { Builder } from '@builder.io/react'

import { DEFAULT_ASPECT_RATIO, YouTube } from '@/components/app/youtube'
import { BuilderComponentBaseProps } from '@/utils/web/builder'

interface Props extends BuilderComponentBaseProps {
  url: string
  aspectRatio: string
  start: number
  allowFullScreen: boolean
  controls: boolean
  loop: boolean
  muted: boolean
  autoplay: boolean
  playsinline: boolean
  volume: string
  overrideDefaultVolume: boolean
}

// TODO: Add volume control if muted is off and if override default value is on

Builder.registerComponent(
  (props: Props) => (
    <YouTube
      {...props.attributes}
      allowFullScreen={props.allowFullScreen}
      aspectRatio={100 / Number(props.aspectRatio)}
      key={props.attributes?.key}
      controls={props.controls}
      start={props.start}
      loop={props.loop}
      muted={props.muted}
      playsinline={props.playsinline}
      url={props.url}
      autoplay={!Builder.isEditing && props.autoplay}
      volume={props.overrideDefaultVolume && !props.muted ? Number(props.volume) / 100 : undefined}
    />
  ),
  {
    name: 'Youtube Video',
    noWrap: true,
    inputs: [
      {
        name: 'url',
        type: 'string',
        required: true,
        helperText: 'Any YouTube video URL',
      },
      {
        name: 'autoplay',
        friendlyName: 'Auto Play',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Automatically play the video when the page loads. Requires mute to work',
      },
      {
        name: 'muted',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Indicates whether the audio is muted',
      },
      {
        name: 'overrideDefaultVolume',
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
