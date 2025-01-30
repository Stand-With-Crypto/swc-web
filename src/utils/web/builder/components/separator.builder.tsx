import { Builder } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder/types'

Builder.registerComponent(
  ({ attributes }: BuilderComponentBaseProps) => <hr {...attributes} key={attributes?.key} />,
  {
    name: 'Separator',
    noWrap: true,
    canHaveChildren: false,
  },
)
