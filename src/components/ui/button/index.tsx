// originally bootstrapped using "npx shadcn-ui@latest add button" from https://ui.shadcn.com/docs/components/button
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ClassValue } from 'clsx'

import { cn } from '@/utils/web/cn'

export const buttonVariantsConfig = {
  variant: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80 antialiased',
    'primary-cta': 'bg-primary-cta text-primary-cta-foreground hover:bg-primary-cta/80 antialiased',
    'primary-cta-outline':
      'border-primary-cta text-primary-cta bg-purple-200 hover:bg-purple-200/80 antialiased',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline:
      'border text-fontcolor border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-slate-300',
    ghost: 'hover:bg-secondary text-fontcolor hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  size: {
    default: 'px-4 py-3',
    sm: 'py-2 px-3',
    lg: 'py-4 text-base px-8',
    icon: 'h-10 w-10',
  },
} satisfies Record<string, Record<string, ClassValue>>
const buttonVariants = cva(
  'inline-flex hover:no-underline items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: buttonVariantsConfig,
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={type}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
