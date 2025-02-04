import { Builder } from '@builder.io/react'

import {
  AsVariantsConfig,
  PageSubTitle,
  subTitleVariantsConfig,
} from '@/components/ui/pageSubTitle'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface BuilderPageSubtitleProps extends BuilderComponentBaseProps {
  title: string
  as: (typeof AsVariantsConfig)[number]
  size: keyof typeof subTitleVariantsConfig.size
}

Builder.registerComponent(
  (props: BuilderPageSubtitleProps) => (
    <PageSubTitle {...props.attributes} as={props.as} key={props.attributes?.key} size={props.size}>
      {props.title}
    </PageSubTitle>
  ),
  {
    name: 'PageSubTitle',
    friendlyName: 'Page Subtitle',
    noWrap: true,
    inputs: [
      {
        name: 'title',
        type: 'string',
        required: true,
        defaultValue: 'Enter some text...',
      },
      {
        name: 'size',
        type: 'enum',
        defaultValue: subTitleVariantsConfig.size.md,
        enum: Object.keys(subTitleVariantsConfig.size),
      },
      {
        name: 'as',
        type: 'enum',
        defaultValue: 'h2',
        enum: AsVariantsConfig,
        advanced: true,
      },
    ],
  },
)
