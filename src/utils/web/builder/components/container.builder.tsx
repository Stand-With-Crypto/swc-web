import { Builder, withChildren } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { BuilderComponentAttributes } from '@/utils/web/builder/types'
import { cn } from '@/utils/web/cn'

interface ContainerProps {
  children?: React.ReactNode
}

export function Container(props: ContainerProps & BuilderComponentAttributes) {
  return (
    <div {...props} className={cn('container', props.className)}>
      {props.children}
    </div>
  )
}

Builder.registerComponent(
  withChildren(({ children, attributes }: BuilderComponentBaseProps) => (
    <Container {...attributes} key={attributes?.key}>
      {children}
    </Container>
  )),
  {
    name: 'Container',
    noWrap: true, // Disables the default "Link URL" field
    canHaveChildren: true,
  },
)
