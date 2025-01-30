import { Builder, withChildren } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { cn } from '@/utils/web/cn'

Builder.registerComponent(
  withChildren(({ children, attributes }: BuilderComponentBaseProps) => (
    <div {...attributes} className={cn('container', attributes?.className)} key={attributes?.key}>
      {children}
    </div>
  )),
  {
    name: 'Container',
    noWrap: true, // Disables the default "Link URL" field
    canHaveChildren: true,
  },
)
