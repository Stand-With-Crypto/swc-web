import { Builder, withChildren } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { cn } from '@/utils/web/cn'

export function Container(props: { children: React.ReactNode }) {
  return (
    <div {...props} className={cn('container')}>
      {props.children}
    </div>
  )
}

Builder.registerComponent(
  withChildren(({ children, attributes }: BuilderComponentBaseProps) => (
    <Container {...attributes}>{children}</Container>
  )),
  {
    name: 'Container',
    noWrap: true, // Disables the default "Link URL" field
    canHaveChildren: true,
  },
)
