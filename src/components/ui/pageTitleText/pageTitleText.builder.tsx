import { Builder } from '@builder.io/react'

import { PageTitle } from '@/components/ui/pageTitleText'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

type BuilderPageTitleProps = BuilderComponentBaseProps & React.HTMLAttributes<HTMLHeadingElement>

Builder.registerComponent(
  (props: BuilderPageTitleProps) => (
    <PageTitle {...props.attributes} key={props.attributes?.key}>
      {props.children}
    </PageTitle>
  ),
  {
    name: 'PageTitle',
    friendlyName: 'Page Title',
    noWrap: true,
    inputs: [
      {
        name: 'text',
        type: 'string',
        required: true,
        defaultValue: 'Enter some text...',
      },
    ],
  },
)
