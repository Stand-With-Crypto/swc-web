import { Builder } from '@builder.io/react'

import { AsVariantsConfig, PageTitle, titleVariantsConfig } from '@/components/ui/pageTitleText'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface BuilderPageTitleProps extends BuilderComponentBaseProps {
  title: string
  as: (typeof AsVariantsConfig)[number]
  size: keyof typeof titleVariantsConfig.size
  withoutBalancer?: boolean
}

Builder.registerComponent(
  (props: BuilderPageTitleProps) => (
    <PageTitle
      {...props.attributes}
      as={props.as}
      key={props.attributes?.key}
      size={props.size}
      withoutBalancer={props.withoutBalancer}
    >
      {props.title}
    </PageTitle>
  ),
  {
    name: 'PageTitle',
    friendlyName: 'Page Title',
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
        defaultValue: titleVariantsConfig.size.xl,
        enum: Object.keys(titleVariantsConfig.size),
      },
      {
        name: 'as',
        type: 'enum',
        defaultValue: 'h1',
        helperText: 'The HTML tag to use for the title',
        enum: AsVariantsConfig,
        advanced: true,
      },
      {
        name: 'withoutBalancer',
        type: 'boolean',
        defaultValue: false,
        helperText: 'Whether to disable the balancer for the title',
        advanced: true,
      },
    ],
  },
)
