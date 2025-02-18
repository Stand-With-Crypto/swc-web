import { Builder } from '@builder.io/react'
import { format } from 'date-fns'

import {
  AsVariantsConfig,
  PageSubTitle,
  subTitleVariantsConfig,
} from '@/components/ui/pageSubTitle'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface SubtitleCommonProps extends BuilderComponentBaseProps {
  as: (typeof AsVariantsConfig)[number]
  size: keyof typeof subTitleVariantsConfig.size
  withoutBalancer?: boolean
}

interface TextSubtitleProps extends SubtitleCommonProps {
  type: 'text'
  title: string
}

interface DateSubtitleProps extends SubtitleCommonProps {
  type: 'date'
  format: string
  date: string
}

type SubtitleProps = TextSubtitleProps | DateSubtitleProps

const DEFAULT_SUBTITLE_DATE_FORMAT = 'MMMM d, yyyy'

Builder.registerComponent(
  (props: SubtitleProps) => (
    <PageSubTitle
      {...props.attributes}
      as={props.as}
      key={props.attributes?.key}
      size={props.size}
      withoutBalancer={props.withoutBalancer}
    >
      {props.type === 'date'
        ? format(new Date(props.date), props.format ?? DEFAULT_SUBTITLE_DATE_FORMAT)
        : props.title}
    </PageSubTitle>
  ),
  {
    name: 'PageSubTitle',
    friendlyName: 'Page Subtitle',
    noWrap: true,
    inputs: [
      {
        name: 'type',
        type: 'enum',
        enum: ['text', 'date'],
        defaultValue: 'text',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        required: true,
        defaultValue: 'Enter some text...',
        showIf: options => options.get('type') === 'text',
      },
      {
        name: 'date',
        type: 'date',
        required: true,
        defaultValue: new Date().toISOString(),
        helperText: "You can customize the date's format in the Advanced Options tab",
        showIf: options => options.get('type') === 'date',
      },
      {
        name: 'format',
        type: 'string',
        defaultValue: DEFAULT_SUBTITLE_DATE_FORMAT,
        helperText: 'Visit https://dub.sh/l1Bige3 to learn more about date formats',
        advanced: true,
        showIf: options => options.get('type') === 'date',
      },
      {
        name: 'size',
        type: 'enum',
        defaultValue: 'md',
        enum: Object.keys(subTitleVariantsConfig.size),
      },
      {
        name: 'as',
        type: 'enum',
        defaultValue: 'h2',
        helperText: 'The HTML tag to use for the subtitle',
        enum: AsVariantsConfig,
        advanced: true,
      },
      {
        name: 'withoutBalancer',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Whether to disable the balancer for the subtitle',
        advanced: true,
      },
    ],
  },
)
