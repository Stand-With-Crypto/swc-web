import { Builder, withChildren } from '@builder.io/react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
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
  requireAuthentication?: boolean
}

Builder.registerComponent(
  withChildren((props: BuilderButtonProps) => {
    const buttonProps = {
      size: props.size,
      variant: props.variant,
      ...props.attributes,
    }

    let Comp = <Button {...buttonProps}>{props.children}</Button>

    if (props.link) {
      const { href, type } = props.link

      if (type === 'external') {
        Comp = (
          <Button {...buttonProps} asChild>
            <ExternalLink href={href}>{props.children}</ExternalLink>
          </Button>
        )
      } else if (type === 'internal') {
        Comp = (
          <Button {...buttonProps} asChild>
            <InternalLink href={href}>{props.children}</InternalLink>
          </Button>
        )
      }
    }

    if (props.requireAuthentication) {
      return (
        <LoginDialogWrapper
          authenticatedContent={Comp}
          loadingFallback={
            <Button {...buttonProps} disabled>
              {props.children}
            </Button>
          }
        >
          <Button {...buttonProps}>{props.children}</Button>
        </LoginDialogWrapper>
      )
    }

    return Comp
  }),
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
        name: 'requireAuthentication',
        friendlyName: 'Require authentication',
        type: 'boolean',
        helperText:
          'When enabled, the user will be prompted to login if they are not authenticated',
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
            // should always start with / or http(s)://
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
