import { Builder, withChildren } from '@builder.io/react'

import { BuilderComponentBaseProps } from '@/utils/web/builder'

import { Container } from '.'

Builder.registerComponent(
  withChildren(({ children, attributes }: BuilderComponentBaseProps) => (
    <Container {...attributes}>{children}</Container>
  )),
  {
    name: 'Container',
    canHaveChildren: true,
  },
)
