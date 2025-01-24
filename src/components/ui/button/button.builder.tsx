import { Builder, withChildren } from '@builder.io/react'

import { ExternalLink, InternalLink } from '@/components/ui/link'
import type { BuilderComponentBaseProps } from '@/utils/web/builder'

import { Button, buttonVariantsConfig } from '.'

interface BuilderButtonProps extends BuilderComponentBaseProps {
  variant: keyof typeof buttonVariantsConfig.variant
  size: keyof typeof buttonVariantsConfig.size
  link?: {
    href: string
    type: 'internal' | 'external'
  }
}

Builder.registerComponent(
  withChildren((props: BuilderButtonProps) => {
    const buttonProps = {
      ...props.attributes,
      size: props.size,
      variant: props.variant,
    }

    const key = props.attributes?.key

    if (props.link) {
      const { href, type } = props.link

      if (type === 'external') {
        return (
          <Button {...buttonProps} asChild key={key}>
            <ExternalLink href={href}>{props.children}</ExternalLink>
          </Button>
        )
      }

      return (
        <Button {...buttonProps} asChild key={key}>
          <InternalLink href={href}>{props.children}</InternalLink>
        </Button>
      )
    }

    return (
      <Button {...buttonProps} key={key}>
        {props.children}
      </Button>
    )
  }),
  {
    name: 'Core:Button',
    noWrap: true, // Disables the default "Link URL" field
    canHaveChildren: true,
    override: true,
    inputs: [
      {
        name: 'variant',
        type: 'enum',
        defaultValue: 'default',
        enum: Object.keys(buttonVariantsConfig.variant),
        helperText: 'The button variant',
      },
      {
        name: 'size',
        type: 'enum',
        defaultValue: 'default',
        enum: Object.keys(buttonVariantsConfig.size),
        helperText: 'The button size',
      },
      {
        name: 'link',
        type: 'object',
        helperText: 'The link to navigate to when the button is clicked',
        subFields: [
          {
            name: 'href',
            type: 'string',
            helperText: 'The URL to navigate to',
            regex: {
              pattern: '^(/|https://)',
              message: 'The URL must start with / or https://',
            },
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['internal', 'external'],
            defaultValue: 'internal',
            helperText: 'Whether the link is internal or external',
          },
        ],
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
