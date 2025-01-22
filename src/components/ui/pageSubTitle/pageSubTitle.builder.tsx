import { Builder } from '@builder.io/react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

type BuilderPageSubtitleProps = BuilderComponentBaseProps & React.HTMLAttributes<HTMLHeadingElement>

Builder.registerComponent(
  (props: BuilderPageSubtitleProps) => (
    <PageSubTitle {...props.attributes} key={props.attributes?.key}>
      {props.children}
    </PageSubTitle>
  ),
  {
    name: 'PageSubTitle',
    friendlyName: 'Page Subtitle',
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
