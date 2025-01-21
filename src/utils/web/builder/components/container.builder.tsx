import { Builder, withChildren } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'
import { cn } from '@/utils/web/cn'
import { sanitizeBuilderAttributes } from '@/utils/web/builder/sanitizeBuilderAttributes'

export function Container(props: { children: React.ReactNode; className?: string }) {
  return (
    <div {...props} className={cn('container', props.className)}>
      {props.children}
    </div>
  )
}

Builder.registerComponent(
  withChildren(({ children, attributes }: BuilderComponentBaseProps) => (
    <Container {...sanitizeBuilderAttributes(attributes)}>{children}</Container>
  )),
  {
    name: 'Container',
    noWrap: true, // Disables the default "Link URL" field
    canHaveChildren: true,
  },
)
