import { Builder, withChildren } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'

function Container(props: { children: React.ReactNode }) {
  return (
    <div {...props} className="container">
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
    canHaveChildren: true,
  },
)
