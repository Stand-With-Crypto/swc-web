import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/utils/web/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        'primary-cta': 'border-transparent bg-primary-cta text-primary-cta-foreground',
        'primary-cta-subtle': 'border-transparent bg-primary-cta/10 text-primary-cta',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        gray: 'border-transparent bg-muted-foreground text-white',
        'gray-subtle': 'border-transparent bg-gray-100/90 text-gray-700',
        blue: 'border-transparent bg-blue-500 text-white',
        'blue-subtle': 'border-transparent bg-blue-50 text-blue-500',
        purple: 'border-transparent bg-purple-500 text-white',
        'purple-subtle': 'border-transparent bg-purple-100/90 text-purple-700',
        amber: 'border-transparent bg-amber-400 text-black',
        'amber-subtle': 'border-transparent bg-amber-100 text-amber-800',
        red: 'border-transparent bg-red-500 text-white',
        'red-subtle': 'border-transparent bg-red-100 text-red-700',
        pink: 'border-transparent bg-pink-500 text-white',
        'pink-subtle': 'border-transparent bg-pink-100 text-pink-700',
        green: 'border-transparent bg-green-600 text-white',
        'green-subtle': 'border-transparent bg-green-100/90 text-green-700',
        teal: 'border-transparent bg-teal-600 text-white',
        'teal-subtle': 'border-transparent bg-teal-100 text-teal-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
