import { Builder, withChildren } from '@builder.io/react'

import type { BuilderComponentBaseProps } from '@/utils/web/builder'

import { Button, buttonVariantsConfig } from '.'

interface BuilderButtonProps extends BuilderComponentBaseProps {
  variant: keyof typeof buttonVariantsConfig.variant
  size: keyof typeof buttonVariantsConfig.size
}

Builder.registerComponent(
  withChildren((props: BuilderButtonProps) => (
    <Button size={props.size} variant={props.variant} {...props.attributes}>
      {props.children}
    </Button>
  )),
  {
    name: 'Button',
    canHaveChildren: true,
    override: true,
    inputs: [
      {
        name: 'variant',
        type: 'enum',
        defaultValue: 'default',
        enum: Object.keys(buttonVariantsConfig.variant),
      },
      {
        name: 'size',
        type: 'enum',
        defaultValue: 'default',
        enum: Object.keys(buttonVariantsConfig.size),
      },
    ],
    defaultChildren: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: 'Text',
          options: {
            text: 'Click me!',
          },
        },
      },
    ],
  },
)
