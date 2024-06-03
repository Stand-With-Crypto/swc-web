import React from 'react'
import { Button as EmailButton, ButtonProps as EmailButtonProps } from '@react-email/components'
import { cva, VariantProps } from 'class-variance-authority'
import { ClassValue } from 'clsx'

import { cn } from '@/utils/web/cn'

export const buttonVariantsConfig = {
  variant: {
    default: 'bg-primary text-primary-foreground',
    'primary-cta': 'bg-primary-cta text-primary-cta-foreground',
    'primary-cta-outline': 'border-primary-cta text-primary-cta bg-purple-200',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border text-fontcolor border-input bg-background',
    secondary: 'bg-secondary text-secondary-foreground',
    ghost: 'text-fontcolor',
    link: 'text-primary underline-offset-4',
  },
  noPadding: {
    false: '',
    true: 'px-0 py-0',
  },
  color: {
    default: '',
    muted: 'text-muted-foreground',
  },
} satisfies Record<string, Record<string, ClassValue>>
const buttonVariants = cva('rounded-full text-sm font-medium px-6 py-3', {
  variants: buttonVariantsConfig,
  defaultVariants: {
    variant: 'default',
    color: 'default',
    noPadding: false,
  },
})

type ButtonProps = VariantProps<typeof buttonVariants> & EmailButtonProps

export function Button({
  variant,
  noPadding,
  color,
  className,
  ...props
}: React.PropsWithChildren<ButtonProps>) {
  return (
    <EmailButton
      {...props}
      className={cn(buttonVariants({ variant, color, noPadding, className }))}
    />
  )
}
