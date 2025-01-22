import { Builder } from '@builder.io/react'
import { VariantProps } from 'class-variance-authority'

import { AsVariantsConfig, PageTitle, pageTitleVariants } from '@/components/ui/pageTitleText'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

type BuilderPageTitleProps = BuilderComponentBaseProps &
  VariantProps<typeof pageTitleVariants> &
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
    withoutBalancer?: boolean
  }

Builder.registerComponent(
  (props: BuilderPageTitleProps) => (
    <PageTitle {...props.attributes} key={props.attributes?.key}>
      {props.children}
    </PageTitle>
  ),
  {
    name: 'PageTitle',
    canHaveChildren: true,
    friendlyName: 'Page Title',
    noWrap: true,
    inputs: [
      {
        name: 'as',
        type: 'enum',
        defaultValue: 'h2',
        enum: AsVariantsConfig,
      },
      {
        name: 'withoutBalancer',
        type: 'boolean',
        defaultValue: true,
      },
    ],
    defaultChildren: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Text',
          options: {
            text: 'I am a page title',
          },
        },
      },
    ],
  },
)
