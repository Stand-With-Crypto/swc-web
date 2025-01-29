import { Builder } from '@builder.io/react'

import { AsVariantsConfig, PageTitle, titleVariantsConfig } from '@/components/ui/pageTitleText'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

interface BuilderPageTitleProps extends BuilderComponentBaseProps {
  title: string
  as: (typeof AsVariantsConfig)[number]
  size: keyof typeof titleVariantsConfig.size
}

Builder.registerComponent(
  (props: BuilderPageTitleProps) => {
    const pageTitleProps = {
      ...props.attributes,
      as: props.as,
      size: props.size,
    }
    return (
      <PageTitle {...pageTitleProps} key={props.attributes?.key} size={props.size}>
        {props.title}
      </PageTitle>
    )
  },
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
        name: 'as',
        type: 'enum',
        defaultValue: 'h1',
        enum: AsVariantsConfig,
      },
      {
        name: 'size',
        type: 'enum',
        defaultValue: 'default',
        enum: Object.keys(titleVariantsConfig.size),
      },
    ],
  },
)
